// @flow

import $fs from 'fs';
import path from 'path';
import pify from 'pify';
import $glob from 'glob';
import pMap from 'p-map';
import find from 'lodash.find';
import uniq from 'lodash.uniq';
import arrify from 'arrify';
import postcss from 'postcss';
import aru from 'aru';
import {readonly} from 'core-decorators';
import killPort from 'kill-port';
import Section from './section';
import Server from './server';
import View from './view';
import type {Option, ArgSection} from './index.js.flow';

const fs = pify($fs);
const glob = pify($glob);

export default class Yosuga {
  sections: Section[];
  server: Server;
  view: View;
  opts: Option;
  $css: any;
  __filepath: {[name: string]: string};

  @readonly
  static defaultOpts: {[string]: string | string[]} = {
    origin: '/',
    main: 'css',
    base: path.resolve('styles'),
    targets: ['less', 'scss', 'stylus', 'postcss'],
    postcssPlugins: [],
    accentColor: '#cb1b45',
    subColor: '#282425',
    baseColor: '#f3f3f3'
  }

  constructor(opts: Option = Yosuga.defaultOpts) {
    this.sections = [];
    this.view = new View(opts);
    this.opts = Object.assign({}, Yosuga.defaultOpts, opts);
    this.$css = postcss.root();
    this.$css.append(postcss.atRule({
      name: 'charset',
      params: '"utf-8"'
    }));
    this.__filepath = {
      lib: path.join(__dirname, '../lib/view/lib/'),
      data: path.join(__dirname, '../lib/view/lib/data.json'),
      opts: path.join(__dirname, '../lib/view/lib/opts.json'),
      style: path.join(__dirname, '../lib/view/static/yosuga.css')
    };
  }

  async process($argSections: ArgSection[] | null = null): Promise<void> {
    if ($argSections === null) {
      throw new Error('sections must be required');
    }

    const $sections = await this.__classifySection($argSections);
    await pMap(Object.values($sections), async s => {
      const data = await s.compile();
      await s.isValid(data);
      this.$css.append(postcss.parse(s.css));
    });

    this.sections = $argSections.reduce((result, s_) => {
      const s = $sections[s_.name];
      if (typeof s === 'undefined') {
        throw new TypeError(`${s_.name} section was not found`);
      }
      result.push(s);
      return result;
    }, []);
  }

  async serve(opts: {[string]: any}) {
    const nuxt = await this.view.build();
    this.server = new Server({
      port: opts.port,
      watch: (() => {
        if (typeof opts.watch === 'function') {
          return arrify(opts.watch(this.view.config));
        }
        return arrify(opts.watch);
      })(),
      middleware: [
        async (req: any, res: any, next: () => any) => {
          await nuxt.render(req, res);
          next();
        }
      ]
    });

    const f_ = this.__filepath;

    await aru('dataFile', fs.access(f_.lib, fs.constants.F_OK));
    await aru.left('dataFile', async () => {
      await fs.mkdir(f_.lib);
    });

    const data = this.sections.map(s => {
      return s.data;
    });
    await fs.writeFile(f_.data, JSON.stringify(data));
    await fs.writeFile(f_.opts, JSON.stringify(this.opts));
    await fs.writeFile(f_.style, this.$css.toString());

    if (opts.force) {
      await killPort(opts.port);
    }
    this.server.serve();
  }

  async generate() {
    const f_ = this.__filepath;

    await aru('dataFile', fs.access(f_.lib, fs.constants.F_OK));
    await aru.left('dataFile', async () => {
      await fs.mkdir(f_.lib);
    });

    const data = this.sections.map(s => {
      return s.data;
    });
    await fs.writeFile(f_.data, JSON.stringify(data));
    await fs.writeFile(f_.opts, JSON.stringify(this.opts));
    await fs.writeFile(f_.style, this.$css.toString());
    try {
      await fs.access(this.__filepath.data, fs.constants.F_OK);
      const rawData = await fs.readFile(this.__filepath.data, 'utf-8');
      const data = JSON.parse(rawData);
      await this.view.generate(data);
    } catch (err) {}
  }

  async __classifySection($s_: ArgSection[]): Promise<{[string]: Section}> {
    const sections = {};
    const targets$ = uniq(['html', 'css', ...this.opts.targets]);

    await pMap(targets$, async target => {
      const files = await this.__getTargetFiles(target);

      await pMap(files, async filename => {
        const {ext: extname} = path.parse(filename);
        const basename = path.basename(filename, extname);
        if (typeof sections[basename] === 'undefined') {
          const $section = find($s_, {name: basename}) || {};
          sections[basename] = new Section(
            this.opts.main,
            $section.name,
            $section.description,
            this.opts.postcssPlugins
          );
        }
        const content = await this.__getContent(filename);
        sections[basename].set(target, content, filename);
      });
    });

    return sections;
  }

  __isStaticTarget(target: string) {
    return target === 'html' || target === 'css';
  }

  async __getTargetFiles(target: string): Promise<string[]> {
    const pattern = path.join(this.opts.base, target, '**/*');
    const $files = await glob(pattern);
    if (this.__isStaticTarget(target)) {
      return $files;
    }

    return $files.filter(f => {
      const extname = path.extname(f);
      return !path.basename(f, extname).endsWith('$');
    });
  }

  async __getContent(file: string): Promise<string> {
    const content = await fs.readFile(file, 'utf-8');
    return content;
  }
}
