/* @flow */
import path from 'path';
import {Nuxt, Builder, Generator} from 'nuxt';
import {readonly} from 'core-decorators';

export interface Config {
  head?: {[key: string]: any};
  cache?: {[key: string]: any};
  env?: {[key: string]: any};
  loading?: {[key: string]: any};
  generate?: {[key: string]: any};
  router?: {[key: string]: any};
  build?: {[key: string]: any};
  transition?: {[key: string]: any};
  performance?: {[key: string]: any};
  watchers?: {[key: string]: any};
  rootDir?: string;
  srcDir?: string;
  dev?: boolean;
  css?: string[];
  plugins?: string[];
}

export default class View {
  config: Config;

  @readonly
  static defaultOpts: {[string]: any} = {
    head: {
      title: 'Yosuga',
      meta: [
        {charset: 'utf-8'},
        {name: 'viewport', content: 'width=device-width, initial-scale=1'},
        {hid: 'description', name: 'description', content: 'Nuxt.js project'},
      ],
      link: [
        {rel: 'icon', type: 'image/x-icon', href: 'favicon.ico'},
        {
          rel: 'stylesheet',
          href: '//fonts.googleapis.com/css?family=Source+Code+Pro',
        },
      ],
    },
    cache: {
      max: 1000,
      maxAge: 900000,
    },
    loading: {color: '#3B8070'},
    dev: false,
    generate: {
      dir: 'dist',
    },
    rootDir: process.cwd(),
    router: {
      base: '/',
    },
  };

  /**
   *
   * @param  {[type]} opts [description]
   * @return {[type]}      [description]
   */
  constructor(opts: {[string]: any}) {
    this.config = {};
    this.config.head = this._extends('head', opts);
    this.config.cache = this._extends('cache', opts);
    this.config.env = this._extends('env', opts);
    this.config.loading = this._extends('loading', opts);
    this.config.generate = this._extends('generate', opts);
    this.config.router = this._extends('router', opts);
    this.config.build = this._extends('build', opts);
    this.config.transition = this._extends('transition', opts);
    this.config.performance = this._extends('performance', opts);
    this.config.watchers = this._extends('watchers', opts);

    this.config.rootDir = opts.rootDir || View.defaultOpts.rootDir;
    this.config.srcDir = opts.srcDir || path.join(__dirname, '../lib/view/');
    this.config.dev = (() => {
      if (typeof opts.dev === 'undefined' || opts.dev === null) {
        return process.env.NODE_ENV !== 'production';
      }
      return opts.dev;
    })();
    // this.config.css = opts.css
    //   ? ['~static/yosuga.css', ...opts.css]
    //   : ['~static/yosuga.css'];
    this.config.plugins = opts.plugins || [];
  }

  async build(): Promise<any> {
    const nuxt = new Nuxt(this.config);
    const builder = new Builder(nuxt);
    try {
      await builder.build();
    } catch (err) {
      console.log(err);
    }
    return nuxt;
  }

  async generate(sections: any[]): Promise<any> {
    const nuxt = new Nuxt(
      Object.assign({}, this.config, {
        dev: false,
      }),
    );
    const builder = new Builder(nuxt);
    const generator = new Generator(nuxt, builder);
    try {
      await generator.generate({
        routes: sections.map(s => `/sections/${s.name}`),
      });
    } catch (err) {
      console.log(err);
    }
    return nuxt;
  }

  _extends(prop: string, opts: {[string]: any}) {
    return Object.assign({}, View.defaultOpts[prop] || {}, opts[prop] || {});
  }
}
