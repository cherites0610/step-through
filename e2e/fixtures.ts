import { test as base, expect } from '@playwright/test';

/**
 * 每次 page.goto 之後，等所有 Astro island 完成 hydration 才繼續。
 * 否則在高負載下，測試會在 Svelte 元件還沒掛上事件處理前就操作時間軸或按鈕，
 * 輸入事件被丟掉，造成間歇性失敗。
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    const goto = page.goto.bind(page);
    page.goto = async (url, options) => {
      const response = await goto(url, options);
      await page.waitForFunction(() => !document.querySelector('astro-island[ssr]'));
      return response;
    };
    await use(page);
  },
});

export { expect };

/** 單元頁的網址（與 src/data/subjects.ts 一致；e2e 也會檢查舊網址的轉址設定） */
const chapterOf: Record<string, string> = {
  'insertion-sort': 'sorting',
  'bubble-sort': 'sorting',
  'selection-sort': 'sorting',
  'merge-sort': 'sorting',
  'quick-sort': 'sorting',
  'avl-insert': 'balanced-trees',
};
export const unitUrl = (topic: string) => `/zh-TW/data-structures/${chapterOf[topic]}/${topic}/`;

