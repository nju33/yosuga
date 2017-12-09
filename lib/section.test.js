import Section from './section';

describe('Section', () => {
  test('props', () => {
    const section = new Section('hoge', {
      data: {
        title: 'foo',
        description: 'bar',
        style: {
          height: '10px',
        },
      },
    });

    expect(section.name).toEqual('hoge');
    expect(section.title).toEqual('foo');
    expect(section.description).toEqual('bar');
    expect(section.style).toMatchObject({
      height: '10px',
    });
  });

  test('.export', () => {
    const section = new Section('hoge', {data: {}});
    const exported = section.export();

    expect(exported).toHaveProperty('name');
    expect(exported).toHaveProperty('title');
    expect(exported).toHaveProperty('description');
    expect(exported).toHaveProperty('style');
    expect(exported).toHaveProperty('html');
    expect(exported).toHaveProperty('css');
    expect(exported).toHaveProperty('items');
  });
});
