<template>
  <div class="container">
    <aside class="sidebar__box">
      <h1 class="title"><a class="title-link" :href="$router.options.base" v-text="opts.title"></a></h1>
      <ul class="sidebar__list">
        <li class="sidebar__item"
            :class="activeSection === section.name ? 'sidebar__item--active' : ''"
            v-for="section in sections" v-if="section.html">
          <a class="sidebar__link" :href="'#' + section.name" v-text="section.title" @click="activate($event, section.name)"/>
        </li>
      </ul>
    </aside>
  </div>
</template>

<script>
import MoveTo from 'moveto';

const moveTo = new MoveTo({duration: 400});

export default {
  props: {
    opts: {
      type: Object
    },
    sections: {
      type: Array,
      default: () => []
    },
    activeSection: {
      type: String
    }
  },
  name: 'Sidebar',
  data() {
    return {
      _activeSection: this.activeSection
    };
  },
  methods: {
    activate(ev, name) {
      ev.preventDefault();

      this._activeSection = name;
      const target = document.getElementById(name);
      if (target) {
        moveTo.move(target);
        location.hash = name;
      }
    }
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
  width: 13em;
  position: fixed;
  border-left: .2em solid;
}

.title {
  margin-left: .8rem;
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
  font-size: .8rem;
  padding: .1rem 0 .1rem .8rem;
  transform-origin: left center;
  position: relative;
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

.sidebar__item--active {
  color: #cb1b45;
  font-size: 1em;
  padding: 0 0 0 .8rem;
}

.sidebar__item--active:before {
  border-color: #cb1b45;
  height: 1.5em;
}
</style>
