<template>
  <div class="container" :style="{
    color: opts.subColor,
    background: opts.baseColor
  }">
		<div class="sidebar">
	    <Sidebar ref="sidebar" :opts="opts" :sections="sections" :activeSection="activeSection" :visibleSections="visibleSections" class="sidebar"/>
		</div>
    <main class="main" ref="main" data-apoc-sidebar-sibling>
      <section class="section" v-for="section in sections" :key="section.name" v-if="section.html" :id="section.name" :style="{height: section.style.height}" data-emergence="hidden">
				<header class="section-header">
	        <nuxt-link class="section-title-link" :to="'/sections/' + section.name">
	          <h2 class="section-title" v-text="section.title"></h2>
	        </nuxt-link>
	        <div class="section-desc" v-if="section.description">
	          <div class="section-desc-contents" v-html="section.description"/>
	        </div>
				</header>
        <Ground class="section-view" :opts="opts" :html="section.html" :items="section.items" :altItems="section.altItems" :css="section.css" :size="size"/>
				<!--
					nuxt freeze xox
					<iframe class="section-editor" :src="'/sections/' + section.name" />
				-->
      </section>
    </main>
		<footer class="menu" @click="toggleSidebar">
			<svg version="1.1" width="12" height="16" viewBox="0 0 12 16" class="octicon octicon-three-bars" aria-hidden="true"><path fill-rule="evenodd" d="M11.41 9H.59C0 9 0 8.59 0 8c0-.59 0-1 .59-1H11.4c.59 0 .59.41.59 1 0 .59 0 1-.59 1h.01zm0-4H.59C0 5 0 4.59 0 4c0-.59 0-1 .59-1H11.4c.59 0 .59.41.59 1 0 .59 0 1-.59 1h.01zM.59 11H11.4c.59 0 .59.41.59 1 0 .59 0 1-.59 1H.59C0 13 0 12.59 0 12c0-.59 0-1 .59-1z"/></svg>
		</footer>
  </div>
</template>

<script>
import 'core-js/fn/array/includes';
import ResizeObserver from 'resize-observer-polyfill';
import path from 'path';
import uniq from 'lodash.uniq';
import emergence from 'emergence.js';
import MoveTo from 'moveto';
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
      locationOrigin: null,
			size: 'pc',
    }
  },
  computed: {
    origin() {
      return path.join(this.opts.origin, this.$router.options.base, '/');
    }
  },
	methods: {
		toggleSidebar() {
			this.$refs.sidebar.toggle();
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

		const ro = new ResizeObserver((entries, observer) => {
			for (const entry of entries) {
				const width = entry.target.clientWidth;

				if (width === undefined) {
					return;
				}

				if (this.size === 'pc' && Math.floor(width) <= 768) {
					this.size = 'tablet';
				} else if (this.size === 'tablet' && Math.floor(width) > 768) {
					this.size = 'pc';
				}
			}
		});
		ro.observe(document.body);
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
  max-width: 100vw;
  min-width: 100vw;
  display: flex;
	overflow: hidden;
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

@media (max-width: 768px) {
	.sidebar {
		flex: none;
	}

	.main {
		max-width: 100vw;
		min-width: 100vw;
		margin-bottom: 40px;
	}
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

@media (max-width: 768px) {
	.section-editor {
		max-width: 100vw;
		min-width: 100vw
	}
}


.menu {
	display: none;
}
@media (max-width: 768px) {
	.menu {
		display: block;
	  position: fixed;
	  left: 0;
	  bottom: 0;
		width: 100%;
		height: 40px;
		box-sizing: border-box;
		border-top: 1px solid #292c34;
		z-index: 99999;
		/*background: #292c34;*/
		background: #fff;
		text-align: center;
		padding: .5em 0;
		cursor: pointer;
	}

	.octicon-three-bars {
		width: 2em;
		height: 2em;
		/*fill: #fff;*/
		/*fill: ;*/
		position: absolute;
		right: 50%;
		bottom: 50%;
		transform: translate(50%,50%);
	}
}
</style>
