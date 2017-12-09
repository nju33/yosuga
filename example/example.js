// import path from 'path';
import Yosuga from '../lib';

const yosuga = new Yosuga({
  name: 'Yosuga DEMO',
  base: `${process.cwd()}/example`,
  targets: ['css', 'scss', 'less'],
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
    // return yosuga.generate('yosuga');
    return yosuga.serve();
  })
  .catch(err => {
    console.log(err);
  });
