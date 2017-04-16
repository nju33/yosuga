module.exports = {
  /*
  ** Headers of the page
  */
  head: {
    title: 'Yosuga',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Nuxt.js project' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: 'favicon.ico' },
      { rel: 'stylesheet', href: 'yosuga.css' },
      { rel: 'stylesheet', href: '//fonts.googleapis.com/css?family=Source+Code+Pro' }
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#3B8070' },
  /*
  ** Build configuration
  */
  generate: {
    dir: '../../docs'
  },
  router: {
    base: '/yosuga/',
  },
  build: {
    /*
    ** Run ESLINT on save
    */
    // postcss: preset({
    //   variants: {
    //     'Source Code Pro': {
    //       '400': []
    //     }
    //   },
    //   foundries: ['google']
    // }),
    extend (config, ctx) {
      if (/node_modules/.test(__dirname)) {
        config.module.rules[1].exclude = /yosuga\/node_modules\/(?!\.nuxt)/;
      }
      // config.resolve.alias.highlight = 'highlight.js';
      // config.resolve.alias.enforceExtension: false;
      // config.resolve.ali
      // if (ctx.isClient) {
      //   config.module.rules.push({
      //     enforce: 'pre',
      //     test: /\.(js|vue)$/,
      //     loader: 'eslint-loader',
      //     exclude: /(node_modules)/
      //   })
      // }
    }
  }
}
