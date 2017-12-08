// import path from 'path';
import Yosuga from '../lib';
import autoprefixer from 'autoprefixer';

const yosuga = new Yosuga({
  title: 'Yosuga DEMO',
  base: `${process.cwd()}/example`,
  targets: ['css', 'scss', 'less'],
  postcssPlugins: [autoprefixer({browsers: ['> 3%', 'last 2 versions']})],
  accentColor: '#cb1b45',
  subColor: '#282425',
  baseColor: '#f3f3f3',
  generate: {
    dir: 'docs',
  },
});

yosuga
  .prepare()
  .then(() => {
    // return yosuga.generate('yosuga');
    return yosuga.serve();
  })
  .catch(err => {
    console.log(err);
  });
