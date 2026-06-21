import gtsConfig from 'gts/build/eslint.config.js';

export default [
  ...gtsConfig,
  {
    ignores: ['test/', 'docs/', 'dist/', 'src/*.po.ts', 'po2json.js'],
  },
  {
    files: ['eslint.config.js'],
    languageOptions: {sourceType: 'module'},
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {project: `${import.meta.dirname}/tsconfig.json`},
    },
    rules: {'@typescript-eslint/no-explicit-any': 'warn'},
  },
];
