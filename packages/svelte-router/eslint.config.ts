import svelte from 'eslint-plugin-svelte'
import ts from 'typescript-eslint'
import rootConfig from '../../eslint.config.js'

export default [
  ...rootConfig,
  ...svelte.configs['flat/recommended'],
  ...svelte.configs['flat/prettier'],
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parserOptions: {
        parser: ts.parser,
      },
    },
  },
  {
    rules: {
      'unused-imports/no-unused-vars': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
    },
  },
]
