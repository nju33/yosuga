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
    "url": "/yosuga/_nuxt/manifest.87d2ed7ad31ed762bbae.js",
    "revision": "de0414551402b34d3285eca3a0822ea4"
  },
  {
    "url": "/yosuga/_nuxt/pages/index.619bbbfad4c163b5f30f.js",
    "revision": "2712793639f20c513105d9fdb73ffceb"
  },
  {
    "url": "/yosuga/_nuxt/pages/sections/_name.ffcd7a3267fbaf84df0a.js",
    "revision": "aaa1e7193156121a6aab200fb6f37a98"
  }
])


workboxSW.router.registerRoute(new RegExp('/yosuga/_nuxt/.*'), workboxSW.strategies.cacheFirst({}), 'GET')

workboxSW.router.registerRoute(new RegExp('/yosuga/.*'), workboxSW.strategies.networkFirst({}), 'GET')

workboxSW.router.registerRoute(new RegExp('https://fonts.googleapis.com/css?family=.*'), workboxSW.strategies.cacheFirst({}), 'GET')

