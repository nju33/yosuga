/* @flow */
import path from 'path';
import {promisify} from 'util';
import memoize from 'fast-memoize';
import postcss from 'postcss';
import postcssrc from 'postcss-load-config';
import sass from 'node-sass';
import less from 'less';
import stylus from 'stylus';
import cssnano from 'cssnano';
import postcssSorting from 'postcss-sorting';

const pSassRender = promisify(sass.render.bind(sass));
const pLessRender = promisify(less.render.bind(less));
const pStylusRender = promisify(stylus.render.bind(stylus));

export interface Compiled {
  css: string;
  map?: string;
}

export interface Compiler {
  standardize(css: string): Promise<string>;
  sass(
    filename: string,
    content: string,
    output: string,
    src: string,
  ): Promise<Compiled>;
  less(
    filename: string,
    content: string,
    output: string,
    src: string,
  ): Promise<Compiled>;
  stylus(
    filename: string,
    content: string,
    output: string,
    src: string,
  ): Promise<Compiled>;
  postcss(
    filename: string,
    content: string,
    output: string,
    output: string,
    src: string,
  ): Promise<Compiled>;
  css(filename: string, content: string): Promise<Compiled>;
  [extname: '.sass' | '.scss' | '.less' | '.css']: (
    ...args: any[]
  ) => Promise<Compiled>;
}

// ¯\_(ツ)_/¯ ...............
const compiler: any = {
  standardize: memoize(async (css: string) => {
    const result = await postcss([
      postcssSorting({
        'properties-order': 'alphabetical',
      }),
      cssnano,
    ]).process(css);

    return result.css;
  }),
  postcss: memoize(
    // eslint-disable-next-line no-unused-vars
    async (filename: string, content: string, output: string, src: string) => {
      const plugins = await postcssrc({env: process.env.NODE_ENV});
      const result = await postcss(plugins).process(content, {
        from: filename,
        to: output,
      });

      return {
        css: result.css,
        map: result.map,
      };
    },
  ),
  sass: memoize(
    // eslint-disable-next-line no-unused-vars
    async (filename: string, content: string, output: string, src: string) => {
      const result = await pSassRender({
        data: content,
        outFile: output,
        includePaths: [path.dirname(filename)],
        sourceMap: true,
      });

      return {
        css: result.css.toString(),
        map: result.map.toString(),
      };
    },
  ),
  '.scss': memoize(async (...args: any[]) => {
    return compiler.sass.apply(null, args);
  }),
  '.sass': memoize(async (...args: any[]) => {
    return compiler.sass.apply(null, args);
  }),
  less: memoize(
    // eslint-disable-next-line no-unused-vars
    async (filename: string, content: string, output: string, src: string) => {
      const result = await pLessRender(content, {
        paths: [path.dirname(filename)],
        filename: path.basename(filename),
      });

      return {
        css: result.css,
      };
    },
  ),
  '.less': memoize(async (...args: any[]) => {
    return compiler.less.apply(null, args);
  }),
  stylus: memoize(
    // eslint-disable-next-line no-unused-vars
    async (filename: string, content: string, output: string, src: string) => {
      const css = await pStylusRender(content, {
        paths: [path.dirname(filename)],
      });

      return {
        css,
      };
    },
  ),
  '.styl': memoize(async (...args: any[]) => {
    return compiler.stylus.apply(null, args);
  }),
  css: memoize(async (filename: string, content: string) => {
    return {
      css: content,
    };
  }),
  '.css': memoize(async (...args: any[]) => {
    return compiler.css.apply(null, args);
  }),
};

export default compiler;
