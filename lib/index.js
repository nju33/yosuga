/* @flow */
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import fastDiff from 'fast-diff';
import pGlob from 'glob-promise';
import pMap from 'p-map';
import matter from 'gray-matter';
import zipObject from 'lodash.zipobject';
import uniq from 'lodash.uniq';
import postcss from 'postcss';
import pkgDir from 'pkg-dir';
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
export type YosugaTargetDirs = {[target: YosugaTarget]: string};
export interface YosugaOptions {
  origin: string;
  port: number;
  main: YosugaTarget;
  base: string;
  targets: YosugaTarget[];
  targetDirs: YosugaTargetDirs;
  // postcssPlugins: any[];
  accentColor: string;
  // subColor: string;
  // baseColor: string;
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
  // $css: any;

  /**
   * Whether the server is built
   */
  served: boolean;

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
    // postcssPlugins: [],
    accentColor: '#cb1b45',
    // subColor: '#282425',
    // baseColor: '#f3f3f3',
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
    // this.$css = postcss.root();
    // this.$css.append(
    //   postcss.atRule({
    //     name: 'charset',
    //     params: '"utf-8"',
    //   }),
    // );
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
        map[key].altCode = await fs.readFile(filename, 'utf-8');
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

      return new Section(name, result);
    });
  }

  async prepare(): Promise<void> {
    if (this.opts.base === undefined) {
      this.opts.base = await pkgDir(process.cwd());
    }

    let targets = await this._getTargets();
    targets = uniq([this.opts.main, ...targets]);
    const targetContents = await this._getTargetContents(compiler, targets);
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

  export(): any[] {
    return this.sections.map(section => section.export());
  }

  // async serve(opts: {[string]: any}) {
  async serve() {
    // opts = {...Yosuga.defaultServeOpts, ...opts};
    try {
      await fs.ensureDir(this._filepath.lib);
      await fs.writeFile(this._filepath.data, JSON.stringify(this.export()));
      await fs.writeFile(this._filepath.opts, JSON.stringify(this.opts));
      // await fs.writeFile(this._filepath.style, this.$css.toString());
    } catch (err) {
      console.log(err);
    }

    if (this.served) {
      return;
    }

    const matches = Object.values(this.opts.targetDirs).map(dir => {
      // $FlowFixMe
      return path.join(this.opts.base, dir, '**/*.+(css|sass|scss|less|styl)');
    });

    console.log(chalk.gray('watching...'));
    matches.forEach(match => {
      console.log(' - ' + match);
    });
    console.log();

    const nuxt = await this.view.build();

    this.server = new Server({
      // port: opts.port,
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
        async (req: any, res: any) => {
          await nuxt.render(req, res);
        },
      ],
    });

    this.served = true;
    setTimeout(() => {
      this.server.serve();
    }, 3000);
  }

  async generate(base?: string) {
    await aru('dataFile', fs.access(this._filepath.lib, fs.constants.F_OK));
    await aru.left('dataFile', async () => {
      await fs.mkdir(this._filepath.lib);
    });

    const data = this.sections.map(s => {
      return s.data;
    });
    await fs.writeFile(this._filepath.data, JSON.stringify(data));
    await fs.writeFile(this._filepath.opts, JSON.stringify(this.opts));
    // await fs.writeFile(this._filepath.style, this.$css.toString());

    if (base !== undefined) {
      this.view.setBase(base);
    }

    try {
      await fs.access(this._filepath.data, fs.constants.F_OK);
      const rawData = await fs.readFile(this._filepath.data, 'utf-8');
      const data = JSON.parse(rawData);
      await this.view.generate(data);
    } catch (err) {}
  }
}
