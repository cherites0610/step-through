import { describe, expect, it } from 'vitest';
import { choosePivotIndex, quickSort } from './quick';
import { balancedForQuick, presets } from './input';
import type { PivotStrategy } from './types';

const strategies: PivotStrategy[] = ['first', 'last', 'median'];
const sortedCopy = (xs: number[]) => [...xs].sort((a, b) => a - b);

/** 固定種子的亂數，讓測試可重現 */
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

describe('quickSort', () => {
  for (const strategy of strategies) {
    it(`${strategy}：任意輸入最後都排好，且每一步都是原資料的排列`, () => {
      const rand = rng(7);
      for (let t = 0; t < 200; t++) {
        const n = 1 + Math.floor(rand() * 12);
        const input = Array.from({ length: n }, () => Math.floor(rand() * 20)); // 含大量重複
        const trace = quickSort(input, { pivot: strategy });
        const final = trace[trace.length - 1].state;
        expect(final.arr).toEqual(sortedCopy(input));
        expect(final.sorted).toHaveLength(n);
        expect(final.stack).toEqual([]);
        for (const s of trace) expect(sortedCopy(s.state.arr)).toEqual(sortedCopy(input));
      }
    });
  }

  it('已標記為最終位置的索引，其值確實等於排好後的值', () => {
    const input = [9, 3, 7, 1, 8, 2, 5];
    const expected = sortedCopy(input);
    for (const strategy of strategies) {
      for (const s of quickSort(input, { pivot: strategy })) {
        for (const idx of s.state.sorted) expect(s.state.arr[idx]).toBe(expected[idx]);
      }
    }
  });

  it('已排序輸入 + 尾基準 = 最差情況：n(n-1)/2 次比較、遞迴深度 n、無交換', () => {
    const n = 8;
    const stats = quickSort(presets.best(n), { pivot: 'last' }).at(-1)!.stats!;
    expect(stats.compare).toBe((n * (n - 1)) / 2);
    expect(stats.depth).toBe(n);
    expect(stats.swap).toBe(0);
  });

  it('已排序輸入 + 首基準 同樣是最差情況：比較次數 n(n-1)/2', () => {
    const n = 8;
    const stats = quickSort(presets.best(n), { pivot: 'first' }).at(-1)!.stats!;
    expect(stats.compare).toBe((n * (n - 1)) / 2);
  });

  it('已排序輸入用三數取中，比較次數與遞迴深度都遠小於尾基準', () => {
    const n = 8;
    const worst = quickSort(presets.best(n), { pivot: 'last' }).at(-1)!.stats!;
    const median = quickSort(presets.best(n), { pivot: 'median' }).at(-1)!.stats!;
    expect(median.compare).toBeLessThan(worst.compare);
    expect(median.depth).toBeLessThan(worst.depth);
  });

  it('平衡分割預設（尾基準）：每次都對半切，n=7 時深度 3、比較 10 次，只在放定基準時交換 3 次', () => {
    const stats = quickSort(balancedForQuick(7), { pivot: 'last' }).at(-1)!.stats!;
    expect(stats.depth).toBe(3);
    expect(stats.compare).toBe(6 + 2 + 2);
    expect(stats.swap).toBe(3);
  });

  it('平衡分割的比較次數遠少於已排序（最差）輸入', () => {
    const balanced = quickSort(balancedForQuick(8), { pivot: 'last' }).at(-1)!.stats!;
    const worst = quickSort(presets.best(8), { pivot: 'last' }).at(-1)!.stats!;
    expect(balanced.compare).toBeLessThan(worst.compare);
    expect(balanced.depth).toBeLessThan(worst.depth);
  });

  it('每一步的呼叫堆疊頂端與目前處理的區間一致', () => {
    const trace = quickSort([5, 2, 9, 1, 7, 3], { pivot: 'median' });
    for (const s of trace) {
      const top = s.state.stack.at(-1);
      if (s.state.range) expect(top && [top.lo, top.hi]).toEqual(s.state.range);
    }
  });

  it('單一元素與空輸入', () => {
    expect(quickSort([4]).at(-1)!.state.arr).toEqual([4]);
    expect(quickSort([]).at(-1)!.state.arr).toEqual([]);
  });
});

describe('choosePivotIndex', () => {
  it('首、尾直接取端點', () => {
    expect(choosePivotIndex([5, 1, 9], 0, 2, 'first')).toBe(0);
    expect(choosePivotIndex([5, 1, 9], 0, 2, 'last')).toBe(2);
  });

  it('三數取中取首、中、尾的中位數', () => {
    expect(choosePivotIndex([5, 1, 9], 0, 2, 'median')).toBe(0); // 5
    expect(choosePivotIndex([1, 9, 5], 0, 2, 'median')).toBe(2); // 5
    expect(choosePivotIndex([1, 5, 9], 0, 2, 'median')).toBe(1); // 5
  });

  it('數值相同時結果確定', () => {
    expect(choosePivotIndex([3, 3, 3], 0, 2, 'median')).toBe(1);
  });
});

describe('平衡分割預設的遞迴深度', () => {
  it('n 個數字剛好對半切時深度為 ⌈log2(n + 1)⌉', () => {
    for (const n of [3, 7, 8, 12, 15]) {
      const stats = quickSort(balancedForQuick(n), { pivot: 'last' }).at(-1)!.stats!;
      expect(stats.depth).toBe(Math.ceil(Math.log2(n + 1)));
    }
  });
});
