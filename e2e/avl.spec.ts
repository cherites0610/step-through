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

  test('空樹：整組內容置中——虛線根預留框、「空樹」標題與「10 會成為根」', async ({ page }) => {
    await page.goto('/zh-TW/avl-insert/');
    await toEnd(page);
    await slider(page, '步驟').fill('0');
    const svg = page.getByRole('img', { name: /目前的樹/ });
    await expect(svg).toContainText('空樹');
    await expect(svg).toContainText('10 會成為根');
    await expect(page.getByText('尚未開始')).toBeVisible();

    const box = (await svg.boundingBox())!;
    const slot = (await svg.locator('rect[stroke-dasharray="6 5"]').boundingBox())!;
    const title = (await svg.getByText('空樹', { exact: true }).boundingBox())!;
    const mid = box.x + box.width / 2;
    // 預留框與標題都在舞台水平正中央
    expect(Math.abs(slot.x + slot.width / 2 - mid)).toBeLessThan(2);
    expect(Math.abs(title.x + title.width / 2 - mid)).toBeLessThan(2);
    // 整組內容在垂直方向也大致置中（上下留白差不多）
    const hint = (await svg.getByText('10 會成為根').boundingBox())!;
    const above = slot.y - box.y;
    const below = box.y + box.height - (hint.y + hint.height);
    expect(above).toBeGreaterThan(20);
    expect(below).toBeGreaterThan(20);

    // 下一步：根出現，空狀態消失，根的位置對著它在刻度軸上的刻度
    await page.getByRole('button', { name: '下一步' }).click();
    await expect(svg).not.toContainText('空樹');
    const tick = (await svg.locator('rect[width="6"]').first().boundingBox())!;
    const root = (await svg.locator('g.node rect').first().boundingBox())!;
    expect(Math.abs(root.x + root.width / 2 - (tick.x + tick.width / 2))).toBeLessThan(2);
  });

  test('只有一個數字時：空狀態不擠在一起，文字都在舞台內，樹也置中', async ({ page }) => {
    await page.goto('/zh-TW/avl-insert/');
    await page.getByRole('textbox').fill('7');
    await page.getByRole('button', { name: '套用' }).click();
    const svg = page.getByRole('img', { name: /目前的樹/ });
    await expect(svg).toContainText('7 會成為根');
    const box = (await svg.boundingBox())!;
    // 舞台有足夠高度：說明文字不壓到下方的刻度軸
    const hint = (await svg.getByText('7 會成為根').boundingBox())!;
    const axisTick = (await svg.locator('rect[width="6"]').first().boundingBox())!;
    expect(hint.y + hint.height).toBeLessThan(axisTick.y - 8);
    expect(box.height).toBeGreaterThanOrEqual(250);

    await slider(page, '步驟').fill('1');
    const node = (await svg.locator('g.node rect').first().boundingBox())!;
    expect(Math.abs(node.x + node.width / 2 - (box.x + box.width / 2))).toBeLessThan(2); // 唯一的節點在正中央
  });

  for (const [label, seq] of [
    ['根在最左', '10 20 30'],
    ['根在最右', '90 10 50'],
  ] as const) {
    test(`空樹的說明文字在窄螢幕不會被截掉（${label}）`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto('/en/avl-insert/');
      await page.getByRole('textbox').fill(seq);
      await page.getByRole('button', { name: 'Apply' }).click();
      const svg = page.getByRole('img', { name: /Current tree/ });
      await expect(svg).toContainText('Empty tree');
      const box = (await svg.boundingBox())!;
      const texts = svg.locator('text');
      const n = await texts.count();
      for (let i = 0; i < n; i++) {
        const b = await texts.nth(i).boundingBox();
        if (!b || !b.width) continue;
        // 窄螢幕時 SVG 外層會橫向捲動，所以以 SVG 自身的範圍為準
        expect(b.x).toBeGreaterThanOrEqual(box.x - 1);
        expect(b.x + b.width).toBeLessThanOrEqual(box.x + box.width + 1);
      }
    });
  }

  test('大小順序刻度軸：依序標出所有數字，已插入＝實心、未插入＝空心', async ({ page }) => {
    await page.goto('/zh-TW/avl-insert/'); // 10, 20, 30, 40, 50, 25
    const svg = page.getByRole('img', { name: /目前的樹/ });
    const ticks = svg.locator('rect[width="6"]');
    await expect(ticks).toHaveCount(6);
    const filled = () =>
      ticks.evaluateAll((els) => els.filter((e) => (e.getAttribute('fill') ?? '').includes('ink')).length);
    expect(await filled()).toBe(0);
    await toEnd(page);
    expect(await filled()).toBe(6);
    // 刻度上的數字由小到大
    const labels = await svg.locator('text').allTextContents();
    const axis = labels.filter((t) => /^\d+$/.test(t)).slice(-6);
    expect(axis).toEqual(['10', '20', '25', '30', '40', '50']);
  });

  test('減少動態：旋轉的移動動畫仍保留（縮短為 250ms），不是瞬移', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/zh-TW/avl-insert/');
    const duration = () =>
      page.evaluate(() => getComputedStyle(document.querySelector('svg g.node') ?? document.body).transitionDuration);

    await page.getByRole('button', { name: 'RR 左旋' }).click();
    await slider(page, '步驟').fill('3');
    expect(await duration()).toBe('0.25s');

    // 實際量測：旋轉那一步，80ms 後節點位置落在起點與終點之間
    const s = slider(page, '步驟');
    let unb = -1;
    for (let i = 0; i < 30 && unb < 0; i++) {
      await s.fill(String(i));
      if (/失衡/.test(await explanation(page).innerText())) unb = i;
    }
    await page.waitForTimeout(500);
    const y20 = () =>
      page.evaluate(() => {
        const g = [...document.querySelectorAll('svg g.node')].find((n) => n.querySelector('text')!.textContent === '20')!;
        return Math.round(g.querySelector('rect')!.getBoundingClientRect().y);
      });
    const before = await y20();
    await s.fill(String(unb + 1));
    await page.waitForTimeout(60);
    const mid = await y20();
    await page.waitForTimeout(500);
    const after = await y20();
    expect(after).toBeLessThan(before);
    expect(mid).toBeLessThan(before);
    expect(mid).toBeGreaterThan(after);
  });

  test('一般偏好：旋轉動畫 450ms', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/zh-TW/avl-insert/');
    await page.getByRole('button', { name: 'RR 左旋' }).click();
    await slider(page, '步驟').fill('3');
    expect(
      await page.evaluate(() => getComputedStyle(document.querySelector('svg g.node')!).transitionDuration),
    ).toBe('0.45s');
  });

  test('其他裝飾性過場在減少動態時仍然停用', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/zh-TW/avl-insert/');
    const d = await page.evaluate(() => getComputedStyle(document.querySelector('h1')!).transitionDuration);
    expect(parseFloat(d)).toBeLessThan(0.001);
    const btn = await page.evaluate(() => getComputedStyle(document.querySelector('.projection-toggle')!).transitionDuration);
    expect(parseFloat(btn)).toBeLessThan(0.001);
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
