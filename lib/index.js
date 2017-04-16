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
import getPort from 'get-port';
import compiler from './compiler';
import type
  {Option, compiledItems, Section, SectionItems} from './index.js.flow';

const defaultOpts: Option = {
  base: path.resolve('yosuga'),
  targets: ['css', 'less', 'scss', 'stylus'],
  accentColor: '#cb1b45',
  subColor: '#282425',
  baseColor: '#f3f3f3'
};

const compiled: {[sectionName: string]: compiledItems} = {};

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
    const $files = await pify(glob)(pattern);
    const files = $files.filter(f => {
      const extname = path.extname(f);
      return !path.basename(f, extname).endsWith('$');
    });
    const $data = {
      target,
      section: {}
    };

    await Promise.all(files.map(async file => {
      const extname = path.extname(file);
      const dirname = path.dirname(file);
      const basename = path.basename(file, extname);
      $data.section[basename] = await getContent(file);

      if (target === 'html' || target === 'css') {
        return;
      }

      const alternativeFile = getAlternativeFilePath(file);
      try {
        await pify(fs.access)(alternativeFile, fs.constants.F_OK);
        const alternativeContents =
          await pify(fs.readFile)(alternativeFile, 'utf-8');

        if (typeof compiled[basename] === 'undefined') {
          compiled[basename] = {};
        }
        compiled[basename][target] =
          await compiler[target](alternativeContents, dirname);
      } catch (err) {
      }
    }));

    return $data;
  }));

  if (Object.keys(compiled).length > 0) {
    await validate(compiled);
  }

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

  const dataFilename = path.join(__dirname, '../lib/_view/lib/data.json');
  const optsFilename = path.join(__dirname, '../lib/_view/lib/opts.json');
  const styleFilename = path.join(__dirname, '../lib/_view/static/yosuga.css');

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

  const bool = await canUsePort3333();
  if (bool) {
    execa('yarn', ['dev'], {
      cwd: `${__dirname}/lib/_view`,
      reject: false
    }).stdout.pipe(process.stdout);
  } else {
    throw new Error('listen EADDRINUSE 127.0.0.1:3333');
  }
}

function hasCSSInTargets(targets: string[]) {
  return targets.indexOf('css') > -1;
}

function getAlternativeFilePath(filename: string) {
  const extname = path.extname(filename);
  const dirname = path.dirname(filename);
  const basename = path.basename(filename, extname);
  return dirname + '/' + basename + '$' + extname;
}

async function canUsePort3333(): Promise<boolean> {
  const num = await getPort(3333);
  return num === 3333
}

async function validate(data): Promise<boolean> {
  for (const sectionName in data) {
    const targets = Object.keys(data[sectionName]);
    if (targets.length < 2) {
      return true;
    }

    const $contents = targets.map(async target => {
      const result = await compiler.__cssnano(data[sectionName][target]);
      return result;
    });
    const contents = await Promise.all($contents);
    const standard = contents[0];
    const bool = contents.slice(1).every(content => {
      return standard === content;
    });

    if (!bool) {
      throw new Error(`
${sectionName} section is missing.

${sectionName}:
${contents.map((c, i) => `  [${targets[i]}]\n    ${c}`).join('\n')}
      `.trim())
    }
  }
  return true;
}

async function getContent(file: string): Promise<string> {
  const readFile = pify(fs.readFile);
  const content = await readFile(file, 'utf-8');
  return content;
}
