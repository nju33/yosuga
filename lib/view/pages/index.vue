<template>
  <div class="container" :style="{
    color: opts.subColor,
    background: opts.baseColor
  }">
		<div class="sidebar">
	    <Sidebar :opts="opts" :sections="sections" :activeSection="activeSection" :visibleSections="visibleSections" class="sidebar"/>
		</div>
    <main class="main" ref="main">
      <section class="section" v-for="section in sections" :key="section.name" v-if="section.html" :id="section.name" :style="{height: section.style.height}" data-emergence="hidden">
				<header class="section-header">
	        <nuxt-link class="section-title-link" :to="'/sections/' + section.name">
	          <h2 class="section-title" v-text="section.title"></h2>
	        </nuxt-link>
	        <div class="section-desc" v-if="section.description">
	          <div class="section-desc-contents" v-html="section.description"/>
	        </div>
				</header>
        <!-- <Ground class="section-view" :opts="opts" :html="section.html" :items="section.items" :altItems="section.altItems"/> -->
				<iframe class="section-editor" :src="'/sections/' + section.name" />
      </section>
    </main>
  </div>
</template>

<script>
import 'core-js/fn/array/includes';
import path from 'path';
import uniq from 'lodash.uniq';
import emergence from 'emergence.js';
import MoveTo from 'moveto';
// import Hanko from 'hanko';
import throttle from 'lodash.throttle';
import Sidebar from '~/components/Sidebar';
import Ground from '~/components/Ground';
import data from '~/lib/data';
// import opts from '~/lib/opts';

const moveTo = new MoveTo({duration: 400});

export default {
  components: {
    Sidebar,
    Ground
  },
  name: 'index',
  data() {
    return {
      hanko: null,
			visibleSections: [],
      activeSection: null,
      opts: typeof opts === 'undefined' ? {} : opts,
      sections: data,
      locationOrigin: null
    }
  },
  computed: {
    origin() {
      return path.join(this.opts.origin, this.$router.options.base, '/');
    }
  },
  beforeMount() {
    this.locationOrigin = location.origin;
  },
  mounted() {
    if (this.sections.length > 0) {
			if (location.hash === '') {
	      this.visibleSections = [this.sections[0].name];
			} else {
				const target = document.getElementById(location.hash.slice(1));
				if (target) {
					setTimeout(() => {
					moveTo.move(target);
				}, 1000);
				}
			}
			// console.log(99)
			emergence.init({
				// container: this.$refs.main,
				callback: (element, state) => {
					if (state === 'visible') {
						this.visibleSections.push(element.id);
					} else if (state === 'reset') {
						this.visibleSections = this.visibleSections.filter(s => s !== element.id);
					}
					this.visibleSections = uniq(this.visibleSections);
				},
			});
    }

    // const children = this.$refs.main.children;
    // if (children.length > 0) {
    //   this.hanko = new Hanko(children);
    //   this.hanko.init();
		//
    //   for (const el of children) {
    //     el.addEventListener('hankoenter', ev => {
    //       this.activeSection = ev.target.id;
    //     });
    //   }
    // }
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
  /*max-width: 13em;*/
  /*min-height: 100vh;*/
  flex: 1 0 13em;
  box-sizing: border-box;
  /*padding: 1em 0;*/
}

.main {
  max-width: calc(100% - 13em);
  min-width: calc(100% - 13em);
  min-height: 100vh;
  flex: 1 1 calc(100% - 13em);
  /*padding: 0 1em;*/
  box-sizing: border-box;
	background: #c8c8c8;
}

.section {
  height: 70vh;
  box-sizing: border-box;
  padding: 1em 0;
  display: flex;
  flex-direction: column;
}

.section:last-of-type {
	padding: 0;
}

.section-header {
	flex: 1 1 0;
}

/*.section-title-link,
.section-desc,
.section-view {
  flex: 1 2 auto;
}*/

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

.section-editor {
	border: none;
	flex: 10 1 auto;
}
</style>
