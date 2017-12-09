/* @flow */
import compiler from './compiler';
import {fixtures} from './helpers/fixtures';

describe('compiler', () => {
  test('sass render', async () => {
    const filename = await fixtures`compiler/index.scss`;
    const result = await compiler.sass(filename, 'output.css');

    expect(result).toHaveProperty('css');
    expect(result).toHaveProperty('map');
  });
});
