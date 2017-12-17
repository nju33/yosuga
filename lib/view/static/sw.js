importScripts('/yosuga/_nuxt/workbox.476439e0.js')

const workboxSW = new self.WorkboxSW({
  "cacheId": "yosuga",
  "clientsClaim": true,
  "directoryIndex": "/"
})

workboxSW.precache([
  {
    "url": "/yosuga/_nuxt/app.2fd35e5b6f418d10e9a1.js",
    "revision": "18b0d0f42bb958ba9a51854a1c65be21"
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
    "url": "/yosuga/_nuxt/manifest.f7c4415a54c447264d5f.js",
    "revision": "b95e6923ebc8d2ca1eb6cd14d2d458c4"
  },
  {
    "url": "/yosuga/_nuxt/pages/index.30752d8d701cd6152e58.js",
    "revision": "42727d1984a77e9e91a5d66730a0b4cd"
  },
  {
    "url": "/yosuga/_nuxt/pages/sections/_name.3061733fd67d37721fcc.js",
    "revision": "348e59185fc35497b065e05f68de7352"
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

