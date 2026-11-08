import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://step-through.cherites.org',
  integrations: [
    svelte(),
    mdx(),
    sitemap({
      // 每個 <url> 帶上各語系版本的 hreflang alternate
      i18n: { defaultLocale: 'zh-TW', locales: { 'zh-TW': 'zh-TW', en: 'en' } },
      // 根路徑 / 只是依語言跳轉的頁面（noindex），不放進 sitemap；404 也不放
      filter: (page) => {
        const path = new URL(page).pathname;
        return path !== '/' && !path.startsWith('/404');
      },
    }),
  ],
  i18n: {
    defaultLocale: 'zh-TW',
    locales: ['zh-TW', 'en'],
    routing: { prefixDefaultLocale: true },
  },
  vite: { plugins: [tailwindcss()] },
});
