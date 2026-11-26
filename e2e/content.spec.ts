/**
 * 章節撰寫守則（docs/content-guide.md）的頁面檢查：每一個寫好觀念說明的章節都自動檢查，
 * 新增章節不需要改這個檔案。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import AxeBuilder from '@axe-core/playwright';
import { devices } from '@playwright/test';
import { expect, test } from './fixtures';

const chaptersDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/content/chapters');
const chapters = fs
  .readdirSync(chaptersDir, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .flatMap((s) =>
    fs
      .readdirSync(path.join(chaptersDir, s.name))
      .filter((f) => f.endsWith('.mdx'))
      .map((f) => `/zh-TW/${s.name}/${f.replace(/\.mdx$/, '')}/`),
  );

const openAll = (page: import('@playwright/test').Page) =>
  page.locator('details').evaluateAll((ds) => ds.forEach((d) => ((d as HTMLDetailsElement).open = true)));

const noOverflow = async (page: import('@playwright/test').Page) =>
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);

test('至少有一章寫好觀念說明', () => {
  expect(chapters.length).toBeGreaterThan(0);
});

for (const url of chapters) {
  test.describe(url, () => {
    test('觀念說明、公式與圖都正常輸出；沒有無障礙違規（詳解展開）', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(url);
      const concepts = page.locator('section[aria-labelledby="concepts"]');
      await expect(concepts).not.toContainText('準備中');
      // 公式都經過 KaTeX，沒有漏掉的原始碼
      await expect(page.locator('main')).not.toContainText('<M ');
      expect(await page.locator('.katex').count()).toBeGreaterThan(0);
      // 每張圖都有說明重點的替代文字
      for (const svg of await page.locator('figure.fig svg').all()) {
        await expect(svg).toHaveAttribute('role', 'img');
        expect(((await svg.getAttribute('aria-label')) ?? '').length).toBeGreaterThan(10);
      }
      await openAll(page);
      await noOverflow(page);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      const summary = results.violations.map((v) => ({ rule: v.id, nodes: v.nodes.slice(0, 3).map((n) => n.target.join(' ')) }));
      expect(summary, JSON.stringify(summary, null, 2)).toEqual([]);
    });

    test('手機：頁面不橫向溢出，圖不超過內容寬', async ({ browser }) => {
      const ctx = await browser.newContext({ ...devices['iPhone 13'] });
      const page = await ctx.newPage();
      await page.goto(url);
      await page.waitForFunction(() => document.documentElement.dataset.scrollGuard !== 'on');
      await openAll(page);
      await noOverflow(page);
      await ctx.close();
    });
  });
}

test('桌機：每張圖都完整放在內容欄裡（不需要橫向捲動）', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  for (const url of chapters) {
    await page.goto(url);
    for (const box of await page.locator('figure.fig > div').all()) {
      const over = await box.evaluate((el) => el.scrollWidth - el.clientWidth);
      expect(over, `${url} 有圖比內容欄寬`).toBeLessThanOrEqual(0);
    }
  }
});
