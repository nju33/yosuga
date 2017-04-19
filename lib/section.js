// @flow

import $fs from 'fs';
import path from 'path';
import pify from 'pify';
import aru from 'aru';
import pMap from 'p-map';
import pFilter from 'p-filter';
import uniq from 'lodash.uniq';
import Case from 'case';
import memoize from 'fast-memoize';
import marked from 'marked';
import {decorate} from 'core-decorators';
import compiler from './compiler';

const fs = pify($fs);

export default class Section {
  main: string;
  name: string;
  title: string;
  description: string;
  html: string;
  items: {[target: string]: string};
  dirname: {[target: string]: string};
  filename: {[target: string]: string};
  altContent: {[target: string]: string};

  constructor(main: string, name: string, description: string = '') {
    this.main = main;
    this.name = name;
    this.title = Case.capital(name);
    this.description = marked(description);
    this.html = '';
    this.items = {};
    this.dirname = {};
    this.filename = {};
    this.altContent = {};
  }

  get css(): string {
    switch (this.main) {
      default:
      case 'css' : {
        return this.items.css;
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
  async __minify(content: string): Promise<string> {
    const min = await compiler.__cssnano(content);
    return min;
  }

  async compile(): Promise<{[target: string]: string}> {
    if (typeof this.items.scss !== 'undefined') {
      const altFilename = this.__getAltFilename(this.filename.scss);
      try {
        await fs.access(altFilename, fs.constants.F_OK)
        const $altContent = await fs.readFile(altFilename, 'utf-8');

        const dirname = this.dirname.scss;
        const content = await this.__compileScss($altContent, dirname);
        this.altContent.scss = content;
      } catch (err) {}
    }
    if (typeof this.items.less !== 'undefined') {
      const altFilename = this.__getAltFilename(this.filename.less);
      try {
        await fs.access(altFilename, fs.constants.F_OK)
        const $altContent = await fs.readFile(altFilename, 'utf-8');

        const dirname = this.dirname.less;
        const content = await this.__compileLess($altContent, dirname);
        this.altContent.less = content;
      } catch (err) {}
    }
    if (typeof this.items.stylus !== 'undefined') {
      const altFilename = this.__getAltFilename(this.filename.stylus);
      try {
        await fs.access(altFilename, fs.constants.F_OK)
        const $altContent = await fs.readFile(altFilename, 'utf-8');

        const dirname = this.dirname.stylus;
        const content = await this.__compileStylus($altContent, dirname);
        this.altContent.stylus = content;
      } catch (err) {}
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
    const targets = Object.keys(targetData);
    if (targets.length < 2) {
      return true;
    }

    const contents = await pMap(Object.values(targetData), async c => {
      const min = await this.__minify(c);
      return min;
    });

    if (uniq(contents).length !== 1) {
      throw new Error(`
${this.name} section is missing.

${this.name}:
${contents.map((c, i) => `  [${targets[i]}]\n    ${c}`).join('\n')}
      `.trim())
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
}
