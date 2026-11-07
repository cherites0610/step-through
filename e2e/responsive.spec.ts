import { expect, test } from '@playwright/test';

const widths = [320, 390, 768, 1280];
const pages = [
  '/zh-TW/',
  '/en/',
  '/zh-TW/insertion-sort/',
  '/en/insertion-sort/',
  '/zh-TW/merge-sort/',
  '/en/quick-sort/',
];

for (const width of widths) {
  for (const url of pages) {
    test(`${url} 在 ${width}px：頂列單行、頁面無水平溢出`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(url);

      const header = page.locator('header').first();
      expect((await header.boundingBox())!.height).toBe(56);

      // 頂列內每個項目都是單行（沒有被擠到折行）
      const wrapped = await header.locator('a, button, span').evaluateAll((els) =>
        els
          .filter((e) => e.getClientRects().length > 0 && !e.querySelector('a, button, span'))
          .filter((e) => {
            const lh = parseFloat(getComputedStyle(e).lineHeight) || 20;
            return e.getBoundingClientRect().height > lh * 1.5 + 16; // 含內距的按鈕高度寬容
          })
          .map((e) => e.textContent?.trim()),
      );
      expect(wrapped).toEqual([]);

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
}
