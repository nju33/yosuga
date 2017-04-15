<template>
  <div class="container">
    <aside class="sidebar__box">
      <ul class="sidebar__list">
        <li class="sidebar__item"
            :class="activeSection === item.name ? 'sidebar__item--active' : ''"
            v-for="item in items" v-if="item.html">
          <a class="sidebar__link" :href="'#' + item.name" v-text="item.title" @click="activate($event, item.name)"/>
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
    items: {
      type: Array,
      default: () => []
    },
    activeSection: {
      type: String
    }
  },
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

.sidebar__list {
  line-height: 1.5;
  margin-left: -.2em;
}

.sidebar__link {
  color: inherit;
  text-decoration: none;
}

.sidebar__item {
  padding-left: .8em;
  /*border-left: .3em solid;*/
  /*padding-left: 1em 0;*/
  transition: .2s cubic-bezier(0.455, 0.03, 0.515, 0.955);
  position: relative;
}

.sidebar__item:before {
  content: '';
  border-left: .2em solid;
  position: absolute;
  left: 0;
  bottom: 50%;
  transform: translateY(50%);
  height: 0em;
  transition: .2s cubic-bezier(0.455, 0.03, 0.515, 0.955) .2s;
}

.sidebar__item--active {
  color: #cb1b45;
}

.sidebar__item--active:before {
  border-color: #cb1b45;
  height: 1.5em;
}
</style>
