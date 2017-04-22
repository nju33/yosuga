<template>
  <Code class="code" :opts="opts" :html="section.html" :items="section.items"/>
</template>

<script>
import data from '~/lib/data';
import Code from '~/components/Code';

export default {
  components: {Code},
  validate({params}) {
    this.section = data.find(i => i.name === params.name);
    return typeof this.section !== 'undefined';
  },
  data() {
    return {
      section: data.find(i => i.name === this.$route.params.name)
    };
  },
  mounted() {
    console.log(this);
  }
}
</script>

<style scoped>
.code {
  height: 100vh;
}
</style>
