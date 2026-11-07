import { expect, test } from './fixtures';
import type { Page } from '@playwright/test';

const slider = (page: Page, name: string) => page.getByRole('slider', { name });
const toEnd = (page: Page, name = '步驟') => slider(page, name).fill('99999');
const stat = (page: Page, label: string) =>
  page.locator('dt', { hasText: label }).locator('xpath=following-sibling::dd');
const explanation = (page: Page) => page.locator('aside p[aria-live]');

/** 目前畫面上每個節點的數字與位置（量方框本身，不含角落標籤；用位置判斷誰是根：y 最小） */
const nodes = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll('svg g.node')].map((g) => {
      const r = g.querySelector('rect')!.getBoundingClientRect();
      return { v: g.querySelector('text')!.textContent!, bf: g.querySelectorAll('text')[1].textContent!, x: Math.round(r.x), y: Math.round(r.y) };
    }),
  );

test.describe('AVL 樹插入', () => {
  test('頁面基本元素：輸入、預設按鈕、平衡因子說明、偽代碼', async ({ page }) => {
    await page.goto('/zh-TW/avl-insert/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('AVL 樹插入');
    for (const name of ['隨機', 'LL 右旋', 'RR 左旋', 'LR 雙旋', 'RL 雙旋', '連續遞增']) {
      await expect(page.getByRole('button', { name })).toBeVisible();
    }
    await expect(page.getByText('平衡因子 BF')).toBeVisible();
    await expect(page.locator('li[aria-current="step"]')).toContainText('insert(v)');
    await expect(page.locator('header')).toContainText('樹 · 02');
  });

  for (const [preset, kind] of [
    ['LL 右旋', 'LL'],
    ['RR 左旋', 'RR'],
    ['LR 雙旋', 'LR'],
    ['RL 雙旋', 'RL'],
  ] as const) {
    test(`${preset}：失衡時標出 ${kind}，旋轉後 20 成為根、三個節點平衡因子都是 0`, async ({ page }) => {
      await page.goto('/zh-TW/avl-insert/');
      await page.getByRole('button', { name: preset }).click();

      // 找到失衡那一步
      const s = slider(page, '步驟');
      let found = false;
      for (let i = 0; i < 30 && !found; i++) {
        await s.fill(String(i));
        found = /失衡/.test(await explanation(page).innerText());
      }
      expect(found).toBe(true);
      await expect(explanation(page)).toContainText(`${kind} 情況`);
      await expect(page.getByRole('img', { name: /目前的樹/ })).toContainText(kind);
      // LL、LR 是左邊太重（BF +2），RR、RL 是右邊太重（BF −2）
      const heavy = kind === 'LL' || kind === 'LR' ? 'BF +2' : 'BF −2';
      await expect(page.getByRole('img', { name: /目前的樹/ })).toContainText(heavy);

      await toEnd(page);
      await page.waitForTimeout(600); // 等旋轉動畫結束
      const ns = await nodes(page);
      const root = ns.reduce((a, b) => (b.y < a.y ? b : a));
      expect(root.v).toBe('20');
      expect(ns.map((n) => n.bf)).toEqual(ns.map(() => 'BF 0'));
      await expect(stat(page, '樹高')).toHaveText('2');
      await expect(stat(page, '旋轉次數')).toHaveText(kind === 'LL' || kind === 'RR' ? '1' : '2');
    });
  }

  test('旋轉只讓節點上下移動，左右位置不變（中序順序不變）', async ({ page }) => {
    await page.goto('/zh-TW/avl-insert/');
    await page.getByRole('button', { name: 'RR 左旋' }).click();
    const s = slider(page, '步驟');
    let unb = -1;
    for (let i = 0; i < 30 && unb < 0; i++) {
      await s.fill(String(i));
      if (/失衡/.test(await explanation(page).innerText())) unb = i;
    }
    await page.waitForTimeout(600);
    const before = Object.fromEntries((await nodes(page)).map((n) => [n.v, n]));
    await s.fill(String(unb + 2)); // 旋轉完成
    await page.waitForTimeout(700);
    const after = Object.fromEntries((await nodes(page)).map((n) => [n.v, n]));
    for (const v of ['10', '20', '30']) expect(after[v].x).toBe(before[v].x);
    expect(after['20'].y).toBeLessThan(before['20'].y); // 20 升上來
  });

  test('連續遞增：AVL 保持完美平衡，樹高 3、根是 40，共 4 次旋轉', async ({ page }) => {
    await page.goto('/zh-TW/avl-insert/');
    await page.getByRole('button', { name: '連續遞增' }).click();
    await toEnd(page);
    await page.waitForTimeout(600);
    const ns = await nodes(page);
    expect(ns).toHaveLength(7);
    expect(ns.reduce((a, b) => (b.y < a.y ? b : a)).v).toBe('40');
    await expect(stat(page, '樹高')).toHaveText('3');
    await expect(stat(page, '旋轉次數')).toHaveText('4');
    await expect(explanation(page)).toContainText('全部插入完成');
  });

  test('自訂輸入：重複的數字被略過；不合法輸入顯示錯誤且不改動樹', async ({ page }) => {
    await page.goto('/zh-TW/avl-insert/');
    const input = page.getByRole('textbox');
    await input.fill('5 3 5 8');
    await page.getByRole('button', { name: '套用' }).click();
    const s = slider(page, '步驟');
    let skipped = false;
    for (let i = 0; i < 30 && !skipped; i++) {
      await s.fill(String(i));
      skipped = /略過/.test(await explanation(page).innerText());
    }
    expect(skipped).toBe(true);
    await toEnd(page);
    await expect(page.getByRole('img', { name: /目前的樹（中序）：3, 5, 8/ })).toBeVisible();

    await input.fill('5 x');
    await page.getByRole('button', { name: '套用' }).click();
    await expect(page.getByRole('alert')).toContainText('只能輸入整數');
    await expect(page.getByRole('img', { name: /目前的樹（中序）：3, 5, 8/ })).toBeVisible();
  });

  test('第一步與播放器：回到第一步時是空樹', async ({ page }) => {
    await page.goto('/zh-TW/avl-insert/');
    await toEnd(page);
    await slider(page, '步驟').fill('0');
    await expect(page.getByRole('img', { name: /目前的樹/ })).toContainText('（空樹）');
    await expect(page.getByText('尚未開始')).toBeVisible();
  });

  test('英文版：文案、標籤與旋轉說明', async ({ page }) => {
    await page.goto('/en/avl-insert/');
    await expect(page.getByRole('button', { name: 'LR double' })).toBeVisible();
    await page.getByRole('button', { name: 'LL right' }).click();
    const s = slider(page, 'Step');
    let found = false;
    for (let i = 0; i < 30 && !found; i++) {
      await s.fill(String(i));
      found = /unbalanced/.test(await explanation(page).innerText());
    }
    expect(found).toBe(true);
    await expect(explanation(page)).toContainText('LL case');
    await expect(page.getByRole('img', { name: /Current tree \(in order\): 10, 20, 30/ })).toBeVisible();
    await expect(page.getByText('Balance factor BF')).toBeVisible();
  });

  test('投影模式下樹仍完整可見', async ({ page }) => {
    await page.goto('/zh-TW/avl-insert/');
    await page.getByRole('button', { name: '投影模式' }).click();
    await toEnd(page);
    const box = await page.getByRole('img', { name: /目前的樹/ }).boundingBox();
    expect(box!.width).toBeGreaterThan(400);
  });
});
