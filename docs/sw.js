importScripts('/yosuga/_nuxt/workbox.476439e0.js')

const workboxSW = new self.WorkboxSW({
  "cacheId": "yosuga",
  "clientsClaim": true,
  "directoryIndex": "/"
})

workboxSW.precache([
  {
    "url": "/yosuga/_nuxt/app.7c30a3b06538ab94e5ed.js",
    "revision": "16f73d669da3233d18027ebf2ae80e6f"
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
    "url": "/yosuga/_nuxt/manifest.dc623c735daa0c412a8a.js",
    "revision": "f939bf4242c09cf23835b6f578e04eb7"
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

workboxSW.router.registerRoute(new RegExp('https://fonts.googleapis.com/css?family=.*'), workboxSW.strategies.cacheFirst({}), 'GET')

