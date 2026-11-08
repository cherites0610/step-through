import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = path.resolve(__dirname, '..');
const topicsDir = path.join(root, 'src/content/topics');

/** 內容資料夾裡的所有（語系, 主題）組合 */
const pairs: [string, string][] = fs
  .readdirSync(topicsDir, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .flatMap((dir) =>
    fs
      .readdirSync(path.join(topicsDir, dir.name))
      .filter((f) => f.endsWith('.mdx'))
      .map((f): [string, string] => [f.replace(/\.mdx$/, ''), dir.name]),
  );

/** 讀 PNG 檔頭的寬高（IHDR） */
function pngSize(file: string) {
  const buf = fs.readFileSync(file);
  expect(buf.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20), bytes: buf.length };
}

describe('Open Graph 圖（pnpm build && pnpm og 產生）', () => {
  it('有主題內容', () => {
    expect(pairs.length).toBeGreaterThanOrEqual(12);
  });

  for (const [lang, topic] of pairs) {
    it(`${lang}/${topic}.png 存在、是 1200×630、大小合理`, () => {
      const file = path.join(root, 'public/og', lang, `${topic}.png`);
      expect(fs.existsSync(file), `缺少 ${path.relative(root, file)}，請執行 pnpm build && pnpm og`).toBe(true);
      const { width, height, bytes } = pngSize(file);
      expect([width, height]).toEqual([1200, 630]);
      expect(bytes).toBeGreaterThan(5_000);
      expect(bytes).toBeLessThan(400_000);
    });
  }

  for (const lang of ['zh-TW', 'en']) {
    it(`${lang}/home.png 存在、是 1200×630`, () => {
      const { width, height } = pngSize(path.join(root, 'public/og', lang, 'home.png'));
      expect([width, height]).toEqual([1200, 630]);
    });
  }
});
