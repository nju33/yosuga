import path from 'path';
import Yosuga from '../lib';
import autoprefixer from 'autoprefixer';

const yosuga = new Yosuga({
  title: 'Test',
  base: `${__dirname}/styles/`,
  targets: ['css', 'scss', 'postcss'],
  postcssPlugins: [
    autoprefixer({browsers: ['> 3%', 'last 2 versions']})
  ],
  accentColor: '#cb1b45',
  subColor: '#282425',
  baseColor: '#f3f3f3',

  generate: {
    dir: 'docs'
  },
  router: {
    base: process.env.NODE_ENV === 'prod' ? '/yosuga/' : '/'
  }
});

yosuga.process([
  {
    name: 'button',
    description: `
### headline

description...description...

description...description...description...
description...description...
    `
  },
  {
    name: 'table',
    description: 'description...'
  },
  {
    name: 'nav',
    description: 'description...'
  },
  {
    name: 'card',
    description: 'description...'
  }
]).then(() => {
  return yosuga.generate();
  // return yosuga.serve({
  //   port: 3333,
  //   watch({srcDir}) {
  //     return srcDir + '**/*';
  //   },
  //   force: true
  // });
}).catch(err => {
  console.log(err);
});
