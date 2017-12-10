import Yosuga from '../lib';

const yosuga = new Yosuga({
  name: 'Yosuga DEMO',
  base: `${process.cwd()}/example`,
  main: 'sass',
  style: {
    fontSize: '14px',
  },
  generate: {
    dir: 'docs',
  },
});

yosuga
  .prepare()
  .then(() => {
    yosuga.serve();
  })
  .catch(err => {
    console.log(err);
  });
