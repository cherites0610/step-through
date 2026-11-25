import { expect, test } from './fixtures';

const cssVar = (page: import('@playwright/test').Page, name: string) =>
  page.evaluate((n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(), name);

test('紙色為 #F5F4F6，且有極淡的邊緣漂移；章節欄可見', async ({ page }) => {
  await page.goto('/zh-TW/data-structures/sorting/insertion-sort/');
  expect(await cssVar(page, '--color-paper')).toBe('#f5f4f6');
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundImage);
  expect(bg).toContain('radial-gradient');
  await expect(page.getByRole('navigation', { name: '主題', exact: true })).toBeVisible();
});

test('投影功能已移除：頂列沒有投影切換鈕，舊的偏好設定不再生效', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('step-through:mode', 'projection'));
  for (const url of ['/zh-TW/', '/zh-TW/data-structures/sorting/insertion-sort/']) {
    await page.goto(url);
    await expect(page.getByRole('button', { name: /投影/ })).toHaveCount(0);
    await expect(page.locator('html')).not.toHaveAttribute('data-mode', /.+/);
    expect(await cssVar(page, '--color-paper')).toBe('#f5f4f6');
  }
});
