<template>
  <div class="box code__box">
    <div class="view" v-html="html"></div>
    <div class="editor">
      <div class="tab-bar">
        <div class="tab" :class="activeTarget === target ? 'active' : ''" v-for="(code, target) in items" v-text="target" @click="activate(target)"/>
      </div>
      <div class="content-block">
        <pre class="content"
          v-for="(code, target) in items"
          v-if="activeTarget === target"
        ><code v-html="highlight(target, code)"></code></pre>
      </div>
    </div>
  </div>
</template>

<script>
import hljs from 'highlight.js/lib/highlight';
import css from 'highlight.js/lib/languages/css';
import scss from 'highlight.js/lib/languages/scss';
import less from 'highlight.js/lib/languages/less';
import stylus from 'highlight.js/lib/languages/stylus';
import theme from 'highlight.js/styles/atom-one-dark.css';

export default {
  props: {
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
  overflow: auto;

}
</style>
