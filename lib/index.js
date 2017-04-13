// @flow

import fs from 'fs';
import path from 'path';
import pify from 'pify';
import glob from 'glob';
import aru from 'aru';
import Case from 'case';
import execa from 'execa';
import type {Option, Section, SectionItems} from './index.js.flow';

const defaultOpts: Option = {
  base: path.resolve('yosuga'),
  targets: ['css', 'less', 'scss', 'stylus']
};

let childProcess$ = null;

export default async function yosuga(sections: Section[] | null = null, $opts: Option = defaultOpts) {
  if (sections === null) {
    throw new Error('sections must be required');
  }

  const opts = Object.assign({}, defaultOpts, $opts);

  const data = await Promise.all(['html', ...opts.targets].map(async target => {
    const pattern = path.join(opts.base, target, '**/*');
    const files = await pify(glob)(pattern);
    const $data = {
      target,
      section: {}
    };

    await Promise.all(files.map(async file => {
      const extname = path.extname(file);
      const basename = path.basename(file, extname);
      $data.section[basename] = await getContent(file);
    }));

    return $data;
  }));

  sections.map(section => {
    if (typeof section.name === 'undefined') {
      return section;
    }
    section.title = Case.upper(section.name);
    data.forEach(item => {
      if (typeof item.section[section.name] === 'undefined') {
        return;
      }

      if (typeof section.items === 'undefined') {
        section.items = {};
      }

      if (item.target === 'html') {
        section.html = item.section[section.name] || null;
      } else {
        section.items[item.target] = item.section[section.name];
      }
    });
  });

  const dataFilename = `${__dirname}/lib/_view/lib/data.json`;
  const writeFile = pify(fs.writeFile);
  const access = pify(fs.access);
  await aru('dataFile', access(dataFilename, fs.constants.F_OK));
  await aru.left('dataFile', async () => {
    const mkdir = pify(fs.mkdir);
    await mkdir(path.dirname(dataFilename));
  });
  await writeFile(dataFilename, JSON.stringify(sections));

  if (childProcess$ !== null) {
    return;
  }

  childProcess$ = execa.shell('yarn dev', {
    cwd: `${__dirname}/lib/_view`,
    reject: false
  })
    .stdout.pipe(process.stdout);
}

// async function getConfig() {
//   const readFile = pify(fs.readFile);
//   const conf = await readFile(path.resolve('yosuga.config.js'), 'utf-8');
//   return JSON.parse(conf);
// }

async function getContent(file) {
  const readFile = pify(fs.readFile);
  const content = await readFile(file, 'utf-8');
  return content;
}
