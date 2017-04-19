import test from 'ava';
import Yosuga from '../../lib';

test('onerror in process when sections is undefined', async t => {
  const yosuga = new Yosuga();
  yosuga.process().catch(err => {
    t.is(err.message, 'sections must be required');
  });
});

test(
  'onerror when the content of the file with the same basename is different',
  async t => {
    const yosuga = new Yosuga({
      base: `${__dirname}/fixtures/`,
      targets: ['css', 'less']
    });
    try {
      await yosuga.process([{'name': 'test'}])
    } catch (err) {
      t.regex(err.message, /'test' section is missing\./);
    }
  }
);
