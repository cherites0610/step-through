import { describe, expect, it } from 'vitest';
import {
  chapterStates,
  emptyProgress,
  isMastered,
  parseProgress,
  suggestNext,
  type ChapterInfo,
  type Progress,
} from './progress';

// 1 → 2 → 3，1 → 4；5 沒有檢核項目
const chapters: ChapterInfo[] = [
  { id: 'a', no: 1, prereqs: [], checks: 2 },
  { id: 'b', no: 2, prereqs: ['a'], checks: 1 },
  { id: 'c', no: 3, prereqs: ['b'], checks: 1 },
  { id: 'd', no: 4, prereqs: ['a'], checks: 1 },
  { id: 'e', no: 5, prereqs: [], checks: 0 },
];
const with_ = (chs: Progress['chapters']): Progress => ({ ...emptyProgress(), chapters: chs });

describe('章節狀態', () => {
  it('沒有任何進度：沒有先修的可以開始，其餘建議先讀先修', () => {
    expect(chapterStates('s', chapters, emptyProgress())).toEqual({
      a: 'ready',
      b: 'blocked',
      c: 'blocked',
      d: 'blocked',
      e: 'ready',
    });
  });

  it('檢核每一項都是已掌握才算掌握；先修全部掌握後，後續變成可以開始', () => {
    const half = with_({ 's/a': { checks: { 0: 'mastered', 1: 'partial' } } });
    expect(chapterStates('s', chapters, half).a).toBe('learning');
    expect(chapterStates('s', chapters, half).b).toBe('blocked');

    const done = with_({ 's/a': { checks: { 0: 'mastered', 1: 'mastered' } } });
    const st = chapterStates('s', chapters, done);
    expect(st).toMatchObject({ a: 'mastered', b: 'ready', d: 'ready', c: 'blocked' });
  });

  it('讀過（visited）就是學習中，即使先修還沒掌握', () => {
    expect(chapterStates('s', chapters, with_({ 's/c': { visited: true } })).c).toBe('learning');
  });

  it('沒有檢核項目的章節不會變成已掌握', () => {
    expect(isMastered({ visited: true, checks: {} }, 0)).toBe(false);
    expect(chapterStates('s', chapters, with_({ 's/e': { visited: true } })).e).toBe('learning');
  });

  it('不同科目的進度互不影響', () => {
    const p = with_({ 'other/a': { checks: { 0: 'mastered', 1: 'mastered' } } });
    expect(chapterStates('s', chapters, p).a).toBe('ready');
  });
});

describe('建議下一章', () => {
  it('可以開始的章節中編號最小的', () => {
    expect(suggestNext(chapters, chapterStates('s', chapters, emptyProgress()))?.id).toBe('a');
    const done = with_({ 's/a': { checks: { 0: 'mastered', 1: 'mastered' } } });
    expect(suggestNext(chapters, chapterStates('s', chapters, done))?.id).toBe('b');
  });

  it('沒有可以開始的就接著讀學習中的；全部掌握時沒有建議', () => {
    const only = [chapters[0]];
    expect(suggestNext(only, { a: 'learning' })?.id).toBe('a');
    expect(suggestNext(only, { a: 'mastered' })).toBeUndefined();
  });
});

describe('讀取', () => {
  it('壞掉或舊版的資料當成空的', () => {
    for (const raw of [null, '', '{', '[]', '{"v":2}', '{"v":1}']) expect(parseProgress(raw)).toEqual(emptyProgress());
    const ok = JSON.stringify(with_({ 's/a': { visited: true } }));
    expect(parseProgress(ok).chapters['s/a'].visited).toBe(true);
  });
});
