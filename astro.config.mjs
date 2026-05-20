import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://tim.sillysamoyed.com',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
