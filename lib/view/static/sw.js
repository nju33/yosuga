importScripts('/yosuga/_nuxt/workbox.476439e0.js')

const workboxSW = new self.WorkboxSW({
  "cacheId": "yosuga",
  "clientsClaim": true,
  "directoryIndex": "/"
})

workboxSW.precache([
  {
    "url": "/yosuga/_nuxt/app.873e8c517bf8f41f52aa.js",
    "revision": "3c205b90081efb4ebe2959fc125cfb67"
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
    "url": "/yosuga/_nuxt/manifest.91af43e87f4c410ae8c7.js",
    "revision": "5528aae7bbd66e7cbd572178f3152585"
  },
  {
    "url": "/yosuga/_nuxt/pages/index.9eaa92a540e72168c49f.js",
    "revision": "099ad3c2f7219cd9fd1691286bc55879"
  },
  {
    "url": "/yosuga/_nuxt/pages/sections/_name.882ca47a8f70cf4f347f.js",
    "revision": "aea27b84c195674f21046177c790b1bf"
  }
])


workboxSW.router.registerRoute(new RegExp('/yosuga/_nuxt/.*'), workboxSW.strategies.cacheFirst({}), 'GET')

workboxSW.router.registerRoute(new RegExp('/yosuga/.*'), workboxSW.strategies.networkFirst({}), 'GET')

workboxSW.router.registerRoute(new RegExp('https://fonts.googleapis.com/css?family=.*'), workboxSW.strategies.cacheFirst({}), 'GET')

