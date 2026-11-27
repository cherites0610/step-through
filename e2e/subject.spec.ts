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

  test('地圖：11 個章節節點、每條先修一條邊；有內容（觀念、互動或考題）的章節是實線框', async ({ page }) => {
    const map = page.getByRole('group', { name: '資料結構的章節先修關係圖' });
    const nodes = map.getByRole('link');
    await expect(nodes).toHaveCount(11);
    // 先修共 12 條（鏈結串列 → 圖、樹與二元樹 → 圖 等）
    await expect(map.locator('g[aria-hidden="true"] > g')).toHaveCount(12);
    await expect(map.locator('a.is-live')).toHaveCount(3);
    await expect(map.getByRole('link', { name: /^10\s*排序\s*互動 5／8 · 2 題/ })).toBeVisible();
    await expect(map.getByRole('link', { name: /^08\s*平衡搜尋樹\s*互動 1／6/ })).toBeVisible();
    await expect(map.getByRole('link', { name: /^01\s*基本觀念與複雜度\s*觀念 · 10 題/ })).toBeVisible();
    await expect(map.getByRole('link', { name: /^09\s*圖\s*即將推出/ })).toBeVisible();
  });

  test('點地圖節點進入該章的章節頁；清單的章名也連到章節頁', async ({ page }) => {
    await page.locator('svg.subject-map').getByRole('link', { name: /^10\s*排序/ }).click();
    await expect(page).toHaveURL(/\/zh-TW\/data-structures\/sorting\/$/);
    await page.goBack();
    await expect(page.locator('#ch-graphs').getByRole('link', { name: /^09\s*圖/ })).toHaveAttribute(
      'href',
      '/zh-TW/data-structures/graphs/',
    );
  });

  test('章節清單：先修連結、已上線單元可以點進單元頁', async ({ page }) => {
    const ch = page.locator('#ch-graphs');
    await expect(ch).toContainText('建議先讀');
    await expect(ch.getByRole('link', { name: '04 鏈結串列' })).toHaveAttribute('href', '#ch-linked-lists');
    await expect(page.locator('#ch-basics')).toContainText('從這裡開始');

    await page.locator('#ch-sorting').getByRole('link', { name: /快速排序/ }).click();
    await expect(page).toHaveURL(/\/zh-TW\/data-structures\/sorting\/quick-sort\/$/);
  });
});

// [科目, 名稱, 章節數, 已寫好觀念說明的章節數]
const others: [string, string, number, number][] = [
  ['algorithms', '演算法', 11, 0],
  ['operating-systems', '作業系統', 9, 0],
  ['computer-organization', '計算機組織', 9, 0],
  ['discrete-math', '離散數學', 9, 0],
  ['linear-algebra', '線性代數', 9, 0],
  ['databases', '資料庫', 10, 7],
  ['intro-cs', '計算機概論', 10, 0],
];
for (const [id, title, chapters, written] of others) {
  test(`${title}：學習地圖與章節清單`, async ({ page }) => {
    await page.goto(`/zh-TW/${id}/`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
    const map = page.getByRole('group', { name: `${title}的章節先修關係圖` });
    await expect(map.getByRole('link')).toHaveCount(chapters);
    // 沒有互動單元；還沒寫內容的章節是即將推出
    await expect(map.locator('a.is-soon')).toHaveCount(chapters - written);
    await expect(page.locator('section[aria-labelledby="list-heading"] ol > li')).toHaveCount(chapters);
    await expect(page.locator('main')).toContainText('0 個互動單元已上線');
  });
}
