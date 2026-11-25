import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { isOpen, subjects } from './subjects';

const topicsDir = path.resolve(__dirname, '../content/topics');

describe('科目資料', () => {
  it('科目 id 不重複，每個科目都有學習地圖', () => {
    expect(new Set(subjects.map((s) => s.id)).size).toBe(subjects.length);
    expect(subjects.filter((s) => !isOpen(s))).toEqual([]);
  });

  for (const s of subjects) {
    it(`${s.title}：章節 id 不重複、編號從 1 連續、每章至少一個單元、先修指向同科目的章節`, () => {
      const ids = s.chapters.map((c) => c.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(s.chapters.map((c) => c.no).sort((a, b) => a - b)).toEqual(s.chapters.map((_, i) => i + 1));
      for (const c of s.chapters) {
        expect(c.units.length, c.title).toBeGreaterThan(0);
        for (const p of c.prereqs) expect(ids, `${c.title} 的先修 ${p}`).toContain(p);
      }
    });
  }

  it('單元的 topic 都有對應的主題內容，而且每個主題只登記一次', () => {
    const topics = subjects.flatMap((s) => s.chapters.flatMap((c) => c.units.flatMap((u) => (u.topic ? [u.topic] : []))));
    expect(new Set(topics).size).toBe(topics.length);
    for (const t of topics) expect(fs.existsSync(path.join(topicsDir, t)), t).toBe(true);
  });
});
