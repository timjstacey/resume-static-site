import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import playwright from 'eslint-plugin-playwright';

export default defineConfig(
  { ignores: ['dist/', '.astro/', 'node_modules/'] },

  ...tseslint.configs.recommended,
  ...astro.configs['flat/recommended'],

  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },

  {
    ...playwright.configs['flat/recommended'],
    files: ['tests/**/*.ts'],
  },
);
