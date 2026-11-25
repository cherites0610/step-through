import { devices } from '@playwright/test';
import { expect, test } from './fixtures';

test.describe('手機：隨時可以返回', () => {
  test.use({ viewport: devices['iPhone 13'].viewport, hasTouch: true, isMobile: true });

  test('單元頁：捲到下面時頂列仍在，「← 資料結構」回到地圖的這一章', async ({ page }) => {
    await page.goto('/zh-TW/insertion-sort/');
    await page.evaluate(() => scrollTo(0, 1500));
    const back = page.locator('header').getByRole('link', { name: '← 資料結構' });
    await expect(back).toBeInViewport();
    await expect(back).toHaveAttribute('href', '/zh-TW/data-structures/#ch-sorting');
    // 手機上章節欄的返回連結收起來，避免重複
    await expect(page.getByRole('link', { name: /資料結構學習地圖/ })).toBeHidden();

    await back.click();
    await expect(page).toHaveURL(/\/zh-TW\/data-structures\/#ch-sorting$/);
    // 章節標題不會被固定的頂列蓋住
    const top = (await page.locator('#ch-sorting h3').boundingBox())!.y;
    expect(top).toBeGreaterThanOrEqual(56);
  });

  test('科目頁：捲到下面時仍有「← 科目目錄」', async ({ page }) => {
    await page.goto('/zh-TW/data-structures/');
    await page.evaluate(() => scrollTo(0, 3000));
    const back = page.locator('header').getByRole('link', { name: '← 科目目錄' });
    await expect(back).toBeInViewport();
    await back.click();
    await expect(page).toHaveURL(/\/zh-TW\/#index$/);
  });

  test('在地圖上點章節、點建議先讀之後，上一頁直接回到來的那一頁', async ({ page }) => {
    await page.goto('/zh-TW/');
    await page.locator('#index').getByRole('link', { name: /^資料結構/ }).click();
    await expect(page).toHaveURL(/\/zh-TW\/data-structures\/$/);

    await page.locator('svg.subject-map').getByRole('link', { name: /^10\s*排序/ }).click();
    await expect(page).toHaveURL(/#ch-sorting$/);
    await page.locator('#ch-sorting').getByRole('link', { name: '02 陣列與矩陣' }).click();
    await expect(page).toHaveURL(/#ch-arrays$/);
    await expect(page.locator('#ch-arrays')).toBeInViewport();

    await page.goBack();
    await expect(page).toHaveURL(/\/zh-TW\/$/);
  });
});

test('桌機：頂列保留站名與科目，章節欄有返回地圖的連結', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/zh-TW/insertion-sort/');
  const header = page.locator('header');
  await expect(header.getByRole('link', { name: '步步看懂' })).toBeVisible();
  await expect(header.getByRole('link', { name: '資料結構', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: /資料結構學習地圖/ })).toBeVisible();
  await page.evaluate(() => scrollTo(0, 1500));
  await expect(header).toBeInViewport();
});
