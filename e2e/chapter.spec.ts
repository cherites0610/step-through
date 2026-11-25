import { expect, test } from './fixtures';

test.describe('章節頁', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
  });

  test('四段內容、先修與章節欄', async ({ page }) => {
    await page.goto('/zh-TW/data-structures/sorting/');
    await expect(page).toHaveTitle(/^排序｜資料結構｜步步看懂/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('排序');
    for (const name of ['觀念說明', '單元', '考題練習', '章末自我檢核']) {
      await expect(page.getByRole('heading', { level: 2, name })).toBeVisible();
    }
    const main = page.locator('main');
    await expect(main.getByRole('link', { name: '02 陣列與矩陣' })).toHaveAttribute('href', '/zh-TW/data-structures/arrays/');

    const rail = page.getByRole('navigation', { name: '章節' });
    await expect(rail.getByRole('link')).toHaveCount(11 + 1); // 11 章 + 回到科目
    await expect(rail.locator('[aria-current="page"]')).toContainText('排序');

    const types = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((els) => els.map((e) => JSON.parse(e.textContent ?? '{}')['@type']));
    expect(types).toEqual(['LearningResource', 'BreadcrumbList']);
  });

  test('單元：已上線的連到單元頁，其餘是即將推出', async ({ page }) => {
    await page.goto('/zh-TW/data-structures/sorting/');
    const units = page.locator('section[aria-labelledby="units"]');
    await expect(units.getByRole('link')).toHaveCount(5);
    await units.getByRole('link', { name: /合併排序/ }).click();
    await expect(page).toHaveURL(/\/zh-TW\/data-structures\/sorting\/merge-sort\/$/);
  });

  test('考題：出處、題型、難度，詳解預設收合', async ({ page }) => {
    await page.goto('/zh-TW/data-structures/sorting/');
    const q = page.locator('li.question').first();
    await expect(q).toContainText('自編');
    await expect(q).toContainText('計算');
    await expect(q.getByText('難度 1／3')).toBeAttached();
    const answer = q.getByText('比較 12 次、位移 9 次。');
    await expect(answer).toBeHidden();
    await q.getByText('看詳解').click();
    await expect(answer).toBeVisible();
  });

  test('自我檢核列出「我能……」；沒有題目的章節顯示準備中', async ({ page }) => {
    await page.goto('/zh-TW/data-structures/balanced-trees/');
    const checklist = page.locator('section[aria-labelledby="checklist"]');
    await expect(checklist.getByRole('listitem')).toHaveCount(4);
    await expect(page.locator('section[aria-labelledby="questions"]')).toContainText('這一章還沒有題目');
  });

  test('迷你地圖：先修、本章、後續；上一章與下一章', async ({ page }) => {
    await page.goto('/zh-TW/data-structures/trees/');
    const aside = page.locator('aside');
    await expect(aside.getByRole('link', { name: /堆疊與佇列/ })).toBeVisible();
    await expect(aside.getByRole('link', { name: /鏈結串列/ })).toBeVisible();
    for (const name of [/二元搜尋樹/, /堆積與優先佇列/, /^09\s*圖/]) await expect(aside.getByRole('link', { name })).toBeVisible();
    const nav = page.getByRole('navigation', { name: '上一章與下一章' });
    await expect(nav.getByRole('link', { name: /鏈結串列/ })).toHaveAttribute('href', '/zh-TW/data-structures/linked-lists/');
    await expect(nav.getByRole('link', { name: /二元搜尋樹/ })).toHaveAttribute('href', '/zh-TW/data-structures/bst/');
  });

  test('第 1 章：觀念說明、摘要、單元連到觀念說明的段落、10 題考題', async ({ page }) => {
    await page.goto('/zh-TW/data-structures/basics/');
    await expect(page.locator('main')).toContainText('用漸近符號描述演算法的成長率');
    const concepts = page.locator('section[aria-labelledby="concepts"]');
    for (const name of ['演算法與效能分析', '漸近符號', '遞迴與遞迴關係式', '主定理', '常見陷阱'])
      await expect(concepts.getByRole('heading', { level: 3, name })).toBeVisible();
    await expect(concepts).not.toContainText('準備中');

    const units = page.locator('section[aria-labelledby="units"]');
    await expect(units.getByRole('link')).toHaveCount(4);
    await units.getByRole('link', { name: /主定理/ }).click();
    await expect(page.getByRole('heading', { level: 3, name: '主定理' })).toBeInViewport();
    // 頁內跳轉不新增瀏覽紀錄
    expect(decodeURIComponent(new URL(page.url()).hash)).toBe('#主定理');

    await expect(page.locator('li.question')).toHaveCount(10);
    await expect(page.locator('section[aria-labelledby="checklist"] fieldset')).toHaveCount(5);
    // 描述用觀念說明的摘要
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /漸近符號/);
  });

  test('其他科目的章節頁也存在', async ({ request }) => {
    for (const url of ['/zh-TW/algorithms/dp/', '/zh-TW/operating-systems/deadlock/', '/zh-TW/intro-cs/security/']) {
      expect((await request.get(url)).status(), url).toBe(200);
    }
  });
});

test('v1 的主題網址已不存在（正式環境由 _redirects 301 到新網址）', async ({ request }) => {
  expect((await request.get('/zh-TW/insertion-sort/')).status()).toBe(404);
});
