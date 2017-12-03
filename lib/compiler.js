/* @flow */
import path from 'path';
import {promisify} from 'util';
import postcss from 'postcss';
import sass from 'node-sass';
// import less from 'less';
// import stylus from 'stylus';
import cssnano from 'cssnano';
import postcssSorting from 'postcss-sorting';
// import Csscomb from 'csscomb';

const pSassRender = promisify(sass.render.bind(sass));

export interface Compiled {
  css: string;
  map?: string;
}

export default {
  async standardize(css: string): Promise<string> {
    const result = await postcss([
      postcssSorting({
        'properties-order': 'alphabetical',
      }),
      cssnano,
    ]).process(css);

    return result.css;
  },
  // async postcss($css: string): Promise<string> {
  //   const result = await postcss().process($css);
  //   return result.css;
  // },
  async sass(filename: string, output: string): Promise<Compiled> {
    const result = await pSassRender({
      file: filename,
      outFile: output,
      includePaths: [path.dirname(filename)],
      sourceMap: true,
    });

    result.css = result.css.toString();
    result.map = result.map.toString();
    return (result: Compiled);
  },
  async '.scss'(...args: any[]): Promise<Compiled> {
    return this.sass.apply(null, args);
  },
  async '.sass'(...args: any[]): Promise<Compiled> {
    return this.sass.apply(null, args);
  },
  // async scss($css: string, dirpath: string): Promise<string> {
  //   const render = promisify(sass.render.bind(sass));
  //   const result = await render({
  //     data: $css,
  //     includePaths: [dirpath + '/'],
  //   });
  //   return result.css.toString();
  // },
  // async less($css: string, dirpath: string): Promise<string> {
  //   const render = promisify(less.render.bind(less));
  //   const result = await render($css, {
  //     paths: [dirpath],
  //   });
  //   return result.css;
  // },
  // async stylus($css: string, dirpath: string): Promise<string> {
  //   const render = promisify(stylus.render.bind(stylus));
  //   const css = await render($css, {
  //     paths: [dirpath],
  //   });
  //   return css;
  // },
  async css(src: string): Promise<Compiled> {
    return {
      css: src,
    };
  },
  async '.css'(...args: any[]): Promise<Compiled> {
    return this.css.apply(null, args);
  },
};
