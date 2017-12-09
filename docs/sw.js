importScripts('/yosuga/_nuxt/workbox.dev.7002ba07.js')

const workboxSW = new self.WorkboxSW({
  "cacheId": "yosuga",
  "clientsClaim": true,
  "directoryIndex": "/"
})

workboxSW.precache([
  {
    "url": "/yosuga/_nuxt/app.2eda57c3c08c69c7ba16.js",
    "revision": "ca747e8d08933f88047dcda6a63ff10f"
  },
  {
    "url": "/yosuga/_nuxt/common.99599cbbdb01c347ca4b.js",
    "revision": "bb2cbad5afde8493baced74237026933"
  },
  {
    "url": "/yosuga/_nuxt/layouts/default.ee665b8ad46016d2c5b2.js",
    "revision": "f7229ba76711ac48c672d9387010bcc4"
  },
  {
    "url": "/yosuga/_nuxt/manifest.3da1e122fb44160f281e.js",
    "revision": "243c048d37023cb0248bbc8b6cadf95a"
  },
  {
    "url": "/yosuga/_nuxt/pages/index.c9c93658ac470ba9c86b.js",
    "revision": "971af48b63d926f55778295537f60c67"
  },
  {
    "url": "/yosuga/_nuxt/pages/sections/_name.cebe32e66b3048677227.js",
    "revision": "f11c8f640c9858cd9f04e3f555b3ac99"
  }
])


workboxSW.router.registerRoute(new RegExp('/yosuga/_nuxt/.*'), workboxSW.strategies.cacheFirst({}), 'GET')

workboxSW.router.registerRoute(new RegExp('/yosuga/.*'), workboxSW.strategies.networkFirst({}), 'GET')

