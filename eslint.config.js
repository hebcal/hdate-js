import {createRequire} from 'module';
import {fileURLToPath} from 'url';
import {dirname, join} from 'path';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const gtsConfig = require('gts/build/eslint.config.js');

export default [
  ...gtsConfig,
  {
    ignores: ['build/', 'test/', 'docs/', 'dist/', 'src/*.po.ts', 'po2json.js'],
  },
  {
    files: ['eslint.config.js'],
    languageOptions: {
      sourceType: 'module',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: join(__dirname, 'tsconfig.json'),
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];
