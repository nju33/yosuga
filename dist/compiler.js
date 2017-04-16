'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _pify = require('pify');

var _pify2 = _interopRequireDefault(_pify);

var _nodeSass = require('node-sass');

var _nodeSass2 = _interopRequireDefault(_nodeSass);

var _less = require('less');

var _less2 = _interopRequireDefault(_less);

var _stylus = require('stylus');

var _stylus2 = _interopRequireDefault(_stylus);

var _cssnano = require('cssnano');

var _cssnano2 = _interopRequireDefault(_cssnano);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = {
  scss($css, dirpath) {
    return _asyncToGenerator(function* () {
      const render = (0, _pify2.default)(_nodeSass2.default.render.bind(_nodeSass2.default));
      const result = yield render({
        data: $css,
        includePaths: [dirpath + '/']
      });
      return result.css.toString();
    })();
  },
  less($css, dirpath) {
    return _asyncToGenerator(function* () {
      const render = (0, _pify2.default)(_less2.default.render.bind(_less2.default));
      const result = yield render($css, {
        paths: [dirpath]
      });
      return result.css;
    })();
  },
  stylus($css, dirpath) {
    return _asyncToGenerator(function* () {
      const render = (0, _pify2.default)(_stylus2.default.render.bind(_stylus2.default));
      const css = yield render($css, {
        paths: [dirpath]
      });
      return css;
    })();
  },
  __cssnano($css) {
    return _asyncToGenerator(function* () {
      const result = yield _cssnano2.default.process($css);
      return result.css;
    })();
  }
};
module.exports = exports['default'];