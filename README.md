# yosuga

CSS styleguide generator

[![npm: nju33/yosuga](https://img.shields.io/npm/v/yosuga.svg)](https://www.npmjs.com/package/yosuga)
[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)
[![CircleCI](https://circleci.com/gh/nju33/yosuga.svg?style=svg)](https://circleci.com/gh/nju33/yosuga)
[![Coverage Status](https://coveralls.io/repos/github/nju33/yosuga/badge.svg?branch=master)](https://coveralls.io/github/nju33/yosuga?branch=master)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![license: mit](https://img.shields.io/packagist/l/doctrine/orm.svg)

## Demo

### Page

[https://nju33.github.io/yosuga/](https://nju33.github.io/yosuga/)
![yosuga: screenshot](https://github.com/nju33/yosuga/blob/master/assets/screenshot.png?raw=true)

### Embed by `<iframe/>`

![yosuga: embed-screenshot](https://github.com/nju33/yosuga/blob/master/assets/embed-screenshot.png?raw=true)


## QuickStart

[https://github.com/nju33/yosuga-quickstart](https://github.com/nju33/yosuga-quickstart)

## CLI

[https://github.com/nju33/yosuga-cli](https://github.com/nju33/yosuga-cli)

## Install
```bash
yarn add -D yosuga
npm i -D yosuga
```

## Usage

### Example

#### Code

```js
import Yosuga from 'yosuga';

const yosuga = new Yosuga({
  icon: 'icon.png',
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
  // for development
    yosuga.serve();

  // if production
    // yosuga.generate('/yosuga/');
  })
  .catch(err => {
    console.log(err);
  });
```

#### Tree

Each (alt)css file must output the same content between the same basename.
For targets other than `css`, `* .yosuga.*` is actually used for comparison.

```bash
.
├── css                          // optional
│   ├── button.css
│   ├── card.css
│   ├── nav.css
│   ├── tab.css
│   └── table.css
├── icon.png                     // optional
├── less                         // optional
│   ├── button.less
│   └── button.yosuga.less
├── postcss                      // optional
│   ├── button.css
│   └── button.yosuga.css
├── sass                         // optional
│   ├── button.scss
│   ├── button.yosuga.scss
│   ├── card.scss
│   ├── card.yosuga.scss
│   ├── nav.scss
│   ├── nav.yosuga.scss
│   ├── table.scss
│   └── table.yosuga.scss
├── stylus                       // optional
│   ├── button.styl
│   └── button.yosuga.styl
└── yosuga
    ├── button.html
    ├── card.html
    ├── nav.html
    ├── tab.html
    └── table.html
```

For example, if `opts.main` is set to `less`, only the `button` will be included in the site.

### Options

```js
interface Options {
  // Base directory
  base: `${process.cwd()}/example`;

  // Site's icon(logo) file name. This is as follows
  // `path.join(opts.base, opts.icon)`, if there is
  icon?: string;

  // Site's title
  name?: string;

  // Main (alt)css
  main?: 'css' | 'postcss' | 'sass' | 'less' | 'stylus';
  // default is `css`

  // Regular expression of filename that does not require HTML
  // e.g. `/variable/`
  ignore?: RegExp,

  // Map of each directory name
  dirs?: {
    // ``path.join(opts.base, opts.dirs.yosuga)`
    yosuga?: string;
    // ``path.join(opts.base, opts.dirs.css)`
    css?: string
    // ``path.join(opts.base, opts.dirs.postcss)`
    postcss?: string
    // ``path.join(opts.base, opts.dirs.sass)`
    sass?: string
    // ``path.join(opts.base, opts.dirs.less)`
    less?: string
    // ``path.join(opts.base, opts.dirs.stylus)`
    stylus?: string
  },
  //
  // defaults
  //
  // dirs: {
  //   yosuga: 'yosuga',
  //   css: 'css',
  //   postcss: 'postcss',
  //   sass: 'sass',
  //   less: 'less',
  //   stylus: 'stylus',
  // }

  // `nuxt.generate`
  generate?: {
    dir?: 'docs';
  };


  // Adjust to your liking
  style?: {
    fontSize?: string;
    accentColor?: string;
  };
  //
  // default
  //
  // style: {
  //  fontSize: '13px',
  //  accentColor: '#cb1b45'
  // }

  // Adjust the contents
  contents?: {
    readme?: boolean; // Add project README.md
  };
  //
  // default
  //
  // contents: {
  //  readme: true,
  // }
}
```

## License

The MIT License (MIT)

Copyright (c) 2018 nju33 <nju33.ki@gmail.com>
