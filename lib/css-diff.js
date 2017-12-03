// export default = async (items: any) => {
//   items.
// }

// async isValid(targetData: {[target: string]: string}): Promise<boolean> {
//   const targets = (() => {
//     const $targets = Object.keys(targetData);
//     if (this.main === 'css') {
//       return ['css', ...$targets];
//     }
//     return $targets;
//   })();
//   if (targets.length < 2) {
//     return true;
//   }
//
//   const rawContents = await (async () => {
//     const $rawContents = Object.values(targetData);
//     if (this.main === 'css') {
//       const cssContents = this.standardize(this.items.css);
//       return [cssContents, ...$rawContents];
//     }
//     return $rawContents;
//   })();
//   const contents = await pMap(rawContents, async c => {
//     const min = await this.standardize(c);
//     return min;
//   });
//
//   if (uniq(contents).length !== 1) {
//     const first = chalk.gray(contents[0]);
//     const contents$ = contents.slice(1).map(c => {
//       const diffs = diffChars(first, c);
//       diffs.forEach(d => {
//         if (d.added) {
//           c = c.replace(d.value, chalk.yellow(d.value));
//         }
//       });
//       return chalk.gray(c);
//     });
//     const line = this.__getLine(windowSize.width);
//     throw new Error(`'${this.name}' section is missing.
//
// ${chalk.bold.blue(this.name)}
// ${line}
// ${this.__diffTable(targets, [first, ...contents$])}
// ${line}
//     `);
//   }
//   return false;
// }
