import { devices } from '@playwright/test';
import { expect, test } from './fixtures';

const map = 'svg.subject-map';
const node = (id: string) => `${map} a.node[data-id="${id}"]`;

/** 把一章的章末檢核全部自評為已掌握 */
async function master(page: import('@playwright/test').Page, chapter: string) {
  await page.goto(`/zh-TW/data-structures/${chapter}/`);
  const inputs = page.locator('input[data-check][value="mastered"]');
  const n = await inputs.count();
  for (let i = 0; i < n; i++) await inputs.nth(i).check({ force: true });
}

test.describe('學習進度（只存在本機）', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
  });

  test('沒有進度：沒有先修的章節可以開始並被建議，其餘建議先讀先修', async ({ page }) => {
    await page.goto('/zh-TW/data-structures/');
    await expect(page.locator(node('basics'))).toHaveAttribute('data-state', 'ready');
    await expect(page.locator(node('basics'))).toHaveAttribute('data-suggested', '');
    await expect(page.locator(node('sorting'))).toHaveAttribute('data-state', 'blocked');
    await expect(page.locator('[data-suggest-for]')).toContainText('01 基本觀念與複雜度');
    // 螢幕閱讀器讀得到狀態
    await expect(page.locator(map).getByRole('link', { name: /01\s*基本觀念與複雜度.*可以開始/ })).toBeVisible();
  });

  test('自評全部掌握：章節變成已掌握，後續章節可以開始，建議下一章往後移，重新整理後保留', async ({ page }) => {
    await master(page, 'basics');
    await expect(page.locator('[data-done-for="data-structures/basics"]')).toBeVisible();
    await master(page, 'arrays');

    await page.goto('/zh-TW/data-structures/');
    await expect(page.locator(node('basics'))).toHaveAttribute('data-state', 'mastered');
    await expect(page.locator(node('arrays'))).toHaveAttribute('data-state', 'mastered');
    for (const id of ['stacks-queues', 'linked-lists', 'sorting', 'hashing'])
      await expect(page.locator(node(id))).toHaveAttribute('data-state', 'ready');
    await expect(page.locator(node('trees'))).toHaveAttribute('data-state', 'blocked');
    await expect(page.locator('[data-suggest-for]')).toContainText('03 堆疊與佇列');
    await expect(page.locator('[data-suggest-for] a')).toHaveAttribute('href', '/zh-TW/data-structures/stacks-queues/');

    await page.reload();
    await expect(page.locator(node('arrays'))).toHaveAttribute('data-state', 'mastered');

    await page.goto('/zh-TW/');
    await expect(page.locator('[data-mastered-of="data-structures"]')).toHaveText('已掌握 2 / 11');
    await expect(page.locator('[data-mastered-of="algorithms"]')).toBeHidden();
  });

  test('只要有一項不是已掌握，就是學習中；進入章節頁也算開始讀', async ({ page }) => {
    await page.goto('/zh-TW/data-structures/sorting/');
    await page.locator('input[data-check][data-index="0"][value="partial"]').check({ force: true });
    await expect(page.locator('[data-done-for="data-structures/sorting"]')).toBeHidden();
    // 章節欄上這一章立刻變成學習中
    await expect(page.getByRole('navigation', { name: '章節' }).locator('[aria-current="page"]')).toHaveAttribute(
      'data-state',
      'learning',
    );

    await page.goto('/zh-TW/data-structures/hashing/');
    await page.goto('/zh-TW/data-structures/');
    await expect(page.locator(node('sorting'))).toHaveAttribute('data-state', 'learning');
    await expect(page.locator(node('hashing'))).toHaveAttribute('data-state', 'learning');
  });

  test('考題的作答紀錄與檢核自評重新整理後保留', async ({ page }) => {
    await page.goto('/zh-TW/data-structures/sorting/');
    await page.locator('input[data-question][value="review"]').first().check({ force: true });
    await page.locator('input[data-check][data-index="1"][value="unsure"]').check({ force: true });
    await page.reload();
    await expect(page.locator('input[data-question][value="review"]').first()).toBeChecked();
    await expect(page.locator('input[data-check][data-index="1"][value="unsure"]')).toBeChecked();
  });

  test('壞掉的進度資料不會讓頁面出錯', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.addInitScript(() => localStorage.setItem('step-through:progress', '{壞掉'));
    await page.goto('/zh-TW/data-structures/');
    await expect(page.locator(node('basics'))).toHaveAttribute('data-state', 'ready');
    expect(errors).toEqual([]);
  });
});

test.describe('地圖高亮', () => {
  test('滑鼠移到章節上：它的先修與後續維持清楚，無關的章節淡出', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/zh-TW/data-structures/');
    await page.locator(node('bst')).hover();
    const svg = page.locator(map);
    await expect(svg).toHaveAttribute('data-hl', 'bst');
    for (const id of ['basics', 'arrays', 'stacks-queues', 'linked-lists', 'trees', 'bst', 'balanced-trees'])
      await expect(page.locator(node(id))).toHaveClass(/\bon\b/);
    for (const id of ['sorting', 'hashing', 'heaps', 'graphs']) await expect(page.locator(node(id))).not.toHaveClass(/\bon\b/);
    await expect(svg.locator('g.edge.on[data-from="bst"][data-to="balanced-trees"]')).toHaveCount(1);
    // 兩端都高亮、但不在先修鏈上的邊不高亮（樹與二元樹 → 圖 不是二元搜尋樹的先修或後續）
    await expect(svg.locator('g.edge.on[data-to="graphs"]')).toHaveCount(0);

    await page.mouse.move(5, 5);
    await expect(svg).not.toHaveAttribute('data-hl', /.+/);
  });

  test('鍵盤聚焦也會高亮', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/zh-TW/data-structures/');
    await page.locator(node('sorting')).focus();
    await expect(page.locator(map)).toHaveAttribute('data-hl', 'sorting');
  });
});

test.describe('手機：縱向地圖', () => {
  test.use({ viewport: devices['iPhone 13'].viewport, hasTouch: true, isMobile: true });

  test('依層排列、標示可以平行讀，SVG 地圖收起', async ({ page }) => {
    await page.goto('/zh-TW/data-structures/');
    await expect(page.locator(map)).toBeHidden();
    const vmap = page.getByRole('list', { name: '資料結構的章節先修關係圖' });
    await expect(vmap).toBeVisible();
    await expect(vmap.getByRole('link')).toHaveCount(11);
    await expect(vmap).toContainText('第 3 層');
    await expect(vmap).toContainText('可以平行讀');
    await vmap.getByRole('link', { name: /10\s*排序/ }).click();
    await expect(page).toHaveURL(/\/zh-TW\/data-structures\/sorting\/$/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  });
});
