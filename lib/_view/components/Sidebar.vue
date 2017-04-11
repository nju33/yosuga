<template>
  <div class="container">
    <aside class="sidebar">
      <ul>
        <li v-for="item in items" v-text="item.name"></li>
      </ul>
    </aside>
  </div>
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    onclick() {
      console.log('click');
    }
  }
}
</script>

<style>
</style>
