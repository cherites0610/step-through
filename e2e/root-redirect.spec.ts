import { expect, test } from './fixtures';

// 預設模擬繁體中文瀏覽器（Playwright 預設是 en-US，會被正確地導向 /en/）
test.use({ locale: 'zh-TW' });

test('根路徑的 HTML 不含任何可見文字（沒有「Redirecting」那種畫面）', async ({ request }) => {
  const html = await (await request.get('/')).text();
  expect(html).not.toMatch(/Redirecting/i);
  const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/)![1].replace(/<noscript>[\s\S]*?<\/noscript>/g, '');
  expect(body.replace(/<[^>]*>/g, '').trim()).toBe('');
});

test('根路徑預設跳到 zh-TW', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/zh-TW\/$/);
});

test.describe('英文瀏覽器', () => {
  test.use({ locale: 'en-US', extraHTTPHeaders: { 'Accept-Language': 'en-US,en;q=0.9' } });
  test('根路徑跳到 en', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/en\/$/);
  });
});

test.describe('記住使用者選過的語言', () => {
  test.use({ locale: 'en-US' });
  test('在 zh-TW 頁切換到繁中後，下次從 / 進來回到 zh-TW', async ({ page }) => {
    await page.goto('/en/');
    await page.getByRole('navigation', { name: 'Language' }).first().getByRole('link', { name: '繁中' }).click();
    await expect(page).toHaveURL(/\/zh-TW\/$/);
    await page.goto('/');
    await expect(page).toHaveURL(/\/zh-TW\/$/);
  });
});

test('跳轉保留查詢字串與錨點', async ({ page }) => {
  await page.goto('/?a=1#x');
  await expect(page).toHaveURL(/\/zh-TW\/\?a=1#x$/);
});
