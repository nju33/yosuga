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
    "url": "/yosuga/_nuxt/manifest.cb53257501aabd90e414.js",
    "revision": "4c29f484bd133913b9ce2495566d0f94"
  },
  {
    "url": "/yosuga/_nuxt/pages/index.67b19758c45f59abd91a.js",
    "revision": "8c9033b081c54916b63ca05ac0b2cfa4"
  },
  {
    "url": "/yosuga/_nuxt/pages/sections/_name.60bb44431884d8ca9943.js",
    "revision": "e14c67748c1c4b8cc2b4be6eb605d93f"
  }
])


workboxSW.router.registerRoute(new RegExp('/yosuga/_nuxt/.*'), workboxSW.strategies.cacheFirst({}), 'GET')

workboxSW.router.registerRoute(new RegExp('/yosuga/.*'), workboxSW.strategies.networkFirst({}), 'GET')

