# yosuga

CSS styleguide generator

[![npm: nju33/yosuga](https://img.shields.io/npm/v/yosuga.svg)](https://www.npmjs.com/package/yosuga)
[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)
[![CircleCI](https://circleci.com/gh/nju33/yosuga.svg?style=svg)](https://circleci.com/gh/nju33/yosuga)[![Coverage Status](https://coveralls.io/repos/github/nju33/yosuga/badge.svg?branch=master)](https://coveralls.io/github/nju33/yosuga?branch=master)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![license: mit](https://img.shields.io/packagist/l/doctrine/orm.svg)

## Demo

[https://nju33.github.io/yosuga/](https://nju33.github.io/yosuga/)

![yosuga: screenshot](https://github.com/nju33/yosuga/blob/master/assets/screenshot.png?raw=true)

## Install
```bash
yarn add -D yosuga
npm i -D yosuga
```

## Usage

### Example

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

### Options

```js
interface Options {
	// Base directory
	base: `${process.cwd()}/example`,
	// Site's icon(logo) file name. This is as follows
	// `path.join(opts.base, opts.icon)`, if there is
	icon?: string,
	// Site's title
	name?: string,
	// Main (alt)css
	main?: 'css' | 'postcss' | 'sass' | 'less' | 'stylus',
	// Adjust to your liking
	style: {
		fontSize?: string,
		accentColor?: string,
	},
	// `nuxt.generate`
	generate?: {
		dir?: 'docs',
	},
}
```

## License

The MIT License (MIT)

Copyright (c) 2017 nju33 <nju33.ki@gmail.com>
