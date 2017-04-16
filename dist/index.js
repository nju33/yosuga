'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

let canUsePort3333 = (() => {
  var _ref5 = _asyncToGenerator(function* () {
    const num = yield (0, _getPort2.default)(3333);
    return num === 3333;
  });

  return function canUsePort3333() {
    return _ref5.apply(this, arguments);
  };
})();

let validate = (() => {
  var _ref6 = _asyncToGenerator(function* (data) {
    for (const sectionName in data) {
      const targets = Object.keys(data[sectionName]);
      if (targets.length < 2) {
        return true;
      }

      const $contents = targets.map((() => {
        var _ref7 = _asyncToGenerator(function* (target) {
          const result = yield _compiler2.default.__cssnano(data[sectionName][target]);
          return result;
        });

        return function (_x4) {
          return _ref7.apply(this, arguments);
        };
      })());
      const contents = yield Promise.all($contents);
      const standard = contents[0];
      const bool = contents.slice(1).every(function (content) {
        return standard === content;
      });

      if (!bool) {
        throw new Error(`
${sectionName} section is missing.

${sectionName}:
${contents.map(function (c, i) {
          return `  [${targets[i]}]\n    ${c}`;
        }).join('\n')}
      `.trim());
      }
    }
    return true;
  });

  return function validate(_x3) {
    return _ref6.apply(this, arguments);
  };
})();

let getContent = (() => {
  var _ref8 = _asyncToGenerator(function* (file) {
    const readFile = (0, _pify2.default)(_fs2.default.readFile);
    const content = yield readFile(file, 'utf-8');
    return content;
  });

  return function getContent(_x5) {
    return _ref8.apply(this, arguments);
  };
})();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _pify = require('pify');

var _pify2 = _interopRequireDefault(_pify);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

var _marked = require('marked');

var _marked2 = _interopRequireDefault(_marked);

var _aru = require('aru');

var _aru2 = _interopRequireDefault(_aru);

var _case = require('case');

var _case2 = _interopRequireDefault(_case);

var _execa = require('execa');

var _execa2 = _interopRequireDefault(_execa);

var _getPort = require('get-port');

var _getPort2 = _interopRequireDefault(_getPort);

var _compiler = require('./compiler');

var _compiler2 = _interopRequireDefault(_compiler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const defaultOpts = {
  base: _path2.default.resolve('yosuga'),
  targets: ['css', 'less', 'scss', 'stylus'],
  accentColor: '#cb1b45',
  subColor: '#282425',
  baseColor: '#f3f3f3'
};

const compiled = {};

exports.default = (() => {
  var _ref = _asyncToGenerator(function* (sections = null, $opts = defaultOpts) {
    if (sections === null) {
      throw new Error('sections must be required');
    }

    const opts = Object.assign({}, defaultOpts, $opts);
    const $css = _postcss2.default.root();
    $css.append(_postcss2.default.atRule({
      name: 'charset',
      params: '"utf-8"'
    }));

    const data = yield Promise.all(['html', ...opts.targets].map((() => {
      var _ref2 = _asyncToGenerator(function* (target) {
        const pattern = _path2.default.join(opts.base, target, '**/*');
        const $files = yield (0, _pify2.default)(_glob2.default)(pattern);
        const files = $files.filter(function (f) {
          const extname = _path2.default.extname(f);
          return !_path2.default.basename(f, extname).endsWith('$');
        });
        const $data = {
          target,
          section: {}
        };

        yield Promise.all(files.map((() => {
          var _ref3 = _asyncToGenerator(function* (file) {
            const extname = _path2.default.extname(file);
            const dirname = _path2.default.dirname(file);
            const basename = _path2.default.basename(file, extname);
            $data.section[basename] = yield getContent(file);

            if (target === 'html' || target === 'css') {
              return;
            }

            const alternativeFile = getAlternativeFilePath(file);
            try {
              yield (0, _pify2.default)(_fs2.default.access)(alternativeFile, _fs2.default.constants.F_OK);
              const alternativeContents = yield (0, _pify2.default)(_fs2.default.readFile)(alternativeFile, 'utf-8');

              if (typeof compiled[basename] === 'undefined') {
                compiled[basename] = {};
              }
              compiled[basename][target] = yield _compiler2.default[target](alternativeContents, dirname);
            } catch (err) {}
          });

          return function (_x2) {
            return _ref3.apply(this, arguments);
          };
        })()));

        return $data;
      });

      return function (_x) {
        return _ref2.apply(this, arguments);
      };
    })()));

    if (Object.keys(compiled).length > 0) {
      yield validate(compiled);
    }

    sections.map(function (section) {
      if (typeof section.name === 'undefined') {
        return section;
      }

      section.title = _case2.default.capital(section.name);
      if (section.description) {
        section.description = (0, _marked2.default)(section.description.trim());
      }

      data.forEach(function (item) {
        if (typeof item.section[section.name] === 'undefined') {
          return;
        }

        if (typeof section.items === 'undefined') {
          section.items = {};
        }

        if (item.target === 'html') {
          section.html = item.section[section.name] || null;
        } else {
          const style = item.section[section.name].trim();
          section.items[item.target] = style;

          if (item.target === 'css') {
            $css.append(_postcss2.default.parse(style));
          }
        }
      });
    });

    const dataFilename = _path2.default.join(__dirname, '../lib/_view/lib/data.json');
    const optsFilename = _path2.default.join(__dirname, '../lib/_view/lib/opts.json');
    const styleFilename = _path2.default.join(__dirname, '../lib/_view/static/yosuga.css');

    const writeFile = (0, _pify2.default)(_fs2.default.writeFile);
    const access = (0, _pify2.default)(_fs2.default.access);
    yield (0, _aru2.default)('dataFile', access(dataFilename, _fs2.default.constants.F_OK));
    yield _aru2.default.left('dataFile', _asyncToGenerator(function* () {
      const mkdir = (0, _pify2.default)(_fs2.default.mkdir);
      yield mkdir(_path2.default.dirname(dataFilename));
    }));

    yield writeFile(dataFilename, JSON.stringify(sections));
    yield writeFile(optsFilename, JSON.stringify(opts));
    yield writeFile(styleFilename, $css.toString());

    const bool = yield canUsePort3333();
    if (bool) {
      (0, _execa2.default)('yarn', ['dev'], {
        cwd: `${__dirname}/lib/_view`,
        reject: false
      }).stdout.pipe(process.stdout);
    } else {
      throw new Error('listen EADDRINUSE 127.0.0.1:3333');
    }
  });

  function yosuga() {
    return _ref.apply(this, arguments);
  }

  return yosuga;
})();

function hasCSSInTargets(targets) {
  return targets.indexOf('css') > -1;
}

function getAlternativeFilePath(filename) {
  const extname = _path2.default.extname(filename);
  const dirname = _path2.default.dirname(filename);
  const basename = _path2.default.basename(filename, extname);
  return dirname + '/' + basename + '$' + extname;
}

module.exports = exports['default'];