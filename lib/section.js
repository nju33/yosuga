// @flow

import $fs from 'fs';
import path from 'path';
import * as $diff from 'diff';
import chalk from 'chalk';
import memoize from 'fast-memoize';
import pify from 'pify';
import aru from 'aru';
import pMap from 'p-map';
import pFilter from 'p-filter';
import uniq from 'lodash.uniq';
import Case from 'case';
import marked from 'marked';
import windowSize from 'window-size';
import {decorate} from 'core-decorators';
import compiler from './compiler';

const fs = pify($fs);
const diffChars = memoize($diff.diffChars);

export default class Section {
  main: string;
  name: string;
  title: string;
  description: string;
  postcssPlugins: any[];
  html: string;
  items: {[target: string]: string};
  dirname: {[target: string]: string};
  filename: {[target: string]: string};
  altContent: {[target: string]: string};

  constructor(
    main: string,
    name: string,
    description: string = '',
    postcssPlugins: any[]
  ) {
    this.main = main;
    this.name = name;
    this.title = Case.capital(name);
    this.description = marked(description);
    this.postcssPlugins = postcssPlugins;
    this.html = '';
    this.items = {};
    this.dirname = {};
    this.filename = {};
    this.altContent = {};
  }

  get data(): {[string]: string | {[string]: string}} {
    return {
      main: this.main,
      name: this.name,
      title: this.title,
      description: this.description,
      html: this.html,
      items: this.items
    };
  }

  get css(): string {
    switch (this.main) {
      default:
      case 'css': {
        return this.items.css;
      }
      case 'postcss': {
        if (typeof this.altContent.postcss === 'undefined') {
          throw new Error(`
${this.__getAltFilename(this.filename.postcss)} was not found.
          `.trim());
        }
        return this.altContent.postcss;
      }
      case 'scss': {
        if (typeof this.altContent.scss === 'undefined') {
          throw new Error(`
${this.__getAltFilename(this.filename.scss)} was not found.
          `.trim());
        }
        return this.altContent.scss;
      }
      case 'less': {
        if (typeof this.altContent.less === 'undefined') {
          throw new Error(`
${this.__getAltFilename(this.filename.less)} was not found.
          `.trim());
        }
        return this.altContent.less;
      }
      case 'stylus': {
        if (typeof this.altContent.stylus === 'undefined') {
          throw new Error(`
${this.__getAltFilename(this.filename.stylus)} was not found.
          `.trim());
        }
        return this.altContent.stylus;
      }
    }
  }

  set(target: string, contents: string, filename: string) {
    if (target === 'html') {
      this.html = contents;
      return;
    }

    this.items[target] = contents;
    const {ext, base, dir} = path.parse(filename);
    this.dirname[target] = dir;
    this.filename[target] = filename;
  }

  @decorate(memoize)
  async __compilePostcss(content: string, plugins: any[]): Promise<string> {
    const compiled = await compiler.postcss(content, plugins);
    return compiled;
  }

  @decorate(memoize)
  async __compileScss(content: string, dirname: string): Promise<string> {
    const compiled = await compiler.scss(content, dirname);
    return compiled;
  }

  @decorate(memoize)
  async __compileLess(content: string, dirname: string): Promise<string> {
    const compiled = await compiler.less(content, dirname);
    return compiled;
  }

  @decorate(memoize)
  async __compileStylus(content: string, dirname: string): Promise<string> {
    const compiled = await compiler.stylus(content, dirname);
    return compiled;
  }

  @decorate(memoize)
  async standardize(content: string): Promise<string> {
    const min = await compiler.standardize(content);
    return min;
  }

  async compile(): Promise<{[target: string]: string}> {
    if (typeof this.items.postcss !== 'undefined') {
      const altFilename = this.__getAltFilename(this.filename.postcss);
      await fs.access(altFilename, fs.constants.F_OK)
      const $altContent = await fs.readFile(altFilename, 'utf-8');
      const content = await this.__compilePostcss(
        $altContent,
        this.postcssPlugins
      );
      this.altContent.postcss = content;
    }
    if (typeof this.items.scss !== 'undefined') {
      const altFilename = this.__getAltFilename(this.filename.scss);
      await fs.access(altFilename, fs.constants.F_OK)
      const $altContent = await fs.readFile(altFilename, 'utf-8');

      const dirname = this.dirname.scss;
      const content = await this.__compileScss($altContent, dirname);
      this.altContent.scss = content;
    }
    if (typeof this.items.less !== 'undefined') {
      const altFilename = this.__getAltFilename(this.filename.less);
      await fs.access(altFilename, fs.constants.F_OK)
      const $altContent = await fs.readFile(altFilename, 'utf-8');

      const dirname = this.dirname.less;
      const content = await this.__compileLess($altContent, dirname);
      this.altContent.less = content;
    }
    if (typeof this.items.stylus !== 'undefined') {
      const altFilename = this.__getAltFilename(this.filename.stylus);
      await fs.access(altFilename, fs.constants.F_OK)
      const $altContent = await fs.readFile(altFilename, 'utf-8');

      const dirname = this.dirname.stylus;
      const content = await this.__compileStylus($altContent, dirname);
      this.altContent.stylus = content;
    }

    const result = Object.keys(this.altContent).reduce(($result, target) => {
      if (this.altContent[target] === '') {
        return $result;
      }
      $result[target] = this.altContent[target];
      return $result;
    }, {});
    return result;
  }

  async isValid(targetData: {[target: string]: string}): Promise<boolean> {
    const targets = (() => {
      const $targets = Object.keys(targetData);
      if (this.main === 'css') {
        return ['css', ...$targets];
      }
      return $targets;
    })();
    if (targets.length < 2) {
      return true;
    }

    const rawContents = await (async () => {
      const $rawContents = Object.values(targetData);
      if (this.main === 'css') {
        const cssAltContent = this.standardize(this.items.css);
        return [cssAltContent, ...$rawContents];
      }
      return $rawContents;
    })();
    const contents = await pMap(rawContents, async c => {
      const min = await this.standardize(c);
      return min;
    });

    if (uniq(contents).length !== 1) {
      const first = chalk.gray(contents[0]);
      const contents$ = contents.slice(1).map(c => {
        const diffs = diffChars(first, c);
        diffs.forEach(d => {
          if (d.added) {
            c = c.replace(d.value, chalk.yellow(d.value));
          }
        });
        return chalk.gray(c);
      });
      const line = this.__getLine(windowSize.width);
      throw new Error(`'${this.name}' section is missing.

${chalk.bold.blue(this.name)}
${line}
${this.__diffTable(targets, [first, ...contents$])}
${line}
      `)
    }
    return false;
  }

  __hasHTML() {
    return 'html' in this.items;
  }

  @decorate(memoize)
  __getAltFilename(filename: string): string {
    const {dir, ext} = path.parse(filename);
    const base = path.basename(filename, ext);
    return dir + '/' + base + '$' + ext;
  }

  @decorate(memoize)
  __getLine(width: number): string {
    return chalk.gray(Array(width).fill('-').join(''));
  }

  @decorate(memoize)
  __diffTable(targets: string[], contents: string[]): string {
    const rows = [];
    let n = 0
    while (targets.length > n) {
      rows.push([
        chalk.blue('∎ ') + targets[n],
        contents[n]
      ]);
      n++;
    }

    return rows.map(r => r.join('\n')).join('\n\n');
  }
}
