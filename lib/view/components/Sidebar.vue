<template>
  <div class="sidebar__box" ref="box" style="width:13em">
    <h1 class="title"><a class="title-link" :href="$router.options.base" v-text="opts.title || 'Yosuga'"></a></h1>
    <ul class="sidebar__list">
      <li
        v-for="section in sections"
				class="sidebar__item"
        :class="(visibleSections || []).includes(section.name) ? 'sidebar__item--active' : ''"
				:style="(visibleSections || []).includes(section.name) ? {background: opts.style.accentColor} : ''"
			>
        <a class="sidebar__link" :href="'#' + section.name" v-text="section.title" @click="activate($event, section.name)"/>
      </li>
    </ul>
	</div>
</template>

<script>
import ResizeObserver from 'resize-observer-polyfill';
import MoveTo from 'moveto';
import ApocSidebar from 'apoc-sidebar';
import opts from '~/lib/opts'

const moveTo = new MoveTo({duration: 400});

export default {
  props: {
    sections: {
      type: Array,
      default: () => []
    },
    activeSection: {
      type: String
    },
    visibleSections: {
      type: Array,
      default: () => []
    }
  },
  name: 'Sidebar',
  data() {
    return {
			opts,
      active: this.activeSection,
			sidebar: null,
    };
  },
  methods: {
    activate(ev, name) {
      ev.preventDefault();

      this.active = name;
      const target = document.getElementById(name);
      if (target) {
        moveTo.move(target);
        location.hash = name;
      }
    },
		toggle() {
			if (this.sidebar === null) {
				return;
			}

			if (this.sidebar.isOpen()) {
				this.sidebar.close();
			} else {
				this.sidebar.open();
			}
		},
		close() {
			if (this.sidebar === null) {
				return;
			}

			this.sidebar.close();
		},
  },
	mounted() {
		console.log(this)
		this.sidebar = new ApocSidebar(this.$refs.box, {
			container: this.$parent.$el,
			type: 'lid',
		})

		const ro = new ResizeObserver((entries, observer) => {
	    for (const entry of entries) {
        const {width} = entry.contentRect;
				if (Math.floor(width) <= 768) {
					this.sidebar.init(false);
				} else {
					this.sidebar.teardown();
				}
	    }
		});

		ro.observe(document.body);
	}
}
</script>

<style scoped>
ul {
  padding: 0;
  margin: 0;
  list-style: none;
  padding: 0;
}

.container {
}

.sidebar__box {
	position: fixed;
	left: 0;
	top: 0;
	width: 13em;
	background: #292c34;
	height: 100vh;
	color: #ccc;
}

.title {
	margin: 0;
  /*margin-left: .8rem;*/
	padding: .5em;
	text-align: center;
}

.title-link {
  text-decoration: none;
  color: inherit;
}

.sidebar__list {
  line-height: 1.5;
  margin-left: -.2em;
}

.sidebar__link {
  color: inherit;
  text-decoration: none;
}

.sidebar__item {
  padding-left: .8rem;
  transition:
    color .2s cubic-bezier(0.455, 0.03, 0.515, 0.955);
  /*font-size: .8rem;*/
  padding: .35em 1em;
  transform-origin: left center;
  position: relative;
	transition: .135s;
}

.sidebar__item:before {
  content: '';
  border-left: .2rem solid;
  position: absolute;
  left: 0;
  bottom: 50%;
  transform: translateY(50%);
  height: 0em;
  transition: .2s cubic-bezier(0.455, 0.03, 0.515, 0.955);
}

.sidebar__item--active,
.sidebar__item[data-emergence=visible] {
  /*color: #cb1b45;*/
	/*background: #cb1b45;*/
  /*font-size: 1em;*/
}

.sidebar__item--active:before {
  border-color: #cb1b45;
  height: 1.5em;
}
</style>
