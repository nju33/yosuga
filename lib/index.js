// @flow

import fs from 'fs';
import path from 'path';
import pify from 'pify';
import glob from 'glob';
import postcss from 'postcss';
import marked from 'marked';
import aru from 'aru';
import Case from 'case';
import execa from 'execa';
import type {Option, Section, SectionItems} from './index.js.flow';

const defaultOpts: Option = {
  base: path.resolve('yosuga'),
  targets: ['css', 'less', 'scss', 'stylus'],
  accentColor: '#cb1b45',
  subColor: '#282425',
  baseColor: '#f3f3f3'
};

let childProcess$ = null;

export default async function yosuga(sections: Section[] | null = null, $opts: Option = defaultOpts) {
  if (sections === null) {
    throw new Error('sections must be required');
  }

  const opts = Object.assign({}, defaultOpts, $opts);
  const $css = postcss.root();
  $css.append(postcss.atRule({
    name: 'charset',
    params: '"utf-8"'
  }));

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

    section.title = Case.capital(section.name);
    if (section.description) {
      section.description = marked(section.description.trim());
    }

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
        const style = item.section[section.name].trim();
        section.items[item.target] = style;

        if (item.target === 'css') {
          $css.append(postcss.parse(style));
        }
      }
    });
  });

  const dataFilename = `${__dirname}/lib/_view/lib/data.json`;
  const optsFilename = `${__dirname}/lib/_view/lib/opts.json`;
  const styleFilename = `${__dirname}/lib/_view/static/yosuga.css`;

  const writeFile = pify(fs.writeFile);
  const access = pify(fs.access);
  await aru('dataFile', access(dataFilename, fs.constants.F_OK));
  await aru.left('dataFile', async () => {
    const mkdir = pify(fs.mkdir);
    await mkdir(path.dirname(dataFilename));
  });

  await writeFile(dataFilename, JSON.stringify(sections));
  await writeFile(optsFilename, JSON.stringify(opts));
  await writeFile(styleFilename, $css.toString());

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

async function getContent(file: string): string {
  const readFile = pify(fs.readFile);
  const content = await readFile(file, 'utf-8');
  return content;
}
