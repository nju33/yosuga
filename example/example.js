// import path from 'path';
import Yosuga from '../lib';

const yosuga = new Yosuga({
  name: 'Yosuga DEMO',
  base: `${process.cwd()}/example`,
  main: 'sass',
  targets: ['css', 'scss', 'less'],
  // dirs: {
  //   yosuga: 123,
  // },
  style: {
    fontSize: '16px',
  },
  generate: {
    dir: 'docs',
  },
});

yosuga
  .prepare()
  .then(() => {
    // re turn yosuga.generate('yosuga');
    return yosuga.serve();
  })
  .catch(err => {
    console.log(err);
  });
