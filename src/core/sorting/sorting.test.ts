import { describe, expect, it } from 'vitest';
import { bubbleSort } from './bubble';
import { insertionSort } from './insertion';
import { selectionSort } from './selection';
import { parseInput, presets } from './input';
import type { SortAlgorithm } from './types';

const algorithms: [string, SortAlgorithm][] = [
  ['insertion', insertionSort],
  ['bubble', bubbleSort],
  ['selection', selectionSort],
];

const cases: number[][] = [[], [5], [1, 2, 3, 4], [4, 3, 2, 1], [3, 1, 2, 3, 1], [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]];

describe.each(algorithms)('%s sort trace', (_name, sort) => {
  it.each(cases)('最終狀態已排序且全部標記為已定位：%j', (...input) => {
    const steps = sort(input);
    const last = steps[steps.length - 1];
    expect(last.state.arr).toEqual([...input].sort((x, y) => x - y));
    expect(last.state.sorted.slice().sort((x, y) => x - y)).toEqual(input.map((_, i) => i));
  });

  it('不修改輸入、每步快照互相獨立', () => {
    const input = [3, 1, 2];
    const steps = sort(input);
    expect(input).toEqual([3, 1, 2]);
    expect(steps[0].state.arr).toEqual([3, 1, 2]);
    expect(steps[0].state.arr).not.toBe(steps[1].state.arr);
  });

  it('統計值只增不減，且 highlight 都在範圍內', () => {
    const input = [5, 2, 4, 6, 1, 3];
    const steps = sort(input);
    let prev = 0;
    for (const s of steps) {
      const total = Object.values(s.stats ?? {}).reduce((x, y) => x + y, 0);
      expect(total).toBeGreaterThanOrEqual(prev);
      prev = total;
      for (const h of s.highlight) expect(+h).toBeGreaterThanOrEqual(0);
      for (const h of s.highlight) expect(+h).toBeLessThan(input.length);
    }
  });
});

describe('插入排序', () => {
  it('最佳情況（已排序）比較 n-1 次、位移 0 次', () => {
    const s = insertionSort(presets.best(8)).at(-1)!.stats!;
    expect(s).toEqual({ compare: 7, shift: 0 });
  });

  it('最差情況（反序）比較與位移皆為 n(n-1)/2', () => {
    const s = insertionSort(presets.worst(8)).at(-1)!.stats!;
    expect(s).toEqual({ compare: 28, shift: 28 });
  });

  it('位移過程中 hole 與 key 有值，放入後清除', () => {
    const steps = insertionSort([2, 1]);
    const shifting = steps.find((s) => s.explain.key === 'insertion.shift')!;
    expect(shifting.state).toMatchObject({ key: 1, hole: 0 });
    expect(steps.at(-1)!.state).toMatchObject({ key: null, hole: null });
  });
});

describe('氣泡排序', () => {
  it('已排序時只跑一趟就提早結束', () => {
    const steps = bubbleSort(presets.best(8));
    expect(steps.at(-1)!.stats).toEqual({ compare: 7, swap: 0 });
    expect(steps.at(-1)!.explain.key).toBe('bubble.earlyExit');
  });

  it('反序時交換 n(n-1)/2 次', () => {
    expect(bubbleSort(presets.worst(8)).at(-1)!.stats).toMatchObject({ swap: 28 });
  });
});

describe('選擇排序', () => {
  it('不論資料如何，比較次數都是 n(n-1)/2', () => {
    for (const input of [presets.best(8), presets.worst(8), [5, 3, 8, 1, 9, 2, 7, 4]]) {
      expect(selectionSort(input).at(-1)!.stats!.compare).toBe(28);
    }
  });

  it('交換次數最多 n-1', () => {
    expect(selectionSort(presets.worst(8)).at(-1)!.stats!.swap).toBeLessThanOrEqual(7);
  });
});

describe('parseInput', () => {
  it('接受逗號、頓號與空白分隔', () => {
    expect(parseInput('5, 3，8、1 2')).toEqual({ ok: true, values: [5, 3, 8, 1, 2] });
  });
  it('回報各種錯誤', () => {
    expect(parseInput('  ')).toEqual({ ok: false, error: 'empty' });
    expect(parseInput('1,a')).toEqual({ ok: false, error: 'notInteger' });
    expect(parseInput('1.5')).toEqual({ ok: false, error: 'notInteger' });
    expect(parseInput('100')).toEqual({ ok: false, error: 'outOfRange' });
    expect(parseInput('-1')).toEqual({ ok: false, error: 'outOfRange' });
    expect(parseInput(Array(13).fill(1).join(','))).toEqual({ ok: false, error: 'tooMany' });
  });
});
