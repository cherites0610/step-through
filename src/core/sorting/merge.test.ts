import { describe, expect, it } from 'vitest';
import { mergeSort } from './merge';

const sortedCopy = (xs: number[]) => [...xs].sort((a, b) => a - b);

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

describe('mergeSort', () => {
  it('任意輸入最後都排好，樹根為 done、堆疊為空、沒有進行中的合併', () => {
    const rand = rng(11);
    for (let t = 0; t < 200; t++) {
      const n = 1 + Math.floor(rand() * 12);
      const input = Array.from({ length: n }, () => Math.floor(rand() * 20));
      const final = mergeSort(input).at(-1)!.state;
      expect(final.arr).toEqual(sortedCopy(input));
      expect(final.tree[0].status).toBe('done');
      expect(final.tree[0].values).toEqual(sortedCopy(input));
      expect(final.stack).toEqual([]);
      expect(final.merge).toBeNull();
    }
  });

  it('遞迴樹的節點數為 2n - 1，且每個 done 節點的值都已排序', () => {
    const input = [38, 27, 43, 3, 9, 82, 10];
    const trace = mergeSort(input);
    expect(trace[0].state.tree).toHaveLength(2 * input.length - 1);
    for (const s of trace) {
      for (const node of s.state.tree) {
        if (node.status === 'done') expect(node.values).toEqual(sortedCopy(node.values));
      }
    }
  });

  it('比較與寫入次數不超過 n⌈log2 n⌉', () => {
    const rand = rng(3);
    for (let t = 0; t < 100; t++) {
      const n = 2 + Math.floor(rand() * 11);
      const input = Array.from({ length: n }, () => Math.floor(rand() * 50));
      const stats = mergeSort(input).at(-1)!.stats!;
      const bound = n * Math.ceil(Math.log2(n));
      expect(stats.compare).toBeLessThanOrEqual(bound);
      expect(stats.move).toBeLessThanOrEqual(bound);
    }
  });

  it('遞迴最大深度為 ⌈log2 n⌉ + 1', () => {
    for (const n of [1, 2, 3, 7, 8, 12]) {
      const stats = mergeSort(Array.from({ length: n }, (_, i) => n - i)).at(-1)!.stats!;
      expect(stats.depth).toBe(Math.ceil(Math.log2(n)) + 1);
    }
  });

  it('穩定：比較到相等的值時一律取左邊', () => {
    const trace = mergeSort([2, 2, 1, 2]);
    const equalTakes = (key: string) =>
      trace.filter((s) => s.explain.key === key && s.explain.params?.a === s.explain.params?.b);
    expect(equalTakes('merge.takeLeft').length).toBeGreaterThan(0);
    expect(equalTakes('merge.takeRight')).toHaveLength(0);
  });

  it('合併過程：out 一直是排好的，完成時長度等於區間長度', () => {
    const trace = mergeSort([4, 1, 3, 2]);
    for (const s of trace) {
      const m = s.state.merge;
      if (!m) continue;
      expect(m.out.length).toBeLessThanOrEqual(m.hi - m.lo + 1);
      expect(m.out).toEqual(sortedCopy(m.out));
    }
    for (const s of trace.filter((x) => x.explain.key === 'merge.done')) {
      expect(s.state.merge!.out.length).toBe(s.state.merge!.hi - s.state.merge!.lo + 1);
    }
  });

  it('單一元素與空輸入', () => {
    expect(mergeSort([4]).at(-1)!.state.arr).toEqual([4]);
    expect(mergeSort([]).at(-1)!.state.arr).toEqual([]);
  });
});
