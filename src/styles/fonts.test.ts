import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildCss, isCjkSlice } from '../../scripts/subset-fonts.mjs';

const root = path.resolve(__dirname, '../..');
const fontsCss = fs.readFileSync(path.join(root, 'src/styles/fonts.css'), 'utf8').replace(/\r\n/g, '\n');

describe('字體 CSS（pnpm fonts 產生）', () => {
  it('與目前的原始碼一致；不一致時請執行 pnpm fonts', () => {
    expect(fontsCss).toBe(buildCss().css);
  });

  it('不含任何中文切片：中文刻意用系統字體（否則一頁要下載約 800 KB 字體、效能掉到 63 分）', () => {
    const labels = [...fontsCss.matchAll(/\/\* ([^*]+) \*\//g)].map((m) => m[1].trim());
    expect(labels.length).toBeGreaterThan(0);
    for (const label of labels) expect(isCjkSlice(label)).toBe(false);
    expect(fontsCss.length).toBeLessThan(10_000);
  });

  it('只含 woff2，且每個 woff2 檔案都存在', () => {
    const urls = [...fontsCss.matchAll(/url\(([^)]+)\)/g)].map((m) => m[1]);
    expect(urls.length).toBeGreaterThan(0);
    for (const url of urls) {
      expect(url.endsWith('.woff2')).toBe(true);
      expect(fs.existsSync(path.resolve(root, 'src/styles', url))).toBe(true);
    }
  });

  it('字體堆疊明確列出系統繁體中文字體，並且不重複', () => {
    const css = fs.readFileSync(path.join(root, 'src/styles/global.css'), 'utf8');
    const stack = css.match(/--font-sans:\s*([^;]+);/)![1];
    for (const f of ['PingFang TC', 'Microsoft JhengHei', 'Noto Sans CJK TC', 'system-ui']) expect(stack).toContain(f);
    const names = stack.split(',').map((s) => s.trim());
    expect(new Set(names).size).toBe(names.length);
  });
});
