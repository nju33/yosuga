<template>
  <div class="container" :style="{
    color: opts.subColor,
    background: opts.baseColor
  }">
    <Sidebar :opts="opts" :items="items" :activeSection="activeSection" class="sidebar"/>
    <main class="main" ref="main">
      <section class="section" v-for="item in items" v-if="item.html" :id="item.name">
        <header>
          <h2 class="section-title" v-text="item.title"></h2>
          <Code :html="item.html" :items="item.items"/>
        </header>
      </section>
    </main>
  </div>
</template>

<script>
import Hanko from 'hanko';
import Sidebar from '~/components/Sidebar';
import Code from '~/components/Code';
import data from '~/lib/data';
import opts from '~/lib/opts';

export default {
  components: {
    Sidebar,
    Code
  },
  data() {
    return {
      hanko: null,
      activeSection: null,
      opts,
      items: data
    }
  },
  mounted() {
    if (this.items.length > 0) {
      this.activeSection = this.items[0].name;
    }

    const children = this.$refs.main.children;
    if (children.length > 0) {
      this.hanko = new Hanko(children);
      this.hanko.init();

      for (const el of children) {
        el.addEventListener('hankoenter', ev => {
          this.activeSection = ev.target.id;
        });
      }
    }
  }
}
</script>

<style scoped>
h1,
h2,
h3,
h4,
h5,
h6 {
  margin: 0
}

.container {
  min-height: 100vh;
  width: 100vw;
  display: flex;
}

.sidebar {
  max-width: 13em;
  min-height: 100vh;
  flex: 1 0 13em;
  /*border-right: 1px solid #ccc;*/
  box-sizing: border-box;
  padding: 1em 0;
}

.main {
  max-width: calc(100% - 13em);
  min-width: calc(100% - 13em);
  min-height: 100vh;
  flex: 1 1 calc(100% - 13em);
  padding: 1em;
  box-sizing: border-box;
}

.section {
  margin-top: .5em;
  margin-bottom: 2.5em;
}

.section-title {
  margin: 0 0 .5em .3em;
}
</style>
