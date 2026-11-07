import { expect, test } from '@playwright/test';

const slugs = ['insertion-sort', 'bubble-sort', 'selection-sort'];

for (const lang of ['zh-TW', 'en']) {
  for (const slug of slugs) {
    test(`${lang}/${slug} 有獨立 meta、結構化資料與 hreflang`, async ({ page }) => {
      await page.goto(`/${lang}/${slug}/`);
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{20,}/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        `https://step-through.cherites.org/${lang}/${slug}/`,
      );
      await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(2);

      const types = await page
        .locator('script[type="application/ld+json"]')
        .evaluateAll((els) => els.map((e) => JSON.parse(e.textContent ?? '{}')['@type']));
      expect(types).toEqual(['LearningResource', 'FAQPage']);
    });
  }
}

test('播放器：下一步、上一步、鍵盤與時間軸', async ({ page }) => {
  await page.goto('/zh-TW/insertion-sort/');
  const counter = page.getByText(/步驟\s*0?1\s*\/\s*\d+/);
  await expect(counter).toBeVisible();

  await page.getByRole('button', { name: /下一步/ }).click();
  await expect(page.getByText(/步驟\s*0?2\s*\//)).toBeVisible();

  await page.getByRole('button', { name: /上一步/ }).click();
  await expect(page.getByText(/步驟\s*0?1\s*\//)).toBeVisible();

  await page.locator('body').press('ArrowRight');
  await page.locator('body').press('ArrowRight');
  await expect(page.getByText(/步驟\s*0?3\s*\//)).toBeVisible();

  await page.getByRole('slider', { name: '步驟' }).fill('0');
  await expect(page.getByText(/步驟\s*0?1\s*\//)).toBeVisible();
});

test('自訂輸入：套用後重置步驟；不合法輸入顯示錯誤', async ({ page }) => {
  await page.goto('/zh-TW/bubble-sort/');
  const input = page.getByRole('textbox');

  await input.fill('3, 1, 2');
  await page.getByRole('button', { name: '套用' }).click();
  await expect(page.getByRole('img', { name: /目前陣列：3, 1, 2/ })).toBeVisible();
  await expect(page.getByText(/步驟\s*0?1\s*\//)).toBeVisible();

  await input.fill('3, a, 2');
  await page.getByRole('button', { name: '套用' }).click();
  await expect(page.getByRole('alert')).toContainText('只能輸入整數');
  // 錯誤輸入不會改動目前陣列
  await expect(page.getByRole('img', { name: /目前陣列：3, 1, 2/ })).toBeVisible();

  await input.fill('100');
  await page.getByRole('button', { name: '套用' }).click();
  await expect(page.getByRole('alert')).toContainText('0 到 99');
});

test('最佳／最差情況預設：插入排序計次符合理論值', async ({ page }) => {
  await page.goto('/en/insertion-sort/');
  await page.getByRole('button', { name: 'Best case' }).click();
  await page.getByRole('slider', { name: 'Step' }).fill('99999');
  await expect(page.getByText('Sorted: every element is now in its final position.')).toBeVisible();
  // n = 8：最佳情況 7 次比較、0 次位移
  const stat = (label: string) => page.locator('dt', { hasText: label }).locator('xpath=following-sibling::dd');
  await expect(stat('Comparisons')).toHaveText('7');
  await expect(stat('Shifts')).toHaveText('0');

  await page.getByRole('button', { name: 'Worst case' }).click();
  await page.getByRole('slider', { name: 'Step' }).fill('99999');
  await expect(stat('Comparisons')).toHaveText('28');
  await expect(stat('Shifts')).toHaveText('28');
});
