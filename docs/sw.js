importScripts('/yosuga/_nuxt/workbox.476439e0.js')

const workboxSW = new self.WorkboxSW({
  "cacheId": "yosuga",
  "clientsClaim": true,
  "directoryIndex": "/"
})

workboxSW.precache([
  {
    "url": "/yosuga/_nuxt/app.cba20b1ff22c3ddc7680.js",
    "revision": "47aaed4d4a32721315bbe8a120aa8f38"
  },
  {
    "url": "/yosuga/_nuxt/common.d25cde6fdc5cd49db353.js",
    "revision": "f96b3842f8e96719f7450b88c8a8428b"
  },
  {
    "url": "/yosuga/_nuxt/layouts/default.e91abdcfede10cc06aa5.js",
    "revision": "d2537010040dd3722fc5ac754e2479ae"
  },
  {
    "url": "/yosuga/_nuxt/manifest.2bdd97047b076325808a.js",
    "revision": "07909027db015e881196b28c1dae4765"
  },
  {
    "url": "/yosuga/_nuxt/pages/index.7b523a8ffd6fb2537d24.js",
    "revision": "187dd1898e827b9a42a332b4820e81dc"
  },
  {
    "url": "/yosuga/_nuxt/pages/sections/_name.567c97cfc9afcf9841bb.js",
    "revision": "015939458caee35f2a3f4b84ef4f886c"
  }
])


workboxSW.router.registerRoute(new RegExp('/yosuga/_nuxt/.*'), workboxSW.strategies.cacheFirst({}), 'GET')

workboxSW.router.registerRoute(new RegExp('/yosuga/.*'), workboxSW.strategies.networkFirst({}), 'GET')

workboxSW.router.registerRoute(new RegExp('https://fonts.googleapis.com/css?family=.*'), workboxSW.strategies.cacheFirst({}), 'GET')

