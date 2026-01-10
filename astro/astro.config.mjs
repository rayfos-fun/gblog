// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://rayfos.fun',
  base: '/',

  build: {
    // $URL/index.html
    format: 'directory',
  },

  server: {
    port: 4321,
    host: true,
  },

  vite: {
    plugins: [tailwindcss()]
  }
});