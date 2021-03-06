/* @flow */
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import t from 'flow-runtime';
import beautify from 'js-beautify';
import fastDiff from 'fast-diff';
import marked from 'marked';
import pGlob from 'glob-promise';
import pMap from 'p-map';
import matter from 'gray-matter';
import zipObject from 'lodash.zipobject';
import uniq from 'lodash.uniq';
import pkgDir from 'pkg-dir';
import delay from 'delay';
// import puppeteer from 'puppeteer';
import toml from 'toml';
import aru from 'aru';
import {readonly} from 'core-decorators';
import compiler from './compiler';
import Section from './section';
import Server from './server';
import View from './view';
import {Compiled} from './compiler';

export interface Content {
  code: string;
  comparison: Compiled;
}
export type YosugaTarget = 'css' | 'less' | 'sass' | 'stylus' | 'postcss';
export type YosugaDirs = {[target: YosugaTarget]: string};
export interface YosugaContents {
  readme: boolean;
}
export interface YosugaOptions {
  icon?: string;
  name?: string;
  port: number;
  main: YosugaTarget;
  ignore?: RegExp;
  base: string;
  dirs: YosugaDirs;
  style: {
    fontSize?: string,
    accentColor?: string,
  };
  contents: YosugaContents;
}

// ¯\_(ツ)_/¯
export type YosugaDefaultOptions = $Diff<
  YosugaOptions & {
    base: string,
    targets: any,
    style: {
      fontSize?: string,
      accentColor?: string,
    },
  },
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
  // $css: any;

  /**
   * Whether the server is built
   */
  _served: boolean;

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
    icon: 'icon.png',
    port: 3333,
    main: 'css',
    dirs: {
      yosuga: 'yosuga',
      css: 'css',
      postcss: 'postcss',
      sass: 'sass',
      less: 'less',
      stylus: 'stylus',
    },
    style: {
      fontSize: '13px',
      accentColor: '#cb1b45',
    },
    contents: {
      readme: true,
    },
  };

  _validate(opts: any) {
    const str = t.string();
    const num = t.number();
    const bool = t.boolean();

    t
      .object(
        t.property('icon', str, true),
        t.property('name', str, true),
        t.property('port', num, true),
        t.property(
          'main',
          t.union(
            t.string('css'),
            t.string('postcss'),
            t.string('sass'),
            t.string('less'),
            t.string('stylus'),
          ),
        ),
        t.property('ignore', t.type('RegExp', t.ref('RegExp')), true),
        t.property(
          'dirs',
          t.object(
            t.property('yosuga', str, true),
            t.property('postcss', str, true),
            t.property('sass', str, true),
            t.property('less', str, true),
            t.property('stylus', str, true),
          ),
          true,
        ),
        t.property(
          'style',
          t.object(
            t.property('fontSize', str, true),
            t.property('accentColor', str, true),
          ),
          true,
        ),
        t.property(
          'contents',
          t.object(t.property('readme', bool, true)),
          true,
        ),
      )
      .assert(opts);
  }

  constructor(opts: any = Yosuga.defaultOpts) {
    this._validate(opts);

    this.sections = [];
    this.view = new View(opts);
    this.opts = {...Yosuga.defaultOpts, ...opts};
    this.opts.style = {
      ...(Yosuga.defaultOpts: any).style,
      ...(opts.style || {}),
    };
    this.opts.contents = {
      ...(Yosuga.defaultOpts: any).contents,
      ...(opts.contents || {}),
    };
    this._filepath = {
      lib: path.join(__dirname, '../lib/view/lib/'),
      data: path.join(__dirname, '../lib/view/lib/data.json'),
      opts: path.join(__dirname, '../lib/view/lib/opts.json'),
      style: path.join(__dirname, '../lib/view/static/yosuga.css'),
    };
  }

  async _reset() {
    if (this.opts.icon) {
      const iconname = path.join(
        __dirname,
        '../lib/view/static',
        this.opts.icon,
      );
      if (await fs.pathExists(iconname)) {
        await fs.remove(iconname);
      }
    }

    if (await fs.pathExists(this._filepath.data)) {
      await fs.remove(this._filepath.data);
    }

    if (await fs.pathExists(this._filepath.opts)) {
      await fs.remove(this._filepath.opts);
    }
  }

  /**
   * Determine whether the target tool exists directory
   */
  async _getTargets(): Promise<YosugaTarget[]> {
    const result: YosugaTarget[] = [];
    if (await fs.pathExists(path.resolve(this.opts.base, this.opts.dirs.css))) {
      result.push('css');
    }
    if (
      await fs.pathExists(path.resolve(this.opts.base, this.opts.dirs.postcss))
    ) {
      result.push('postcss');
    }
    if (
      await fs.pathExists(path.resolve(this.opts.base, this.opts.dirs.sass))
    ) {
      result.push('sass');
    }
    if (
      await fs.pathExists(path.resolve(this.opts.base, this.opts.dirs.less))
    ) {
      result.push('less');
    }
    if (
      await fs.pathExists(path.resolve(this.opts.base, this.opts.dirs.stylus))
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
      const filenames = (await pGlob(pattern)).filter(
        filename => !filename.includes('.yosuga.'),
      );
      const comparisonFilenames = await pGlob(comparisonPattern);
      const basenames = filenames.map(filename => {
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
        const code = await fs.readFile(
          filename.replace('.yosuga', ''),
          'utf-8',
        );
        const altCode = await fs.readFile(filename, 'utf-8');
        map[key].altCode = altCode;
        map[key].comparison = await compiler[extname](
          filename,
          altCode,
          'output.css',
          code,
        );

        // eslint-disable-next-line no-warning-comments
        // TODO: sourcemap merge
        map[key].comparison.css = await compiler.standardize(
          map[key].comparison.css,
        );
      });

      return map;
    });

    const readyState = zipObject(targets, items);
    // section names
    // e.g.) [ 'button', 'card', 'nav', 'table' ]
    const targetSectionKeys = Object.keys(readyState[this.opts.main]);

    const result = targetSectionKeys.every(key => {
      const items: any = this._getComparisonBy(readyState, key);
      const valid = this._diff(items, key);
      if (!valid) {
        for (const content of (Object.values(readyState): any)) {
          delete content[key];
        }
      }
      return valid;
    });

    if (!result) {
      throw new Error(
        chalk.red('ERR! There are sections where each is not equal'),
      );
    }

    return readyState;
  }

  _getComparisonBy(
    map: {[target: YosugaTarget]: {[filename: string]: Content}},
    key: string,
  ): Compiled[] {
    const groups: any = Object.entries(map);
    return groups
      .map(([target, items]: [YosugaTarget, {[filename: string]: Content}]) => {
        const comparison = (items[key] || {}).comparison;
        if (comparison === undefined) {
          return undefined;
        }

        (comparison: any).target = target;
        return comparison;
      })
      .filter(comparison => comparison);
  }

  _diff(
    comparisonItems: (Compiled & {target: YosugaTarget})[],
    key: string,
  ): boolean {
    const baseItem = comparisonItems[0];

    return comparisonItems.slice(1).every(item => {
      const diffed = fastDiff(baseItem.css, item.css);

      if (diffed.length === 1) {
        return true;
      }

      const result = diffed
        .map(chunks => {
          switch (chunks[0]) {
            case -1: {
              return chalk.green(chunks[1]);
            }
            case 0:
            default: {
              return chunks[1];
            }
            case 1: {
              return chalk.red(chunks[1]);
            }
          }
        })
        .join('');

      if (process.env.NODE_ENV !== 'test') {
        console.log(chalk.bold(`${chalk.yellow('`' + key + '`')} is missing`));
        console.log(
          chalk.bold(
            `${chalk.gray(' - ')}${chalk.green(baseItem.target)}${chalk.gray(
              ' / ',
            )}${chalk.red(item.target)}`,
          ),
        );
        console.log();
        console.log(result);
        console.log();
        console.log();
        console.log();
      }
      return false;
    });
  }

  async _getSections(basenames: string[]): Promise<Section[]> {
    let filtered = basenames;
    if (this.opts.ignore !== undefined) {
      // $FlowFixMe: possibly undefined
      filtered = basenames.filter(name => !this.opts.ignore.test(name));
    }
    // eslint-disable-next-line no-return-await
    return await pMap(filtered, async name => {
      const filePattern = path.join(
        this.opts.base,
        (this.opts.dirs: any).yosuga,
        `${name}.html`,
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
      result.content = beautify.html(result.content, {indent_size: 2});

      return new Section(name, result);
    });
  }

  async _getReadme(): Promise<string> {
    const pkgDirname = await pkgDir(process.cwd());
    try {
      const content = await fs.readFile(
        path.join(pkgDirname, 'README.md'),
        'utf-8',
      );
      return marked(content);
    } catch (err) {
      console.log(err);
      process.exit(1);

      return '';
    }
  }

  async prepare(): Promise<void> {
    await this._reset();

    if (this.opts.name === '') {
      const pkgDirname = await pkgDir(process.cwd());
      try {
        const pkg = await fs.readJson(path.join(pkgDirname, 'package.json'));
        this.opts.name = pkg.name;
      } catch (_) {
        // default
        this.opts.name = 'Yosuga';
      }
    }

    if (this.opts.base === undefined) {
      this.opts.base = await pkgDir(process.cwd());
    }

    let targets = await this._getTargets();
    targets = uniq([this.opts.main, ...targets]);
    let targetContents;
    try {
      targetContents = await this._getTargetContents(compiler, targets);
    } catch (err) {
      return;
    }
    const validKeys = Object.keys(targetContents[this.opts.main]);

    if (validKeys.length === 0) {
      throw new Error('ERR! There is no valid item');
    }

    this.sections = await (this: any)._getSections(validKeys);

    this.sections.forEach(section => {
      section.items = targets
        .map(target => {
          if (target === this.opts.main) {
            section.css = targetContents[target][section.name].comparison.css;
          }

          if (targetContents[target][section.name] === undefined) {
            return undefined;
          }

          return {
            target,
            code: targetContents[target][section.name].code,
            altCode: targetContents[target][section.name].altCode,
          };
        })
        .filter(target => target);
    });
  }

  _exportData(): {[key: string]: any} {
    return {
      sections: this.sections.map(section => section.export()),
      readme: '',
    };
  }

  _exportOpts() {
    return {
      icon: this.opts.icon,
      title: this.opts.name,
      style: this.opts.style,
      readme: '',
    };
  }

  async _copyIconIfExists() {
    if (this.opts.icon) {
      const iconname = path.join(this.opts.base, this.opts.icon);
      if (await fs.pathExists(iconname)) {
        await fs.copyFile(
          iconname,
          // $FlowFixMe
          path.join(__dirname, '../lib/view/static/', this.opts.icon),
        );
      }
    }
  }

  async serve(port: ?number) {
    const data = this._exportData();
    if (this.opts.contents.readme) {
      const readme = await this._getReadme();
      data.readme = readme;
    }

    const opts = this._exportOpts();
    try {
      await fs.ensureDir(this._filepath.lib);
      await fs.writeFile(this._filepath.data, JSON.stringify(data));
      await fs.writeFile(this._filepath.opts, JSON.stringify(opts));
      await this._copyIconIfExists();
    } catch (err) {
      console.log(err);
    }

    if (this._served) {
      return;
    }

    const matches = Object.values(this.opts.dirs).map(dir => {
      // $FlowFixMe
      return path.join(
        this.opts.base,
        dir,
        '**/*.+(html|css|sass|scss|less|styl)',
      );
    });

    console.log(chalk.gray('watching...'));
    matches.forEach(match => {
      console.log(' - ' + match);
    });
    console.log();

    const nuxt = await this.view.build();

    this.server = new Server({
      port: port || this.opts.port,
      files: [
        {
          match: matches,
          fn: async () => {
            await this.prepare();
            await this.serve();
          },
        },
      ],
      middleware: [
        async (req: any, res: any, next: any) => {
          await nuxt.render(req, res);
          setTimeout(() => {
            next();
          }, 1000);
        },
      ],
    });

    this._served = true;
    await delay(3000);
    this.view.setRoutes(data.sections);
    await this.server.serve();
  }

  async generate(base?: string) {
    // const moduleDirname = await pkgDir(__dirname);
    await aru('dataFile', fs.access(this._filepath.lib, fs.constants.F_OK));
    await aru.left('dataFile', async () => {
      await fs.mkdir(this._filepath.lib);
    });

    const data = this._exportData();
    if (this.opts.contents.readme) {
      const readme = await this._getReadme();
      data.readme = readme;
    }

    const opts = this._exportOpts();
    await fs.writeFile(this._filepath.data, JSON.stringify(data));
    await fs.writeFile(this._filepath.opts, JSON.stringify(opts));
    await this._copyIconIfExists();

    this.view.dev(false);
    if (this.opts.name !== undefined) {
      this.view.setTitle(this.opts.name);
    }
    if (base !== undefined) {
      this.view.setBase(base);
    }

    try {
      await fs.access(this._filepath.data, fs.constants.F_OK);
      const rawData = await fs.readFile(this._filepath.data, 'utf-8');
      const data = JSON.parse(rawData);
      this.view.setRoutes(data.sections);

      //
      // for og:image
      //
      // this.view.config.dev = true;
      // await this.serve(3355);
      //
      // await delay(5000);
      // this.view.config.dev = false;
      //
      // const browser = await puppeteer.launch();
      // const page = await browser.newPage();
      // await fs.ensureDir(
      //   path.join(moduleDirname, 'lib/view/static/screenshots/sections'),
      // );
      // await page.setViewport({
      //   width: 1200,
      //   height: 630,
      // });
      // for (const route of ['', ...(this.view.config.generate: any).routes]) {
      //   if (route === '') {
      //     // eslint-disable-next-line no-await-in-loop
      //     await page.goto('http://localhost:3355');
      //     // eslint-disable-next-line no-await-in-loop
      //     await page.screenshot({
      //       path: path.join(
      //         moduleDirname,
      //         'lib/view/static/screenshots/index.png',
      //       ),
      //     });
      //   } else {
      //     // eslint-disable-next-line no-await-in-loop
      //     await page.goto('http://localhost:3355' + route);
      //     // eslint-disable-next-line no-await-in-loop
      //     await page.screenshot({
      //       path: path.join(
      //         moduleDirname,
      //         'lib/view/static/screenshots/',
      //         route + '.png',
      //       ),
      //     });
      //   }
      // }
      //
      // await browser.close();

      await this.view.generate();
      // this.server.exit();
      // process.exit();
    } catch (err) {
      console.log(err);
    }
  }
}
