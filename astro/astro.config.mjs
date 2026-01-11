// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
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
  },

  integrations: [react(), sitemap()],

  adapter: node({
    mode: 'standalone'
  }),

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh-tw', 'zh-cn'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});