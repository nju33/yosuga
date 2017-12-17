/* @flow */
import browserSync from 'browser-sync';
import {readonly} from 'core-decorators';

const bs = browserSync.create();

type ServerConfig = {[string]: any};

export default class Server {
  config: ServerConfig;

  @readonly
  static defaultConfig: ServerConfig = {
    ui: false,
    files: false,
    watchOptions: {},
    server: 'example',
    proxy: false,
    port: 3333,
    middleware: false,
    serveStatic: [],
    ghostMode: false,
    notify: false,
    host: null,
    open: false,
    codeSync: true,
  };

  constructor(config: ServerConfig = {}) {
    this.config = Object.assign({}, Server.defaultConfig, config);
  }

  serve(): Promise<void> {
    return new Promise(r => {
      bs.init(this.config, r);
    });
  }

  exit() {
    bs.exit();
  }
}
