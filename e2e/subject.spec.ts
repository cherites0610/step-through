import { expect, test } from './fixtures';

test.describe('科目頁：資料結構學習地圖', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/zh-TW/data-structures/');
  });

  test('標題、摘要與結構化資料', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('資料結構');
    await expect(page).toHaveTitle(/資料結構學習地圖/);
    await expect(page.locator('main')).toContainText('11 章');
    const types = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((els) => els.map((e) => JSON.parse(e.textContent ?? '{}')['@type']));
    expect(types).toEqual(['Course', 'BreadcrumbList']);
  });

  test('地圖：11 個章節節點、每條先修一條邊；有內容的章節是實線框', async ({ page }) => {
    const map = page.getByRole('group', { name: '資料結構的章節先修關係圖' });
    const nodes = map.getByRole('link');
    await expect(nodes).toHaveCount(11);
    // 先修共 12 條（鏈結串列 → 圖、樹與二元樹 → 圖 等）
    await expect(map.locator('g[aria-hidden="true"] > g')).toHaveCount(12);
    await expect(map.locator('a.is-live')).toHaveCount(2);
    await expect(map.getByRole('link', { name: /^10 排序，已上線 5／8/ })).toBeVisible();
    await expect(map.getByRole('link', { name: /^08 平衡搜尋樹，已上線 1／6/ })).toBeVisible();
    await expect(map.getByRole('link', { name: /^09 圖，即將推出/ })).toBeVisible();
  });

  test('點地圖節點跳到章節清單的那一章', async ({ page }) => {
    await page.getByRole('link', { name: /^10 排序/ }).click();
    await expect(page).toHaveURL(/#ch-sorting$/);
    await expect(page.locator('#ch-sorting')).toBeInViewport();
  });

  test('章節清單：先修連結、已上線單元可以點進單元頁', async ({ page }) => {
    const ch = page.locator('#ch-graphs');
    await expect(ch).toContainText('建議先讀');
    await expect(ch.getByRole('link', { name: '04 鏈結串列' })).toHaveAttribute('href', '#ch-linked-lists');
    await expect(page.locator('#ch-basics')).toContainText('從這裡開始');

    await page.locator('#ch-sorting').getByRole('link', { name: /快速排序/ }).click();
    await expect(page).toHaveURL(/\/zh-TW\/quick-sort\/$/);
  });

  test('窄螢幕：地圖在框內橫向捲動，頁面本身不溢出', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
    const svg = await page.locator('svg.subject-map').boundingBox();
    expect(svg!.width).toBeGreaterThan(390);
  });
});

test('沒有開放的科目沒有頁面', async ({ request }) => {
  expect((await request.get('/zh-TW/algorithms/')).status()).toBe(404);
});
