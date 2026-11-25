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
      // 根路徑 / 只是跳轉到 /zh-TW/ 的頁面（noindex），不放進 sitemap；404 也不放
      filter: (page) => {
        const path = new URL(page).pathname;
        return path !== '/' && !path.startsWith('/404');
      },
    }),
  ],
  i18n: {
    defaultLocale: 'zh-TW',
    locales: ['zh-TW'],
    routing: { prefixDefaultLocale: true },
  },
  // 內容裡的程式碼區塊是偽代碼，不上色（避免深色主題的淺色字落在淺色紙面上），由 .prose-plate pre 統一排版
  markdown: { syntaxHighlight: false },
  vite: { plugins: [tailwindcss()] },
});
