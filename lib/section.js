/* @flow */
import fs from 'fs-extra';
import path from 'path';
import * as diff from 'diff';
import chalk from 'chalk';
import memoize from 'fast-memoize';
import pMap from 'p-map';
import uniq from 'lodash.uniq';
import Case from 'case';
import marked from 'marked';
import windowSize from 'window-size';
import {decorate} from 'core-decorators';
import compiler from './compiler';

const diffChars = memoize(diff.diffChars);

export default class Section {
  main: string;

  name: string;

  title: string;

  description: string;

  postcssPlugins: any[];

  html: string;

  css: string;

  items: [string, string][];

  // altItems: {[target: string]: string};
  //
  // altCompiledItems: {[target: string]: string};
  //
  // dirname: {[target: string]: string};
  //
  // filename: {[target: string]: string};

  constructor(
    name: string,
    data: {
      content: string,
      data: {
        [key: string]: any,
      },
    },
    // main: string,
    // name: string,
    // description: string = '',
    // postcssPlugins: any[],
  ) {
    // this.main = main;
    this.name = name;
    this.title = data.data.title;
    this.description = data.data.description;
    // this.postcssPlugins = postcssPlugins;
    this.html = data.content;
    this.css = '';
    this.items = [];
    // this.altItems = {};
    // this.altCompiledItems = {};
    // this.dirname = {};
    // this.filename = {};
  }

  // setItems(items: [string, string][]) {
  //   this.items = items;
  // }

  export(): any {
    return {
      name: this.name,
      title: this.title,
      description: this.description,
      html: this.html,
      css: this.css,
      items: this.items,
    };
  }
  //
  //   get data(): {[string]: string | {[string]: string}} {
  //     return {
  //       main: this.main,
  //       name: this.name,
  //       title: this.title,
  //       description: this.description,
  //       html: this.html,
  //       items: this.items,
  //       altItems: this.altItems,
  //     };
  //   }
  //
  //   get css(): string {
  //     switch (this.main) {
  //       default:
  //       case 'css': {
  //         return this.items.css;
  //       }
  //       case 'postcss': {
  //         if (typeof this.altCompiledItems.postcss === 'undefined') {
  //           throw new TypeError(
  //             `
  // ${this.__getAltFilename(this.filename.postcss)} was not found.
  //           `.trim(),
  //           );
  //         }
  //         return this.altCompiledItems.postcss;
  //       }
  //       case 'scss': {
  //         if (typeof this.altCompiledItems.scss === 'undefined') {
  //           throw new TypeError(
  //             `
  // ${this.__getAltFilename(this.filename.scss)} was not found.
  //           `.trim(),
  //           );
  //         }
  //         return this.altCompiledItems.scss;
  //       }
  //       case 'less': {
  //         if (typeof this.altCompiledItems.less === 'undefined') {
  //           throw new TypeError(
  //             `
  // ${this.__getAltFilename(this.filename.less)} was not found.
  //           `.trim(),
  //           );
  //         }
  //         return this.altCompiledItems.less;
  //       }
  //       case 'stylus': {
  //         if (typeof this.altCompiledItems.stylus === 'undefined') {
  //           throw new TypeError(
  //             `
  // ${this.__getAltFilename(this.filename.stylus)} was not found.
  //           `.trim(),
  //           );
  //         }
  //         return this.altCompiledItems.stylus;
  //       }
  //     }
  // }
}
