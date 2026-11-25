import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { topicPath } from './data/subjects';

const root = path.resolve(__dirname, '..');
const rules = fs
  .readFileSync(path.join(root, 'public/_redirects'), 'utf8')
  .split('\n')
  .filter((l) => l.trim() && !l.startsWith('#'))
  .map((l) => l.trim().split(/\s+/));
const topics = fs
  .readdirSync(path.join(root, 'src/content/topics'), { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name);
/** Cloudflare Pages 依檔案順序取第一條符合的規則 */
const target = (from: string) => rules.find(([f]) => f === from);

describe('public/_redirects', () => {
  for (const t of topics) {
    it(`v1 的 /zh-TW/${t}/ 與 /en/${t}/ 都 301 到新網址`, () => {
      const to = topicPath('zh-TW', t);
      for (const from of [`/zh-TW/${t}/`, `/zh-TW/${t}`, `/en/${t}/`]) expect(target(from), from).toEqual([from, to, '301']);
    });
  }
  it('英文的萬用規則在個別規則之後', () => {
    const splat = rules.findIndex(([f]) => f === '/en/*');
    const last = Math.max(...topics.map((t) => rules.findIndex(([f]) => f === `/en/${t}/`)));
    expect(splat).toBeGreaterThan(last);
  });
});
