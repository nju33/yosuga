importScripts('/yosuga/_nuxt/workbox.476439e0.js')

const workboxSW = new self.WorkboxSW({
  "cacheId": "yosuga",
  "clientsClaim": true,
  "directoryIndex": "/"
})

workboxSW.precache([
  {
    "url": "/yosuga/_nuxt/app.325868885aae299ef07c.js",
    "revision": "f6855702f30d761a613410b049f64a94"
  },
  {
    "url": "/yosuga/_nuxt/common.4155db0029fc15e3d6b5.js",
    "revision": "736a8560c578a1750f76e591be70ac66"
  },
  {
    "url": "/yosuga/_nuxt/layouts/default.ee665b8ad46016d2c5b2.js",
    "revision": "f7229ba76711ac48c672d9387010bcc4"
  },
  {
    "url": "/yosuga/_nuxt/manifest.c01cb06c83e0794c4fc9.js",
    "revision": "e3e9d929f24a88d40501552f9e76a599"
  },
  {
    "url": "/yosuga/_nuxt/pages/index.04dc8762166cceb030ba.js",
    "revision": "1302483ff4ca8cb2f6c75c89ba10e4c5"
  },
  {
    "url": "/yosuga/_nuxt/pages/sections/_name.bd41b27350563f705a2f.js",
    "revision": "76b670e6000f4452098bdf3e30dfc3f8"
  }
])


workboxSW.router.registerRoute(new RegExp('/yosuga/_nuxt/.*'), workboxSW.strategies.cacheFirst({}), 'GET')

workboxSW.router.registerRoute(new RegExp('/yosuga/.*'), workboxSW.strategies.networkFirst({}), 'GET')

workboxSW.router.registerRoute(new RegExp('https://fonts.googleapis.com/css?family=.*'), workboxSW.strategies.cacheFirst({}), 'GET')

workboxSW.router.registerRoute(new RegExp('https://github.com/.*'), workboxSW.strategies.cacheFirst({}), 'GET')

workboxSW.router.registerRoute(new RegExp('https://img.shields.io/.*'), workboxSW.strategies.cacheFirst({}), 'GET')

workboxSW.router.registerRoute(new RegExp('https://circleci.com/.*'), workboxSW.strategies.cacheFirst({}), 'GET')

workboxSW.router.registerRoute(new RegExp('https://coveralls.io/.*'), workboxSW.strategies.cacheFirst({}), 'GET')

workboxSW.router.registerRoute(new RegExp(''), workboxSW.strategies.cacheFirst({}), 'GET')

