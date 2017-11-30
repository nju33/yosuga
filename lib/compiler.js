/* @flow */
import {promisify} from 'util';
import postcss from 'postcss';
import sass from 'node-sass';
import less from 'less';
import stylus from 'stylus';
import cssnano from 'cssnano';
import Csscomb from 'csscomb';

export default {
  // async postcss($css: string, plugins: any[]): Promise<string> {
  async postcss($css: string): Promise<string> {
    const result = await postcss().process($css);
    return result.css;
  },
  async sass($css: string, dirpath: string): Promise<string> {
    const render = promisify(sass.render.bind(sass));
    const result = await render({
      data: $css,
      includePaths: [dirpath + '/'],
    });
    return result.css.toString();
  },
  async scss($css: string, dirpath: string): Promise<string> {
    const render = promisify(sass.render.bind(sass));
    const result = await render({
      data: $css,
      includePaths: [dirpath + '/'],
    });
    return result.css.toString();
  },
  async less($css: string, dirpath: string): Promise<string> {
    const render = promisify(less.render.bind(less));
    const result = await render($css, {
      paths: [dirpath],
    });
    return result.css;
  },
  async stylus($css: string, dirpath: string): Promise<string> {
    const render = promisify(stylus.render.bind(stylus));
    const css = await render($css, {
      paths: [dirpath],
    });
    return css;
  },
  async standardize($css: string): Promise<string> {
    const $result = await cssnano.process($css);
    const sorted = await new Csscomb('yandex').processString($result.css);
    const result$ = await cssnano.process(sorted);
    return result$.css;
  },
  async css(src: string): Promise<string> {
    return src;
  },
};
