<template>
  <Ground :opts="opts" :html="section.html" :items="section.items" :altItems="section.altItems" :css="section.css" :size="size" :isEmbed="isEmbed"/>
</template>

<script>
import ResizeObserver from 'resize-observer-polyfill';
import Ground from '~/components/Ground';
import queryString from 'query-string';
import data from '~/lib/data';
// import opts from '~/lib/opts';

let query = {}
if (typeof window !== 'undefined') {
	query = queryString.parse(location.search);
}

export default {
  components: {Ground},
  validate({params}) {
    this.section = data.sections.find(i => i.name === params.name);
    return typeof this.section !== 'undefined';
  },
  data() {
    return {
			query,
      section: data.sections.find(i => i.name === this.$route.params.name),
      opts: typeof opts === 'undefined' ? {} : opts,
			styleTag: null,
			size: 'pc',
    };
  },
	computed: {
		isEmbed() {
			return this.query.mode === 'embed';
		},
	},
	mounted() {
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
	},
}
</script>

<style scoped>
.code {
  height: 100vh;
}
</style>
