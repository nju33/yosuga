import Yosuga from '..';
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
  baseColor: '#f3f3f3'
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
  yosuga.serve();
}).catch(err => {
  console.log(err);
});
