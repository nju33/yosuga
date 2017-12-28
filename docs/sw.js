importScripts('/yosuga/_nuxt/workbox.476439e0.js')

const workboxSW = new self.WorkboxSW({
  "cacheId": "yosuga",
  "clientsClaim": true,
  "directoryIndex": "/"
})

workboxSW.precache([
  {
    "url": "/yosuga/_nuxt/app.0a86a190f4666162300c.js",
    "revision": "9fc6cd143c25bcd1452525e5571a88aa"
  },
  {
    "url": "/yosuga/_nuxt/common.4155db0029fc15e3d6b5.js",
    "revision": "736a8560c578a1750f76e591be70ac66"
  },
  {
    "url": "/yosuga/_nuxt/layouts/default.e91abdcfede10cc06aa5.js",
    "revision": "d2537010040dd3722fc5ac754e2479ae"
  },
  {
    "url": "/yosuga/_nuxt/manifest.c70b465e85193b8f28bd.js",
    "revision": "941f1a39e1b8556af1003033a26add33"
  },
  {
    "url": "/yosuga/_nuxt/pages/index.2e6367a091e2d580d9b3.js",
    "revision": "c98066625092db570cfc6258181945da"
  },
  {
    "url": "/yosuga/_nuxt/pages/sections/_name.ef6b3388a8fc70a60dca.js",
    "revision": "d85683d827a0853c89b95ce74adf2f1f"
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

