// @flow

import path from 'path';
import Nuxt from 'nuxt';
import {readonly} from 'core-decorators';

export default class View {
  config: {[string]: any};

  @readonly
  static defaultOpts: {[string]: any} = {
    head: {
      title: 'Yosuga',
      meta: [
        {charset: 'utf-8'},
        {name: 'viewport', content: 'width=device-width, initial-scale=1'},
        {hid: 'description', name: 'description', content: 'Nuxt.js project'}
      ],
      link: [
        {rel: 'icon', type: 'image/x-icon', href: 'favicon.ico'},
        {
          rel: 'stylesheet',
          href: '//fonts.googleapis.com/css?family=Source+Code+Pro'
        }
      ]
    },
    cache: {
      max: 1000,
      maxAge: 900000
    },
    loading: {color: '#3B8070'},
    dev: false,
    generate: {
      dir: '/dist'
    },
    router: {
      base: '/'
    }
  }

  constructor(opts: {[string]: any}) {
    this.config = {};
    this.config.head = this.__assign('head', opts);
    this.config.cache = this.__assign('cache', opts);
    this.config.env = this.__assign('env', opts);
    this.config.loading = this.__assign('loading', opts);
    this.config.generate = this.__assign('generate', opts);
    this.config.router = this.__assign('router', opts);
    this.config.build = this.__assign('build', opts);
    this.config.transition = this.__assign('transition', opts);
    this.config.performance = this.__assign('performance', opts);
    this.config.watchers = this.__assign('watchers', opts);

    this.config.rootDir = opts.rootDir || path.join(__dirname, '..');
    this.config.srcDir = opts.srcDir || path.join(__dirname, '../lib/view/');
    this.config.dev = (() => {
      if (typeof opts.dev === 'undefined' || opts.dev === null) {
        return process.env.NODE_ENV !== 'production';
      }
      return opts.dev;
    })();
    this.config.css = opts.css ?
                        ['~static/yosuga.css', ...opts.css] :
                        ['~static/yosuga.css'];
    this.config.plugins = opts.plugins || [];
  }

  async build(): Promise<any> {
    const nuxt = new Nuxt(this.config);
    await nuxt.build();
    return nuxt;
  }

  async generate(): Promise<any> {
    const nuxt = new Nuxt(Object.assign({}, this.config, {dev: false}));
    await nuxt.generate();
    return nuxt;
  }

  __assign(prop: string, opts: {[string]: any}) {
    return Object.assign({}, View.defaultOpts[prop] || {}, opts[prop] || {});
  }
}
