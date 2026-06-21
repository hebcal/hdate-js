const typescript = require('@rollup/plugin-typescript');
const pkg = require('./package.json');

const banner = '/*! ' + pkg.name +
  ' v' + pkg.version +
  ', distributed under GPLv2 https://www.gnu.org/licenses/gpl-2.0.txt */';

module.exports = {
  input: 'src/index.ts',
  output: {
    dir: 'dist/esm',
    format: 'es',
    banner,
    preserveModules: true,
    preserveModulesRoot: 'src',
    sourcemap: true,
  },
  plugins: [
    typescript({
      outDir: 'dist/esm',
      rootDir: './src',
    }),
  ],
};
