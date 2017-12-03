/* @flow */
import path from 'path';
import pkgDir from 'pkg-dir';

let root: string;

export const fixtures = async (str: string[]) => {
  if (root === undefined) {
    root = await pkgDir(__dirname);
  }

  return path.join(root, 'lib/fixtures', str[0]);
};
