import pify from 'pify';
import sass from 'node-sass';
import less from 'less';
import stylus from 'stylus';
import cssnano from 'cssnano';
import type {Compiler} from './compiler.js.flow';

export default {
  async scss($css: string, dirpath: string): string {
    const render = pify(sass.render.bind(sass));
    const result = await render({
      data: $css,
      includePaths: [dirpath + '/']
    });
    return result.css.toString();
  },
  async less($css: string, dirpath: string): string {
    const render = pify(less.render.bind(less));
    const result = await render($css, {
      paths: [dirpath]
    });
    return result.css;
  },
  async stylus($css: string, dirpath: string): string {
    const render = pify(stylus.render.bind(stylus));
    const css = await render($css, {
      paths: [dirpath]
    });
    return css;
  },
  async __cssnano($css: string): string {
    const result = await cssnano.process($css);
    return result.css;
  }
};
