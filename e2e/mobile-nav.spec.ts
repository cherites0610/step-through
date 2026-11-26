import { devices } from '@playwright/test';
import { expect, test } from './fixtures';

test.describe('手機：隨時可以返回', () => {
  test.use({ viewport: devices['iPhone 13'].viewport, hasTouch: true, isMobile: true });

  test('單元頁：捲到下面時頂列仍在，「← 排序」回到所屬的章節頁', async ({ page }) => {
    await page.goto('/zh-TW/data-structures/sorting/insertion-sort/');
    await page.evaluate(() => scrollTo(0, 1500));
    const back = page.locator('header').getByRole('link', { name: '← 排序' });
    await expect(back).toBeInViewport();
    await expect(back).toHaveAttribute('href', '/zh-TW/data-structures/sorting/');
    // 手機上單元欄的返回連結收起來，避免重複
    await expect(page.getByRole('link', { name: '← 10 排序' })).toBeHidden();

    await back.click();
    await expect(page).toHaveURL(/\/zh-TW\/data-structures\/sorting\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('排序');
  });

  test('章節頁：「← 資料結構」回到地圖，章節欄收起來', async ({ page }) => {
    await page.goto('/zh-TW/data-structures/sorting/');
    await expect(page.getByRole('navigation', { name: '章節' })).toBeHidden();
    await page.evaluate(() => scrollTo(0, 2000));
    const back = page.locator('header').getByRole('link', { name: '← 資料結構' });
    await expect(back).toBeInViewport();
    await back.click();
    await expect(page).toHaveURL(/\/zh-TW\/data-structures\/$/);
  });

  test('科目頁：捲到下面時仍有「← 科目目錄」', async ({ page }) => {
    await page.goto('/zh-TW/data-structures/');
    await page.evaluate(() => scrollTo(0, 3000));
    const back = page.locator('header').getByRole('link', { name: '← 科目目錄' });
    await expect(back).toBeInViewport();
    await back.click();
    await expect(page).toHaveURL(/\/zh-TW\/#index$/);
  });

  test('在章節清單裡點「建議先讀」跳轉之後，上一頁直接回到來的那一頁', async ({ page }) => {
    await page.goto('/zh-TW/');
    await page.locator('#index').getByRole('link', { name: /^資料結構/ }).click();
    await expect(page).toHaveURL(/\/zh-TW\/data-structures\/$/);

    await page.locator('#ch-graphs').getByRole('link', { name: '04 鏈結串列' }).click();
    await expect(page).toHaveURL(/#ch-linked-lists$/);
    await page.locator('#ch-linked-lists').getByRole('link', { name: '02 陣列與矩陣' }).click();
    await expect(page).toHaveURL(/#ch-arrays$/);
    await expect(page.locator('#ch-arrays')).toBeInViewport();
    // 章節標題不會被固定的頂列蓋住
    expect((await page.locator('#ch-arrays h3').boundingBox())!.y).toBeGreaterThanOrEqual(56);

    await page.goBack();
    await expect(page).toHaveURL(/\/zh-TW\/$/);
  });
});

test('桌機：頂列保留站名與科目，單元欄有返回章節的連結', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/zh-TW/data-structures/sorting/insertion-sort/');
  const header = page.locator('header');
  await expect(header.getByRole('link', { name: '步步看懂' })).toBeVisible();
  await expect(header.getByRole('link', { name: '資料結構', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: '← 10 排序' })).toBeVisible();
  await page.evaluate(() => scrollTo(0, 1500));
  await expect(header).toBeInViewport();
});

test.describe('點連結進入的新頁面從最上方開始', () => {
  test.use({ viewport: devices['iPhone 13'].viewport, hasTouch: true, isMobile: true });

  test('在章節頁底部點「接著可以讀」：新頁面在最上方；上一頁回到原本的位置', async ({ page }) => {
    await page.goto('/zh-TW/data-structures/basics/');
    const link = page.locator('aside').getByRole('link', { name: /陣列與矩陣/ });
    await link.scrollIntoViewIfNeeded();
    const before = await page.evaluate(() => scrollY);
    expect(before).toBeGreaterThan(1000);
    await link.tap();
    await expect(page).toHaveURL(/\/zh-TW\/data-structures\/arrays\/$/);
    await page.waitForLoadState('load');
    expect(await page.evaluate(() => scrollY)).toBe(0);
    await expect(page.getByRole('heading', { level: 1 })).toBeInViewport();

    await page.goBack();
    await expect(page).toHaveURL(/\/basics\/$/);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(1000);
  });

  test('有 #錨點 的連結仍然捲到錨點', async ({ page }) => {
    await page.goto('/zh-TW/data-structures/sorting/');
    await page.locator('aside').getByRole('link', { name: /在完整地圖中查看/ }).tap();
    await expect(page).toHaveURL(/#ch-sorting$/);
    await page.waitForLoadState('load');
    await expect(page.locator('#ch-sorting')).toBeInViewport();
  });
});
