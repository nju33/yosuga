/* @flow */
import Yosuga from '.';
import compiler from './compiler';

describe('Yosuga', () => {
  let yosuga: Yosuga;

  beforeEach(() => {
    yosuga = new Yosuga({
      base: `${__dirname}/fixtures/targets`,
      main: 'sass',
    });
  });

  afterEach(() => {
    yosuga = (undefined: any);
  });

  test('instance._getTargets', async () => {
    const targets = await yosuga._getTargets();

    expect(targets).toMatchObject((['css', 'sass']: any));
  });

  test('instance._getTargetContents', async () => {
    const results = await yosuga._getTargetContents(compiler, ['css', 'sass']);

    expect(results).toHaveProperty('css');
    expect(results.css).toHaveProperty('button');
    expect(results.css).not.toHaveProperty('invalid');
    expect(results).toHaveProperty('sass');
    expect(results.sass).toHaveProperty('button');
    expect(results.sass).not.toHaveProperty('invalid');
    expect((results.sass: any)['button.yosuga']).toEqual(undefined);
  });

  test('instance._getComparisonBy', () => {
    const items = {
      css: {
        button: {
          code: '',
          comparison: {
            css: 'button: {color:orange}',
          },
        },
      },
      sass: {
        button: {
          code: '',
          comparison: {
            css: 'button: {color:orange}',
          },
        },
      },
      postcss: {
        button: {
          code: '',
          comparison: {
            css: 'button: {color:orange}',
          },
        },
      },
    };

    const result = yosuga._getComparisonBy(items, 'button');
    expect(result.length).toEqual(3);
    expect(result[0]).toHaveProperty('css');
    expect(result[1]).toHaveProperty('css');
    expect(result[2]).toHaveProperty('css');
  });

  test('instance._diff', () => {
    const result = yosuga._diff([
      {
        css: 'body{color:orange}',
      },
      {
        css: 'body{color:orange}',
      },
      {
        css: 'body{color:orange}',
      },
    ]);

    expect(result).toEqual(true);
  });
});
