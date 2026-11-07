import { expect, test } from './fixtures';

test('首頁有 title、description、canonical 與 hreflang', async ({ page }) => {
  await page.goto('/zh-TW/');
  await expect(page).toHaveTitle(/步步看懂/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(2);
});
