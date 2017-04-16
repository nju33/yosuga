<template>
  <div class="box code__box">
    <div class="view" v-html="html"></div>
    <div class="editor">
      <div class="tab-bar">
        <div class="tab" :class="activeTarget === target ? 'active' : ''" v-for="(code, target) in items" v-text="target" @click="activate(target)"/>
      </div>
      <div class="content-block">
        <div class="content"
          v-for="(code, target) in items"
          v-if="activeTarget === target"
        >
          <pre class="code-wrapper"><code v-html="highlight(target, code)"></code></pre>
          <button class="button--copy--code" :data-clipboard-text="code">
            <svg class="octicon octicon-clippy" viewBox="0 0 14 16" version="1.1" aria-hidden="true"><path fill-rule="evenodd" d="M2 13h4v1H2v-1zm5-6H2v1h5V7zm2 3V8l-3 3 3 3v-2h5v-2H9zM4.5 9H2v1h2.5V9zM2 12h2.5v-1H2v1zm9 1h1v2c-.02.28-.11.52-.3.7-.19.18-.42.28-.7.3H1c-.55 0-1-.45-1-1V4c0-.55.45-1 1-1h3c0-1.11.89-2 2-2 1.11 0 2 .89 2 2h3c.55 0 1 .45 1 1v5h-1V6H1v9h10v-2zM2 5h8c0-.55-.45-1-1-1H8c-.55 0-1-.45-1-1s-.45-1-1-1-1 .45-1 1-.45 1-1 1H3c-.55 0-1 .45-1 1z"></path></svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Clipboard from 'clipboard';
import hljs from 'highlight.js/lib/highlight';
import css from 'highlight.js/lib/languages/css';
import scss from 'highlight.js/lib/languages/scss';
import less from 'highlight.js/lib/languages/less';
import stylus from 'highlight.js/lib/languages/stylus';
import theme from 'highlight.js/styles/atom-one-dark.css';

export default {
  props: {
    opts: {
      type: Object
    },
    html: {
      type: String,
      required: true
    },
    items: {
      type: Object,
      required: true,
      default: () => {}
    },
  },
  name: 'Code',
  data() {
    return {
      activeTarget: null
    };
  },
  methods: {
    highlight(target, code) {
      return hljs.highlight(target, code).value;
    },
    activate(target) {
      this.activeTarget = target;
    }
  },
  beforeMount() {
    hljs.registerLanguage('css', css);
    hljs.registerLanguage('scss', scss);
    hljs.registerLanguage('less', less);
    hljs.registerLanguage('stylus', stylus);
  },
  mounted() {
    this.activeTarget = Object.keys(this.items)[0];
    const clipboard = new Clipboard('.button--copy--code');
  }
}
</script>

<style>
.code__box pre code{
  font-family: 'Source Code Pro', monospace;
}
</style>

<style scoped>
.box {
  background: #fff;
  display: flex;
}

.view {
  /*max-width: calc(100% - 20em);*/
  /*min-width: calc(100% - 20em);*/
  /*flex: 1 1 calc(100% - 20em);*/
  display: flex;
  flex: auto;
  align-items: center;
  justify-content: center;
  padding: .5em;
  box-sizing: border-box;
}

.editor {
  max-width: 50%;
  min-width: 50%;
  flex: 1 0 50%;
  /*flex: auto;*/
  background: #282c34;
  color: #f8f8f8;
  font-size: .9em;
  box-sizing: border-box;
}

.tab-bar {
  display: flex;
  background: #21252b;
}

.tab {
  padding: .3em .5em;
  user-select: none;
  box-sizing: border-box;
  cursor: pointer;
}

.tab.active {
  background: #282c34;
}

.tab:not(.active) {
  border-bottom: #181a1f;
}

.content {
  padding: calc(.5em * 0.9) calc(.7em * 0.9);
  height: 40vh;
  overflow: hidden;
  position: relative;
  color: #9da5b4;
}

.code-wrapper {
  margin: 0;
  overflow: auto;
  height: 40vh;
}

.button--copy--code {
  position: absolute;
  right: 1em;
  top: 0;
  width: 2em;
  height: 2em;
  background: transparent;
  /*border: 1px solid;*/
  border: none;
  background: rgba(255,255,255,.2);
  outline: none;
  cursor: pointer;
  transition: .2s;
}

.button--copy--code:active {
  background: rgba(255,255,255,0);
}

.button--copy--code svg {
  position: absolute;
  top: .3em;
  left: .4em;
  display: block;
  fill: #9da5b4;
  width: 1.3em;
  height: 1.3em;
}
</style>
