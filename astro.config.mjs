import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import expressiveCode from 'astro-expressive-code';

export default defineConfig({
  site: 'https://tim.sillysamoyed.com',
  output: 'static',
  // Expressive Code options live in ./ec.config.mjs (required for the <Code>
  // component, which can't take non-serializable options like themeCssSelector).
  integrations: [expressiveCode()],
  vite: {
    plugins: [tailwindcss()],
  },
});
