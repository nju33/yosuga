/* @flow */
import fs from 'fs-extra';
import path from 'path';
import pGlob from 'glob-promise';
import pMap from 'p-map';
import pFilter from 'p-filter';
import pEvery from 'p-every';
import pReduce from 'p-reduce';
import matter from 'gray-matter';
import find from 'lodash.find';
import zipObject from 'lodash.zipobject';
import uniq from 'lodash.uniq';
import arrify from 'arrify';
import postcss from 'postcss';
import pkgDir from 'pkg-dir';
import toml from 'toml';
import aru from 'aru';
import {readonly} from 'core-decorators';
import killPort from 'kill-port';
import compiler from './compiler';
import Section from './section';
import Server from './server';
import View from './view';
import {Compiled} from './compiler';
// import type {Option, ArgSection} from './index.js.flow';

export interface Content {
  code: string;
  comparison: Compiled;
}
export type YosugaTarget = 'css' | 'less' | 'sass' | 'stylus' | 'postcss';
export type YosugaTargetDirs = {[target: YosugaTarget]: string};
export interface YosugaOptions {
  origin: string;
  port: number;
  main: YosugaTarget;
  base: string;
  targets: YosugaTarget[];
  targetDirs: YosugaTargetDirs;
  postcssPlugins: any[];
  accentColor: string;
  subColor: string;
  baseColor: string;
}
export type YosugaDefaultOptions = $Diff<
  YosugaOptions & {base: string, targets: any},
  YosugaOptions,
>;

export interface YosugaServerOptions {
  port: number;
  watch({srcDir: string}): string;
  force: boolean;
}

export default class Yosuga {
  sections: Section[];

  /**
   * Server used for development
   */
  server: Server;

  /**
   * Mainly Nuxt
   */
  view: View;

  /**
   * Option for Yosuga
   */
  opts: YosugaOptions;

  /**
   * Theme builder using Postcss
   */
  $css: any;

  /**
   * Directory paths
   * @prop lib Dirname for nuxt/lib
   * @prop data Filename for nuxt/lib/data.json
   * @prop opts Filename for nuxt/lib/opts.json
   * @prop style Dirname for nuxt/static/yosuga.css
   */
  _filepath: {
    lib: string,
    data: string,
    opts: string,
    style: string,
  };

  /**
   * Yosuga's default options
   */
  @readonly
  static defaultOpts: YosugaDefaultOptions = {
    origin: '/',
    port: 3333,
    main: 'css',
    targetDirs: {
      yosuga: 'yosuga',
      css: 'css',
      postcss: 'postcss',
      sass: 'sass',
      less: 'less',
      stylus: 'stylus',
    },
    postcssPlugins: [],
    accentColor: '#cb1b45',
    subColor: '#282425',
    baseColor: '#f3f3f3',
  };

  @readonly
  static defaultServeOpts: YosugaServerOptions = {
    port: 3333,
    watch({srcDir}) {
      return srcDir + '**/*';
    },
    force: true,
  };

  constructor(opts: any = Yosuga.defaultOpts) {
    this.sections = [];
    this.view = new View(opts);
    this.opts = {...Yosuga.defaultOpts, ...opts};
    this.$css = postcss.root();
    this.$css.append(
      postcss.atRule({
        name: 'charset',
        params: '"utf-8"',
      }),
    );
    this._filepath = {
      lib: path.join(__dirname, '../lib/view/lib/'),
      data: path.join(__dirname, '../lib/view/lib/data.json'),
      opts: path.join(__dirname, '../lib/view/lib/opts.json'),
      style: path.join(__dirname, '../lib/view/static/yosuga.css'),
    };
  }

  /**
   * Determine whether the target tool exists directory
   */
  async _getTargets(): Promise<YosugaTarget[]> {
    const result: YosugaTarget[] = [];
    if (
      await fs.pathExists(
        path.resolve(this.opts.base, this.opts.targetDirs.css),
      )
    ) {
      result.push('css');
    }
    if (
      await fs.pathExists(
        path.resolve(this.opts.base, this.opts.targetDirs.postcss),
      )
    ) {
      result.push('postcss');
    }
    if (
      await fs.pathExists(
        path.resolve(this.opts.base, this.opts.targetDirs.sass),
      )
    ) {
      result.push('sass');
    }
    if (
      await fs.pathExists(
        path.resolve(this.opts.base, this.opts.targetDirs.less),
      )
    ) {
      result.push('less');
    }
    if (
      await fs.pathExists(
        path.resolve(this.opts.base, this.opts.targetDirs.stylus),
      )
    ) {
      result.push('stylus');
    }

    return result;
  }

  async _getTargetContents(
    compiler,
    targets: YosugaTarget[],
  ): {[target: YosugaTarget]: {[filename: string]: Content}} {
    const items = await pMap(targets, async target => {
      const targetDirname = path.resolve(this.opts.base, target);

      const pattern = path.join(targetDirname, '**/*.*');
      const comparisonPattern = path.join(targetDirname, '**/*.yosuga.*');
      const filenames = await pGlob(pattern);
      const comparisonFilenames = await pGlob(comparisonPattern);
      const basenames = filenames
        .filter(filename => !filename.includes('.yosuga.'))
        .map(filename => {
          const extname = path.extname(filename);
          return path.basename(filename, extname);
        });

      const contents = await pMap(filenames, async filename => {
        const code = await fs.readFile(filename, 'utf-8');
        let css = code;
        if (path.extname(filename) === '.css') {
          css = await compiler.standardize(code);
        }
        return {
          code,
          comparison: {css},
        };
      });
      const map = zipObject(basenames, contents);

      await pMap(comparisonFilenames, async filename => {
        const extname = path.extname(filename);
        const key = path.basename(filename, `.yosuga${extname}`);
        map[key].comparison = await compiler[extname](filename, 'output.css');
        // eslint-disable-next-line no-warning-comments
        // TODO: sourcemap merge
        map[key].comparison.css = await compiler.standardize(
          map[key].comparison.css,
        );
      });

      return map;
    });

    const readyState = zipObject(targets, items);
    const targetSectionKeys = Object.keys(readyState[this.opts.main]);

    targetSectionKeys.forEach(key => {
      const items = this._getComparisonBy(readyState, key);
      // console.log(items);
      const valid = this._diff(items);
      if (!valid) {
        for (const content of (Object.values(readyState): any)) {
          delete content[key];
        }
      }
    });

    return readyState;
  }

  _getComparisonBy(
    map: {[target: YosugaTarget]: {[filename: string]: Content}},
    key: string,
  ): Compiled[] {
    const groups: any = Object.values(map);
    return groups.map((items: {[filename: string]: Content}) => {
      return items[key].comparison;
    });
  }

  _diff(comparisonItems: Compiled[]): boolean {
    const baseItem = comparisonItems[0];

    return comparisonItems.slice(1).every(item => {
      return baseItem.css === item.css;
    });
  }

  async _getSections(basenames: string[]): Promise<Section[]> {
    // eslint-disable-next-line no-return-await
    return await pMap(basenames, async name => {
      const filePattern = path.join(
        this.opts.base,
        (this.opts.targetDirs: any).yosuga,
        `*${name}.html`,
      );
      const [filename] = await pGlob(filePattern);
      if (!filename) {
        throw new Error(`ERR! ${name}.html was not found`);
      }
      const content = await fs.readFile(filename, 'utf-8');
      const result = matter(content, {
        language: 'toml',
        engines: {
          toml: {
            parse: toml.parse.bind(toml),
          },
        },
      });
      const parsed = path.parse(filename);
      parsed.base = parsed.base.replace(/^\d+[.:|]/, '');
      result.filename = path.format((parsed: any));

      return new Section(result);
    });
  }

  async prepare(): Promise<void> {
    if (this.opts.base === undefined) {
      this.opts.base = await pkgDir(process.cwd());
    }

    // const sectionPath = path.resolve(this.opts.base, 'yosuga/*.html');
    // const sectionHtmlFilenames = await pGlob(sectionPath);
    const targets = await this._getTargets();
    const targetContents = await this._getTargetContents(compiler, targets);
    const validKeys = Object.keys(targetContents[this.opts.main]);

    if (validKeys.length === 0) {
      throw new Error('ERR! There is no valid item');
    }

    // const sectionFilenamePattern = path.join(
    //   this.opts.base,
    //   `yosuga/+(${validKeys.join('|')}).html`,
    // );
    this.sections = await this._getSections(validKeys);

    // const contents = await pMap(sectionHtmlFilenames, async filename => {
    //   const content = await fs.readFile(filename, 'utf-8');
    //   const result = matter(content, {
    //     language: 'toml',
    //     engines: {
    //       toml: {
    //         parse: toml.parse.bind(toml),
    //       },
    //     },
    //   });
    //
    //   const parsed = path.parse(filename);
    //   parsed.base = parsed.base.replace(/^\d+[.:|]/, '');
    //   result.filename = path.format((parsed: any));
    //
    //   return result;
    // });

    // const sections = await this._classifySection(contents);
    // await pMap(Object.values(sections), async s => {
    //   const data = await s.compile();
    //   await s.isValid(data);
    //   this.$css.append(postcss.parse(s.css));
    // });

    // console.log(sections);

    // this.sections = sections.reduce((result, section) => {
    //   const s = sections[section.name];
    //   if (typeof s === 'undefined') {
    //     throw new TypeError(`${section.name} section was not found`);
    //   }
    //   result.push(s);
    //   return result;
    // }, []);
  }

  async serve(opts: {[string]: any}) {
    opts = {...Yosuga.defaultServeOpts, ...opts};
    const nuxt = await this.view.build();

    this.server = new Server({
      port: opts.port,
      watch: (() =>
        typeof opts.watch === 'function'
          ? arrify(opts.watch(this.view.config))
          : arrify(opts.watch))(),
      middleware: [
        async (req: any, res: any, next: any) => {
          try {
            await nuxt.render(req, res);
          } catch (err) {}
          await next();
        },
      ],
    });

    try {
      await fs.ensureDir(this._filepath.lib);

      const data = this.sections.map(s => {
        return s.data;
      });
      await fs.writeFile(this._filepath.data, JSON.stringify(data));
      await fs.writeFile(this._filepath.opts, JSON.stringify(this.opts));
      await fs.writeFile(this._filepath.style, this.$css.toString());
    } catch (err) {
      console.log(err);
    }

    if (opts.force) {
      await killPort(opts.port);
    }
    this.server.serve();
  }

  async generate() {
    await aru('dataFile', fs.access(this._filepath.lib, fs.constants.F_OK));
    await aru.left('dataFile', async () => {
      await fs.mkdir(this._filepath.lib);
    });

    const data = this.sections.map(s => {
      return s.data;
    });
    await fs.writeFile(this._filepath.data, JSON.stringify(data));
    await fs.writeFile(this._filepath.opts, JSON.stringify(this.opts));
    await fs.writeFile(this._filepath.style, this.$css.toString());
    try {
      await fs.access(this._filepath.data, fs.constants.F_OK);
      const rawData = await fs.readFile(this._filepath.data, 'utf-8');
      const data = JSON.parse(rawData);
      await this.view.generate(data);
    } catch (err) {}
  }

  async _classifySection($s_: ArgSection[]): Promise<{[string]: Section}> {
    const sections = {};
    // const targets$ = uniq(['html', 'css', ...this.opts.targets]);
    const targets$ = [];

    await pMap(targets$, async target => {
      const files = await this._getTargetFiles(target);

      await pMap(files, async filename => {
        const {ext: extname} = path.parse(filename);
        const basename = path.basename(filename, extname);
        if (typeof sections[basename] === 'undefined') {
          const $section = find($s_, {name: basename}) || {};
          sections[basename] = new Section(
            this.opts.main,
            $section.name,
            $section.description,
            this.opts.postcssPlugins,
          );
        }
        const content = await this._getContent(filename);
        sections[basename].set(target, content, filename);
      });
    });

    return sections;
  }

  _isStaticTarget(target: string) {
    return target === 'html' || target === 'css';
  }

  async _getTargetFiles(target: string): Promise<string[]> {
    const pattern = path.join(this.opts.base, target, '**/*');
    const $files = await pGlob(pattern);
    if (this._isStaticTarget(target)) {
      return $files;
    }

    return $files.filter(f => {
      const extname = path.extname(f);
      return !path.basename(f, extname).endsWith('$');
    });
  }

  async _getContent(file: string): Promise<string> {
    const content = await fs.readFile(file, 'utf-8');
    return content;
  }
}
