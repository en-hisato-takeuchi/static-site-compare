import js from '@eslint/js'
import globals from 'globals'

export default [
  {
    ignores: [
      '**/node_modules/',
      '**/dist/',
      '**/out/',
      '**/.next/',
      '**/.astro/',
    ],
  },
  js.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
]
