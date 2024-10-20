const {dts} = require('rollup-plugin-dts');

module.exports = [
  {
    input: 'dist/src/index.d.ts',
    output: [{file: 'dist/index.d.ts', format: 'es'}],
    plugins: [dts()],
  },
];
