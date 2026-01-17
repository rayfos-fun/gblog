// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import singleFile from 'astro-single-file';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';

const isItchBuild = process.env.ITCH_BUILD === 'true';

// https://astro.build/config
export default defineConfig({
  outDir: isItchBuild ? './dist_itch' : './dist',
  integrations: [
    isItchBuild ? singleFile() : null
  ],

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

  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },

  integrations: [tailwind(), react(), sitemap()],

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

  vite: {
    build: {
      assetsInlineLimit: isItchBuild ? 100000000 : 4096,
    }
  },
});