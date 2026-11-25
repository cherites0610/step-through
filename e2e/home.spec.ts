import { expect, test } from './fixtures';

test('首頁：科目目錄列出所有科目，每個都連到它的學習地圖', async ({ page }) => {
  await page.goto('/zh-TW/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('看課本看不懂的');

  const index = page.locator('#index');
  await expect(index.getByRole('heading', { name: '科目目錄' })).toBeVisible();
  const subjects: Record<string, string> = {
    資料結構: 'data-structures',
    演算法: 'algorithms',
    作業系統: 'operating-systems',
    計算機組織: 'computer-organization',
    離散數學: 'discrete-math',
    線性代數: 'linear-algebra',
    資料庫: 'databases',
    計算機概論: 'intro-cs',
  };
  await expect(index.getByRole('link')).toHaveCount(Object.keys(subjects).length);
  for (const [name, id] of Object.entries(subjects)) {
    await expect(index.getByRole('link', { name: new RegExp(`^${name}`) })).toHaveAttribute('href', `/zh-TW/${id}/`);
  }
  // 沒有即將推出的科目時，不顯示圖例
  await expect(index.getByText('即將推出')).toHaveCount(0);
});

test('首頁：主要行動可用，首屏不載入互動 JS', async ({ page }) => {
  await page.goto('/zh-TW/');
  await expect(page.locator('astro-island')).toHaveCount(0);

  await page.getByRole('link', { name: '瀏覽科目' }).click();
  await expect(page).toHaveURL(/#index$/);

  await page.getByRole('link', { name: /從資料結構開始/ }).click();
  await expect(page).toHaveURL(/\/zh-TW\/data-structures\/$/);
});

test('首頁：只有繁體中文，沒有語言切換', async ({ page }) => {
  await page.goto('/zh-TW/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-TW');
  await expect(page.getByRole('navigation', { name: 'Language' })).toHaveCount(0);
  await expect(page.locator('a[href^="/en/"]')).toHaveCount(0);
});

test('首頁有 WebSite 結構化資料', async ({ page }) => {
  await page.goto('/zh-TW/');
  const types = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((els) => els.map((e) => JSON.parse(e.textContent ?? '{}')['@type']));
  expect(types).toEqual(['WebSite']);
});

test('單元頁頂列：科目連結與「章節編號 章名 · 章內序號」，序號與科目頁的章節清單一致', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/zh-TW/data-structures/');
  const units = page.locator('#ch-sorting li');
  const titles = (await units.allInnerTexts()).map((t) => t.replace(/已上線|即將推出/, '').trim());

  const live: Record<string, string> = {
    'insertion-sort': '插入排序',
    'bubble-sort': '氣泡排序',
    'selection-sort': '選擇排序',
    'merge-sort': '合併排序',
    'quick-sort': '快速排序',
  };
  for (const [slug, title] of Object.entries(live)) {
    await page.goto(`/zh-TW/${slug}/`);
    const header = page.locator('header');
    await expect(header.getByRole('link', { name: '資料結構' })).toHaveAttribute('href', '/zh-TW/data-structures/#ch-sorting');
    // 序號 = 在科目頁章節清單中的位置
    await expect(header).toContainText(`10 排序 · ${String(titles.indexOf(title) + 1).padStart(2, '0')}`);
  }
  await page.goto('/zh-TW/avl-insert/');
  await expect(page.locator('header')).toContainText('08 平衡搜尋樹 · 01');
  await expect(page.getByText('Plate 00')).toHaveCount(0);
});

test('單元頁的章節欄可以回到科目地圖的該章', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/zh-TW/quick-sort/');
  await page.getByRole('link', { name: /資料結構學習地圖/ }).click();
  await expect(page).toHaveURL(/\/zh-TW\/data-structures\/#ch-sorting$/);
  await expect(page.locator('#ch-sorting')).toBeInViewport();
});
