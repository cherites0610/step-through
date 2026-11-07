import { expect, test } from './fixtures';

const root = (page: import('@playwright/test').Page) => page.locator('html');
const cssVar = (page: import('@playwright/test').Page, name: string) =>
  page.evaluate((n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(), name);

test('預設不是投影模式：紙色為 #F5F4F6，且有極淡的邊緣漂移', async ({ page }) => {
  await page.goto('/zh-TW/insertion-sort/');
  await expect(root(page)).not.toHaveAttribute('data-mode', /.+/);
  expect(await cssVar(page, '--color-paper')).toBe('#f5f4f6');
  expect(await cssVar(page, '--hair')).toBe('1px');
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundImage);
  expect(bg).toContain('radial-gradient');
  await expect(page.getByRole('button', { name: '投影模式' })).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByRole('navigation', { name: '主題' })).toBeVisible();
});

test('投影模式：純白紙面、2px 髮絲線、放大、隱藏章節欄、無漂移，並於重新整理後保留', async ({ page }) => {
  await page.goto('/zh-TW/insertion-sort/');
  await page.getByRole('button', { name: '投影模式' }).click();

  await expect(root(page)).toHaveAttribute('data-mode', 'projection');
  expect(await cssVar(page, '--color-paper')).toBe('#fff');
  expect(await cssVar(page, '--hair')).toBe('2px');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).zoom)).toBe('1.25');
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundImage)).toBe('none');
  await expect(page.getByRole('navigation', { name: '主題' })).toBeHidden();
  await expect(page.getByRole('button', { name: '投影模式' })).toHaveAttribute('aria-pressed', 'true');

  // 主內容沒有被擠壓：舞台仍有足夠寬度
  const stage = await page.getByRole('img', { name: /目前陣列/ }).boundingBox();
  expect(stage!.width).toBeGreaterThan(400);

  await page.reload();
  await expect(root(page)).toHaveAttribute('data-mode', 'projection');
  await expect(page.getByRole('button', { name: '投影模式' })).toHaveAttribute('aria-pressed', 'true');

  // 切回一般模式並清除保存
  await page.getByRole('button', { name: '投影模式' }).click();
  await expect(root(page)).not.toHaveAttribute('data-mode', /.+/);
  await page.reload();
  await expect(root(page)).not.toHaveAttribute('data-mode', /.+/);
});

test('投影模式在首頁也可用，且標題兩行不折行', async ({ page }) => {
  await page.goto('/zh-TW/');
  await page.getByRole('button', { name: '投影模式' }).click();
  await expect(root(page)).toHaveAttribute('data-mode', 'projection');
  // 兩個語意行各自只佔一行
  const lines = await page.locator('h1 > span').evaluateAll((els) =>
    els.map((e) => Math.round(e.getBoundingClientRect().height / parseFloat(getComputedStyle(e).lineHeight))),
  );
  expect(lines).toEqual([1, 1]);
});

test('en 版投影切換文字', async ({ page }) => {
  await page.goto('/en/');
  await expect(page.getByRole('button', { name: 'Projector mode' })).toBeVisible();
});

test('投影模式首頁：1440 寬時標題不折行，並維持兩欄', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/zh-TW/');
  await page.getByRole('button', { name: '投影模式' }).click();
  const lines = await page.locator('h1 > span').evaluateAll((els) =>
    els.map((e) => Math.round(e.getBoundingClientRect().height / parseFloat(getComputedStyle(e).lineHeight))),
  );
  expect(lines).toEqual([1, 1]);
  const h1 = await page.locator('h1').boundingBox();
  const fig = await page.locator('.home-hero figure').boundingBox();
  expect(fig!.x).toBeGreaterThan(h1!.x + h1!.width - 40); // 標本在標題右側
});
