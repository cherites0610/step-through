import { expect, test } from '@playwright/test';

test('首頁（zh-TW）：路線圖只連結已上線主題，即將推出的不是連結', async ({ page }) => {
  await page.goto('/zh-TW/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('看課本看不懂的');

  const index = page.locator('#index');
  for (const name of ['插入排序', '氣泡排序', '選擇排序', '合併排序', '快速排序']) {
    await expect(index.getByRole('link', { name })).toBeVisible();
  }
  // 尚未上線的主題不應是連結，但螢幕閱讀器要讀得到狀態
  await expect(index.getByRole('link', { name: /AVL|紅黑樹|Dijkstra/ })).toHaveCount(0);
  await expect(index.getByText('AVL 樹插入')).toBeVisible();
  await expect(index.getByText('即將推出').first()).toBeAttached();
});

test('首頁：主要行動可用，首屏不載入互動 JS', async ({ page }) => {
  await page.goto('/zh-TW/');
  await expect(page.locator('astro-island')).toHaveCount(0);

  await page.getByRole('link', { name: '瀏覽主題目錄' }).click();
  await expect(page).toHaveURL(/#index$/);

  await page.getByRole('link', { name: /從插入排序開始/ }).click();
  await expect(page).toHaveURL(/\/zh-TW\/insertion-sort\/$/);
});

test('首頁：語言切換與 en 版內容', async ({ page }) => {
  await page.goto('/zh-TW/');
  await page.getByRole('navigation', { name: 'Language' }).first().getByRole('link', { name: 'EN' }).click();
  await expect(page).toHaveURL(/\/en\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Step through it yourself');
  await expect(page.locator('#index').getByRole('link', { name: 'Insertion Sort' })).toBeVisible();
});

test('首頁有 WebSite 結構化資料', async ({ page }) => {
  await page.goto('/en/');
  const types = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((els) => els.map((e) => JSON.parse(e.textContent ?? '{}')['@type']));
  expect(types).toEqual(['WebSite']);
});

test('頂列標籤：章節名加章內序號，且序號與首頁目錄順序一致', async ({ page }) => {
  const expected: Record<string, string> = {
    'insertion-sort': '排序 · 01',
    'bubble-sort': '排序 · 02',
    'selection-sort': '排序 · 03',
    'merge-sort': '排序 · 04',
    'quick-sort': '排序 · 05',
  };
  await page.setViewportSize({ width: 1280, height: 800 });

  // 首頁目錄的實際順序
  await page.goto('/zh-TW/');
  const hrefs = await page.locator('#index a[href*="-sort/"]').evaluateAll((els) =>
    els.map((e) => (e as HTMLAnchorElement).getAttribute('href')!.split('/').filter(Boolean).pop()!),
  );
  expect(hrefs).toEqual(['insertion-sort', 'bubble-sort', 'selection-sort', 'merge-sort', 'quick-sort']);
  await expect(page.getByText('Plate 00')).toHaveCount(0);

  for (const [i, slug] of hrefs.entries()) {
    await page.goto(`/zh-TW/${slug}/`);
    await expect(page.locator('header')).toContainText(expected[slug]);
    // 序號 = 目錄中的位置
    expect(expected[slug]).toBe(`排序 · ${String(i + 1).padStart(2, '0')}`);
  }

  await page.goto('/en/bubble-sort/');
  await expect(page.locator('header')).toContainText('Sorting · 02');
});
