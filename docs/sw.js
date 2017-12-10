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
    "url": "/yosuga/_nuxt/common.d25cde6fdc5cd49db353.js",
    "revision": "f96b3842f8e96719f7450b88c8a8428b"
  },
  {
    "url": "/yosuga/_nuxt/layouts/default.ee665b8ad46016d2c5b2.js",
    "revision": "f7229ba76711ac48c672d9387010bcc4"
  },
  {
    "url": "/yosuga/_nuxt/manifest.00b10740241c1c0878d9.js",
    "revision": "9a2d40fa5072a7724765a9a5bcc916c2"
  },
  {
    "url": "/yosuga/_nuxt/pages/index.1270f041ccd2a968c067.js",
    "revision": "ce109432987c457d8ac8664ef10f8e0f"
  },
  {
    "url": "/yosuga/_nuxt/pages/sections/_name.7d90ed1a98b0fe119717.js",
    "revision": "4aa7bbd8013e29932d8b10ed5408ba90"
  }
])


workboxSW.router.registerRoute(new RegExp('/yosuga/_nuxt/.*'), workboxSW.strategies.cacheFirst({}), 'GET')

workboxSW.router.registerRoute(new RegExp('/yosuga/.*'), workboxSW.strategies.networkFirst({}), 'GET')

workboxSW.router.registerRoute(new RegExp('https://fonts.googleapis.com/css?family=.*'), workboxSW.strategies.cacheFirst({}), 'GET')

