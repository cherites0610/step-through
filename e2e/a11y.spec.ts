import AxeBuilder from '@axe-core/playwright';
import { expect, test, unitUrl } from './fixtures';
import type { Page } from '@playwright/test';

const topics = ['insertion-sort', 'bubble-sort', 'selection-sort', 'merge-sort', 'quick-sort', 'avl-insert'];

/** WCAG 2.0／2.1 A 與 AA；任何違規都讓測試失敗，並列出是哪個規則、哪個元素 */
async function scan(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  const summary = results.violations.map((v) => ({
    rule: v.id,
    impact: v.impact,
    help: v.help,
    nodes: v.nodes.slice(0, 3).map((n) => n.target.join(' ')),
  }));
  expect(summary, JSON.stringify(summary, null, 2)).toEqual([]);
}

test('首頁沒有無障礙違規', async ({ page }) => {
  await page.goto('/zh-TW/');
  await scan(page);
});

for (const slug of topics) {
  test(`${slug} 沒有無障礙違規`, async ({ page }) => {
    await page.goto(unitUrl(slug));
    await scan(page);
  });
}

for (const id of ['data-structures', 'algorithms']) {
  test(`科目頁 ${id} 沒有無障礙違規`, async ({ page }) => {
    await page.goto(`/zh-TW/${id}/`);
    await scan(page);
  });
}

for (const url of ['/zh-TW/data-structures/basics/', '/zh-TW/data-structures/sorting/']) {
  test(`章節頁 ${url} 沒有無障礙違規（含公式、圖、展開的詳解）`, async ({ page }) => {
    await page.goto(url);
    await page.locator('details').evaluateAll((ds) => ds.forEach((d) => ((d as HTMLDetailsElement).open = true)));
    await scan(page);
  });
}

test('404 頁沒有無障礙違規', async ({ page }) => {
  await page.goto('/404.html');
  await scan(page);
});

test.describe('互動後的狀態', () => {
  const toStep = (page: Page, name: string, i: number) => page.getByRole('slider', { name }).fill(String(i));

  test('AVL：失衡與旋轉中的樹', async ({ page }) => {
    await page.goto('/zh-TW/data-structures/balanced-trees/avl-insert/');
    await page.getByRole('button', { name: 'LR 雙旋' }).click();
    for (const i of [11, 12, 13]) {
      await toStep(page, '步驟', i);
      await scan(page);
    }
  });

  test('AVL：空樹', async ({ page }) => {
    await page.goto('/zh-TW/data-structures/balanced-trees/avl-insert/');
    await scan(page);
  });

  test('合併排序：合併進行中', async ({ page }) => {
    await page.goto('/zh-TW/data-structures/sorting/merge-sort/');
    await toStep(page, '步驟', 20);
    await scan(page);
  });

  test('快速排序：分割進行中、切換基準後', async ({ page }) => {
    await page.goto('/zh-TW/data-structures/sorting/quick-sort/');
    await toStep(page, '步驟', 12);
    await scan(page);
    await page.locator('fieldset label', { hasText: '三數取中' }).click();
    await scan(page);
  });

  test('輸入錯誤時的提示', async ({ page }) => {
    await page.goto('/zh-TW/data-structures/sorting/bubble-sort/');
    await page.getByRole('textbox').fill('3 x');
    await page.getByRole('button', { name: '套用' }).click();
    await expect(page.getByRole('alert')).toBeVisible();
    await scan(page);
  });
});
