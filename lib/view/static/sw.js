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
    "url": "/yosuga/_nuxt/manifest.767d2a85d812b021f87f.js",
    "revision": "372d618405d343f5b9c744ffc568a279"
  },
  {
    "url": "/yosuga/_nuxt/pages/index.c98b9d2e66d140b3d5bf.js",
    "revision": "15987e67f2fdaa04c461e488f69ee72e"
  },
  {
    "url": "/yosuga/_nuxt/pages/sections/_name.ffcd7a3267fbaf84df0a.js",
    "revision": "aaa1e7193156121a6aab200fb6f37a98"
  }
])


workboxSW.router.registerRoute(new RegExp('/yosuga/_nuxt/.*'), workboxSW.strategies.cacheFirst({}), 'GET')

workboxSW.router.registerRoute(new RegExp('/yosuga/.*'), workboxSW.strategies.networkFirst({}), 'GET')

workboxSW.router.registerRoute(new RegExp('https://fonts.googleapis.com/css?family=.*'), workboxSW.strategies.cacheFirst({}), 'GET')

