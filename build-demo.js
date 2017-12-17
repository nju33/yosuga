import Yosuga from './dist';
// import Yosuga from './lib/index.js';

const yosuga = new Yosuga({
  icon: 'icon.png',
  name: 'Yosuga DEMO',
  base: `${process.cwd()}/example`,
  main: 'sass',
  generate: {
    dir: 'docs',
  },
});

yosuga
  .prepare()
  .then(() => {
    yosuga.generate('/yosuga/');
    // yosuga.generate();
  })
  .catch(err => {
    console.log(err);
  });
