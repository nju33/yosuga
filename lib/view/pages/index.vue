<template>
  <div class="container" :style="{
    color: opts.subColor,
    background: opts.baseColor
  }">
    <Sidebar :opts="opts" :sections="sections" :activeSection="activeSection" class="sidebar"/>
    <main class="main" ref="main">
      <section class="section" v-for="section in sections" :key="section.name" v-if="section.html" :id="section.name">
        <nuxt-link class="section-title-link" :to="'/sections/' + section.name">
          <h2 class="section-title" v-text="section.title"></h2>
        </nuxt-link>
        <div class="section-desc" v-if="section.description">
          <div class="section-desc-contents" v-html="section.description"/>
        </div>
        <iframe class="section-view" :src="origin + 'sections/' + section.name"
          :style="{
            backgroundImage: 'linear-gradient(to right, #fff 50%, #282c34 50%)'
          }"
          @mouseover="lockScroll"
          @mouseleave="unlockScroll"
        />
      </section>
    </main>
  </div>
</template>

<script>
import path from 'path';
import Hanko from 'hanko';
import throttle from 'lodash.throttle';
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
      sections: data,
      locationOrigin: null
    }
  },
  computed: {
    origin() {
      return path.join(this.opts.origin, this.$router.options.base, '/');
    }
  },
  methods: {
    lockScroll: throttle(() => {
      if (document.body.style !== 'overflow') {
        document.body.style.overflow = 'hidden';
      }
    }, 100),
    unlockScroll: throttle(() => {
      document.body.style.overflow = '';
    }, 100)
  },
  beforeMount() {
    this.locationOrigin = location.origin;
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
  box-sizing: border-box;
  padding: 1em 0;
}

.main {
  max-width: calc(100% - 13em);
  min-width: calc(100% - 13em);
  min-height: 100vh;
  flex: 1 1 calc(100% - 13em);
  padding: 0 1em;
  box-sizing: border-box;
}

.section {
  height: 100vh;
  box-sizing: border-box;
  padding: 1em 0;
  display: flex;
  flex-direction: column;
}

.section-title-link,
.section-desck,
.section-view {
  flex: auto;
}

.section-view {
  flex-grow: 100;
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

.section-view {
  width: 100%;
  border: none;
}
</style>
