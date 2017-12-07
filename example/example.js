// import path from 'path';
import Yosuga from '../lib';
import autoprefixer from 'autoprefixer';

const yosuga = new Yosuga({
  title: 'Yosuga DEMO',
  base: `${process.cwd()}/example`,
  targets: ['css', 'scss', 'postcss'],
  postcssPlugins: [autoprefixer({browsers: ['> 3%', 'last 2 versions']})],
  accentColor: '#cb1b45',
  subColor: '#282425',
  baseColor: '#f3f3f3',

  generate: {
    dir: 'docs',
  },
  router: {
    base: process.env.NODE_ENV === 'prod' ? '/yosuga/' : '/',
  },
});

yosuga
  .prepare([
    //     {
    //       name: 'button',
    //       description: `
    // ### headline
    //
    // description...description...
    //
    // description...description...description...
    // description...description...
    //     `,
    //     },
    //     {
    //       name: 'table',
    //       description: 'description...',
    //     },
    //     {
    //       name: 'nav',
    //       description: 'description...',
    //     },
    //     {
    //       name: 'card',
    //       description: 'description...',
    //     },
  ])
  .then(() => {
    // return yosuga.generate();
    return yosuga.serve();
  })
  .catch(err => {
    console.log(err);
  });
