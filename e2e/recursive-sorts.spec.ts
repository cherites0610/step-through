import { expect, test, type Page } from '@playwright/test';

const stat = (page: Page, label: string) =>
  page.locator('dt', { hasText: label }).locator('xpath=following-sibling::dd');

/** 拖到最後一步 */
const toEnd = (page: Page, name: string) => page.getByRole('slider', { name }).fill('99999');

test.describe('快速排序', () => {
  test('基準選法：預設「尾」，可切換，切換後回到第一步', async ({ page }) => {
    await page.goto('/zh-TW/quick-sort/');
    const last = page.getByRole('radio', { name: '尾' });
    await expect(last).toBeChecked();

    await page.getByRole('button', { name: '下一步' }).click();
    await page.getByRole('button', { name: '下一步' }).click();
    await expect(page.getByText(/步驟\s*0?3\s*\//)).toBeVisible();

    await page.locator('fieldset label', { hasText: '三數取中' }).click();
    await expect(page.getByRole('radio', { name: '三數取中' })).toBeChecked();
    await expect(page.getByText(/步驟\s*0?1\s*\//)).toBeVisible();
  });

  test('已排序＋尾基準是最差情況；改用三數取中後比較次數與遞迴深度都變少', async ({ page }) => {
    await page.goto('/zh-TW/quick-sort/');
    await page.getByRole('button', { name: '已排序' }).click();

    await toEnd(page, '步驟');
    await expect(page.getByText('排序完成')).toBeVisible();
    // n = 8：n(n-1)/2 = 28 次比較，遞迴深度 8，沒有交換
    await expect(stat(page, '比較次數')).toHaveText('28');
    await expect(stat(page, '最大遞迴深度')).toHaveText('8');
    await expect(stat(page, '交換次數')).toHaveText('0');

    await page.locator('fieldset label', { hasText: '三數取中' }).click();
    await toEnd(page, '步驟');
    const compare = Number(await stat(page, '比較次數').innerText());
    const depth = Number(await stat(page, '最大遞迴深度').innerText());
    expect(compare).toBeLessThan(28);
    expect(depth).toBeLessThan(8);
  });

  test('平衡分割預設：n = 8 時遞迴深度 4，遠小於最差情況的 8', async ({ page }) => {
    await page.goto('/zh-TW/quick-sort/');
    await page.getByRole('button', { name: '平衡分割' }).click();
    await toEnd(page, '步驟');
    await expect(stat(page, '最大遞迴深度')).toHaveText('4'); // ⌈log2(8 + 1)⌉
  });

  test('畫面標出基準與 i／j 指標，並有呼叫堆疊', async ({ page }) => {
    await page.goto('/zh-TW/quick-sort/');
    // 第 3 步：挑基準
    await page.getByRole('slider', { name: '步驟' }).fill('2');
    await expect(page.getByRole('img', { name: /目前陣列/ })).toContainText('基準');
    await expect(page.getByRole('region', { name: '呼叫堆疊' })).toContainText('quickSort(0, 6)');
    // 往後幾步，i／j 指標出現
    await page.getByRole('slider', { name: '步驟' }).fill('5');
    const svg = page.getByRole('img', { name: /目前陣列/ });
    await expect(svg).toContainText('j');
    await expect(svg).toContainText('i');
  });

  test('自訂輸入含重複值也能排好', async ({ page }) => {
    await page.goto('/en/quick-sort/');
    await page.getByRole('textbox').fill('5 5 3 9 3 1 5');
    await page.getByRole('button', { name: 'Apply' }).click();
    await toEnd(page, 'Step');
    await expect(page.getByRole('img', { name: /Current array: 1, 3, 3, 5, 5, 5, 9/ })).toBeVisible();
  });
});

test.describe('合併排序', () => {
  test('遞迴樹、合併區與呼叫堆疊都在，播放到最後排好', async ({ page }) => {
    await page.goto('/zh-TW/merge-sort/');
    await expect(page.getByRole('region', { name: '呼叫堆疊' })).toBeVisible();
    await expect(page.getByRole('img', { name: /目前陣列/ })).toContainText('左半');

    await toEnd(page, '步驟');
    await expect(page.getByText('排序完成')).toBeVisible();
    await expect(page.getByRole('img', { name: /目前陣列：3, 9, 10, 27, 38, 43, 82/ })).toBeVisible();
    await expect(page.getByRole('region', { name: '呼叫堆疊' })).toContainText('沒有進行中的呼叫');
  });

  test('合併到一半時，呼叫堆疊最上面是正在合併的那一段', async ({ page }) => {
    await page.goto('/zh-TW/merge-sort/');
    // 切到「比較左…與右…」那一類的步驟
    const slider = page.getByRole('slider', { name: '步驟' });
    let found = false;
    for (let i = 0; i < 60 && !found; i++) {
      await slider.fill(String(i));
      found = (await page.getByText(/^比較左/).count()) > 0;
    }
    expect(found).toBe(true);
    const top = page.getByRole('region', { name: '呼叫堆疊' }).locator('[aria-current="step"]');
    await expect(top).toContainText('mergeSort(');
  });

  test('相等的數字取左邊（穩定）', async ({ page }) => {
    await page.goto('/zh-TW/merge-sort/');
    await page.getByRole('textbox').fill('2, 2');
    await page.getByRole('button', { name: '套用' }).click();
    const slider = page.getByRole('slider', { name: '步驟' });
    let seen = '';
    for (let i = 0; i < 12; i++) {
      await slider.fill(String(i));
      const t = await page.locator('aside p[aria-live]').innerText();
      if (t.includes('取左邊')) seen = t;
    }
    expect(seen).toContain('相等時取左邊');
  });

  test('英文版文案與標籤', async ({ page }) => {
    await page.goto('/en/merge-sort/');
    await expect(page.getByRole('region', { name: 'Call stack' })).toBeVisible();
    await expect(page.getByRole('img', { name: /Current array/ })).toContainText('LEFT');
  });
});

test('手機：快速排序舞台在容器內捲動，頁面本身不橫向溢出', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/zh-TW/quick-sort/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  // 12 個數字時，數字仍維持可讀大小（SVG 不被縮到看不清楚）
  await page.getByRole('textbox').fill('1 2 3 4 5 6 7 8 9 10 11 12');
  await page.getByRole('button', { name: '套用' }).click();
  const svg = page.getByRole('img', { name: /目前陣列/ });
  const box = await svg.boundingBox();
  expect(box!.width).toBeGreaterThanOrEqual(480);
});
