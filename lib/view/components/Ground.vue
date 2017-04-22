<template>
  <div class="box code__box" :style="{height: isSectionPage ? '100vh' : null}">
    <div class="view" ref="view" v-html="html" :style="{
      flexBasis: viewWidth === null ? '' : viewWidth,
      maxWidth: viewWidth === null ? '' : viewWidth,
      minWidth: viewWidth === null ? '' : viewWidth
    }"></div>
    <div class="br"
      @mousedown="onDragStart"
    ></div>
    <div class="editor">
      <div class="tab-bar">
        <div class="tab" :class="activeTarget === target ? 'active' : ''" v-for="(code, target) in items" v-text="target" @click="activate(target)"/>
      </div>
      <div class="content-block">
        <div class="content"
          v-for="(code, target) in items"
          v-if="activeTarget === target"
        >
          <pre class="code-wrapper"><code v-html="highlight(target, code, altItems[target])"></code></pre>
          <button class="button--copy--code" :data-clipboard-text="code">
            <svg class="octicon octicon-clippy" viewBox="0 0 14 16" version="1.1" aria-hidden="true"><path fill-rule="evenodd" d="M2 13h4v1H2v-1zm5-6H2v1h5V7zm2 3V8l-3 3 3 3v-2h5v-2H9zM4.5 9H2v1h2.5V9zM2 12h2.5v-1H2v1zm9 1h1v2c-.02.28-.11.52-.3.7-.19.18-.42.28-.7.3H1c-.55 0-1-.45-1-1V4c0-.55.45-1 1-1h3c0-1.11.89-2 2-2 1.11 0 2 .89 2 2h3c.55 0 1 .45 1 1v5h-1V6H1v9h10v-2zM2 5h8c0-.55-.45-1-1-1H8c-.55 0-1-.45-1-1s-.45-1-1-1-1 .45-1 1-.45 1-1 1H3c-.55 0-1 .45-1 1z"></path></svg>
          </button>
        </div>
      </div>
    </div>
    <div class="cover" ref="cover" style="display:none"></div>
  </div>
</template>

<script>
import Clipboard from 'clipboard';
import throttle from 'lodash.throttle';
import debounce from 'lodash.debounce';
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
    altItems: {
      type: Object,
      requried: true,
      default: () => {}
    }
  },
  name: 'Code',
  data() {
    return {
      activeTarget: null,
      dragging: false,

      onThrottleDragMove: null,
      onDebounceDragMove: null,
      onDragEnd: null,

      viewWidth: null
    };
  },
  methods: {
    highlight(target, code, altCode = null) {
      if (altCode !== null) {
        if (target === 'css' || target === 'postcss') {
          code += `
/*
${altCode.trim()}
*/
          `;
        } else {
          code += `
${altCode.split('\n').map(c => `// ${c}`).join('\n')}
          `;
        }
      }

      if (target === 'postcss') {
        target = 'css';
      }

      return hljs.highlight(target, code).value;
    },
    activate(target) {
      this.activeTarget = target;
    },
    onDragStart() {
      this.dragging = true;
      this.$refs.cover.style.display = 'block';
    },
    createDragEnd() {
      this.dragging = false;
      this.$refs.cover.style.display = 'none';
    },
    createThrottleDragMove: throttle(function () {
      this.handleDragMove.apply(this, arguments);
    }, 50),
    createDebounceDragMove: debounce(function () {
      this.handleDragMove.apply(this, arguments);
    }, 50),
    handleDragMove(ev) {
      const view = this.$refs.view;
      if (!this.dragging || typeof view.clientWidth === 'undefined') {
        return;
      }
      const currentWidth = view.clientWidth;
      let nextWidth = ev.pageX;
      if (nextWidth < 50) {
        nextWidth = 50;
      } else if (nextWidth > innerWidth - 50) {
        nextWidth = innerWidth - 50;
      }
      const nextWidthPer = nextWidth / innerWidth;
      this.viewWidth = nextWidthPer * 100 + 'vw';
    }
  },
  computed: {
    isSectionPage() {
      return this.$route.name.startsWith('sections');
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

    this.onThrottleDragMove = this.createThrottleDragMove.bind(this);
    this.onDebounceDragMove = this.createDebounceDragMove.bind(this);
    this.onDragEnd = this.createDragEnd.bind(this);
    (c => {
      c.addEventListener('mousemove', this.onThrottleDragMove);
      c.addEventListener('mousemove', this.onDebounceDragMove);
      c.addEventListener('mouseup', this.onDragEnd);
    })(this.$refs.cover);
  },
  beforeDestroy() {
    (c => {
      c.removeEventListener('mousemove', this.onThrottleDragMove);
      c.removeEventListener('mousemove', this.onDebounceDragMove);
      c.removeEventListener('mouseup', this.onDragEnd);
    })(this.$refs.cover);
  }
}
</script>

<style>
.code__box pre code{
  font-family: 'Source Code Pro', monospace;
  font-size: 13px;
}
</style>

<style scoped>
.box {
  background: #fff;
  display: flex;
  overflow: hidden;
}

.view {
  display: flex;
  max-width: 50vw;
  min-width: 50vw;
  flex: 1 1 50vw;
  align-items: center;
  justify-content: center;
  padding: .5em;
  box-sizing: border-box;
}

.editor {
  flex: auto;
  display: flex;
  flex-direction: column;
  background: #282c34;
  color: #f8f8f8;
  font-size: .9em;
  box-sizing: border-box;
}

.tab-bar {
  flex: 0 0 25px;
  display: flex;
  background: #21252b;
}

.tab {
  padding: .3em .5em;
  user-select: none;
  box-sizing: border-box;
  cursor: pointer;
  color: rgba(255,255,255,.6);
}

.tab.active {
  background: #282c34;
  color: #fff;
}

.tab:not(.active) {
  border-bottom: #181a1f;
}

.br {
  cursor: pointer;
  max-width: 3px;
  min-width: 3px;
  flex: 0 0 3px;
  background: #181a1f;
  cursor: col-resize;
}

.content-block {
  flex: 1 1 100%;
  overflow: auto;
}

.content {
  padding: calc(.5em * 0.9) calc(.7em * 0.9);
  overflow: auto;
  position: relative;
  color: #9da5b4;
}

.code-wrapper {
  margin: 0;
  overflow: auto;
  overflow: hidden;
  /*height: 40vh;*/
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

.cover {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999999;
  cursor: col-resize;
}
</style>
