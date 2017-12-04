<template>
  <Ground :opts="opts" :html="section.html" :items="section.items" :altItems="section.altItems"/>
</template>

<script>
import Ground from '~/components/Ground';
import data from '~/lib/data';
// import opts from '~/lib/opts';

export default {
  components: {Ground},
  validate({params}) {
    this.section = data.find(i => i.name === params.name);
    return typeof this.section !== 'undefined';
  },
  data() {
    return {
      section: data.find(i => i.name === this.$route.params.name),
      opts: typeof opts === 'undefined' ? {} : opts,
			styleTag: null,
    };
  },
	mounted() {
		this.styleTag = document.createElement('style')
		this.styleTag.innerHTML = this.section.css;
		document.head.appendChild(this.styleTag);
	},
	destroyed() {
		document.head.removeChild(this.styleTag);
	}
}
</script>

<style scoped>
.code {
  height: 100vh;
}
</style>
