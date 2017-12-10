/* @flow */
import fs from 'fs-extra';
import compiler from './compiler';
import {fixtures} from './helpers/fixtures';

describe('compiler', () => {
  test('sass render', async () => {
    const filename = await fixtures`compiler/index.scss`;
    const content = await fs.readFile(filename, 'utf-8');

    const result = await compiler.sass(filename, content, 'output.css');

    expect(result).toHaveProperty('css');
    expect(result).toHaveProperty('map');
  });
});
