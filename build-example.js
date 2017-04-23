import autoprefixer from 'autoprefixer';
import Yosuga from '.';

const yosuga = new Yosuga({
  title: 'Test',
  base: `${__dirname}/example/styles/`,
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
    base: '/yosuga/'
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
}).catch(err => {
  console.log(err);
});
