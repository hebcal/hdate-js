const {nodeResolve} = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const babel = require('@rollup/plugin-babel');
const typescript = require('@rollup/plugin-typescript');
const pkg = require('./package.json');
const {defineConfig} = require('rollup');

const banner = '/*! ' + pkg.name + ' v' + pkg.version + ' */';

const TARGET_NODE_VER = '18.0.0';

module.exports = defineConfig([
  {
    input: 'src/index.ts',
    output: [
      {
        dir: 'dist/esm',
        format: 'es',
        name: pkg.name,
        banner,
        preserveModules: true,
        preserveModulesRoot: 'src',
        sourcemap: true,
      },
    ],
    plugins: [
      typescript({
        outDir: 'dist/esm',
        rootDir: './src',
      }),
      babel({
        babelHelpers: 'runtime',
        plugins: ['@babel/plugin-transform-runtime'],
        presets: [
          [
            '@babel/preset-env',
            {
              modules: false,
              targets: {
                node: TARGET_NODE_VER,
              },
            },
          ],
        ],
        exclude: ['node_modules/**'],
      }),
      nodeResolve(),
      commonjs(),
    ],
    external: [/node_modules/],
  },
]);
