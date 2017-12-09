import View from './view';

describe('View', () => {
  test('props', () => {
    const view = new View({
      builder: {},
      css: ['foo.css'],
    });

    expect(view.config).toHaveProperty('head');
    expect(view.config).toHaveProperty('cache');
    expect(view.config).toHaveProperty('env');
    expect(view.config).toHaveProperty('loading');
    expect(view.config).toHaveProperty('generate');
    expect(view.config).toHaveProperty('router');
    expect(view.config).toHaveProperty('build');
    expect(view.config.build).toHaveProperty('vender');
    expect(view.config).toHaveProperty('transition');
    expect(view.config).toHaveProperty('watchers');
    expect(view.config).toHaveProperty('css');
    expect(view.config.css[0]).toEqual('foo.css');
    expect(view.config).toHaveProperty('plugins');
  });

  test('.setBase', () => {
    const view = new View({
      builder: {},
      css: ['foo.css'],
    });

    view.setBase('hoge');

    expect(view.config.router.base).toEqual('hoge');
  });
});
