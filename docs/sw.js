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
    "url": "/yosuga/_nuxt/manifest.4894466efdfeeefb3d2c.js",
    "revision": "0421bd66a36e59fa5eff181ea43cc25e"
  },
  {
    "url": "/yosuga/_nuxt/pages/index.6154f69ed15545784ebb.js",
    "revision": "8d8a4855c6007b7886f161a2fc6db9eb"
  },
  {
    "url": "/yosuga/_nuxt/pages/sections/_name.10d7e3ff0facd3ca1ee9.js",
    "revision": "f993c03deecf162e726b3a2f42ccbf01"
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

