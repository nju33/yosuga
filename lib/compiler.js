// @flow

import pify from 'pify';
import postcss from 'postcss';
import sass from 'node-sass';
import less from 'less';
import stylus from 'stylus';
import cssnano from 'cssnano';
import Csscomb from 'csscomb';
import type {Compiler} from './compiler.js.flow';

export default {
  async postcss($css: string, plugins: any[]): Promise<string> {
    const result = await postcss(plugins).process($css);
    return result.css;
  },
  async scss($css: string, dirpath: string): Promise<string> {
    const render = pify(sass.render.bind(sass));
    const result = await render({
      data: $css,
      includePaths: [dirpath + '/']
    });
    return result.css.toString();
  },
  async less($css: string, dirpath: string): Promise<string> {
    const render = pify(less.render.bind(less));
    const result = await render($css, {
      paths: [dirpath]
    });
    return result.css;
  },
  async stylus($css: string, dirpath: string): Promise<string> {
    const render = pify(stylus.render.bind(stylus));
    const css = await render($css, {
      paths: [dirpath]
    });
    return css;
  },
  async standardize($css: string): Promise<string> {
    const $result = await cssnano.process($css);
    const sorted = await new Csscomb('yandex').processString($result.css);
    const result$ = await cssnano.process(sorted);
    return result$.css;
  }
};
