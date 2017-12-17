/* @flow */
import get from 'lodash.get';
import marked from 'marked';

export default class Section {
  main: string;

  name: string;

  data: {
    title: string,
    summary?: string,
    description?: string,
    style: {
      height?: string,
    },
  };

  postcssPlugins: any[];

  html: string;

  css: string;

  items: [string, string][];

  constructor(
    name: string,
    data: {
      content: string,
      data: {
        [key: string]: any,
      },
    },
  ) {
    this.name = name;
    this.data = data.data;
    this.html = data.content;
    this.css = '';
    this.items = [];
  }

  get title(): string {
    return this.data.title;
  }

  get summary(): string {
    return get(this.data, 'summary', undefined);
  }

  get description(): string {
    return get(this.data, 'description', undefined);
  }

  get style(): any {
    return {
      height: get(this.data, 'style.height', '70vh'),
    };
  }

  export(): any {
    return {
      name: this.name,
      title: this.title,
      summary: this.summary,
      description: this.description ? marked(this.description) : undefined,
      style: this.style,
      html: this.html,
      css: this.css,
      items: this.items,
    };
  }
}
