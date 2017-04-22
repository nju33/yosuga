<template>
  <div class="container" :style="{
    color: opts.subColor,
    background: opts.baseColor
  }">
    <Sidebar :opts="opts" :sections="sections" :activeSection="activeSection" class="sidebar"/>
    <main class="main" ref="main">
      <section class="section" v-for="section in sections" :key="section.name" data-hanko-offset="center" v-if="section.html" :id="section.name">
        <header>
          <nuxt-link class="section-title-link" :to="'/sections/' + section.name">
            <h2 class="section-title" v-text="section.title"></h2>
          </nuxt-link>
          <div class="section-desc" v-if="section.description">
            <div class="section-desc-contents" v-html="section.description"/>
          </div>
          <Ground :opts="opts" :html="section.html" :items="section.items" :altItems="section.altItems"/>
        </header>
      </section>
    </main>
  </div>
</template>

<script>
import Hanko from 'hanko';
import Sidebar from '~/components/Sidebar';
import Ground from '~/components/Ground';
import data from '~/lib/data';
import opts from '~/lib/opts';

export default {
  components: {
    Sidebar,
    Ground
  },
  name: 'index',
  data() {
    return {
      hanko: null,
      activeSection: null,
      opts,
      sections: data
    }
  },
  mounted() {
    if (this.sections.length > 0) {
      this.activeSection = this.sections[0].name;
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

.section-title-link {
  color: inherit;
  text-decoration: none;
}

.section-title {
  margin: 0 0 .5em .3em;
}

.section-desc {
  margin: .5em;
  box-sizing: border-box;
  padding-left: .5em;
  border-left: .3em solid;
}

.section-desc-contents {
  font-size: .9em;
  padding: .3em 0;
}
</style>
