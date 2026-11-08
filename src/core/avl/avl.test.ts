import { describe, expect, it } from 'vitest';
import { avlInsertAll } from './avl';
import { avlPresets } from './presets';
import { balanceFactor, depthOf, emptyHeight, inorder, type AvlNode, type AvlTrace } from './types';

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

/** 檢查一棵樹是合法的 AVL：搜尋樹順序、記錄的高度正確、每個節點平衡因子在 -1..1。 */
function assertValidAvl(root: AvlNode | null) {
  const values = inorder(root).map((n) => n.value);
  expect(values).toEqual([...values].sort((a, b) => a - b));
  expect(new Set(values).size).toBe(values.length);
  const check = (n: AvlNode | null): number => {
    if (!n) return 0;
    const hl = check(n.left);
    const hr = check(n.right);
    expect(n.height).toBe(1 + Math.max(hl, hr));
    expect(Math.abs(hl - hr)).toBeLessThanOrEqual(1);
    expect(Math.abs(balanceFactor(n))).toBeLessThanOrEqual(1);
    return n.height;
  };
  check(root);
}

/** 每次插入的最後一步（下一次插入開始之前的那一步）。 */
function endOfEachInsert(trace: AvlTrace) {
  const byIndex = new Map<number, AvlTrace[number]>();
  for (const s of trace) if (s.state.index > 0) byIndex.set(s.state.index, s);
  return [...byIndex.entries()].sort((a, b) => a[0] - b[0]).map(([, s]) => s);
}

describe('avlInsertAll', () => {
  it('每次插入結束時都是合法的 AVL，且中序等於目前插入過的不重複數字', () => {
    const rand = rng(21);
    for (let t = 0; t < 300; t++) {
      const n = 1 + Math.floor(rand() * 12);
      const input = Array.from({ length: n }, () => Math.floor(rand() * 30)); // 含重複
      const trace = avlInsertAll(input);
      const ends = endOfEachInsert(trace);
      expect(ends).toHaveLength(n);
      ends.forEach((s, i) => {
        assertValidAvl(s.state.root);
        const expected = [...new Set(input.slice(0, i + 1))].sort((a, b) => a - b);
        expect(inorder(s.state.root).map((x) => x.value)).toEqual(expected);
      });
      assertValidAvl(trace.at(-1)!.state.root);
    }
  });

  it('四種預設各自觸發對應的失衡情況，且旋轉後根都是 20', () => {
    for (const kind of ['LL', 'RR', 'LR', 'RL'] as const) {
      const trace = avlInsertAll(avlPresets[kind]);
      const kinds = trace.map((s) => s.state.unbalanced?.kind).filter(Boolean);
      expect(kinds).toEqual([kind]);
      const final = trace.at(-1)!.state.root!;
      expect(final.value).toBe(20);
      expect(final.left!.value).toBe(10);
      expect(final.right!.value).toBe(30);
      expect(final.height).toBe(2);
    }
  });

  it('單旋轉算 1 次、雙旋轉算 2 次', () => {
    expect(avlInsertAll(avlPresets.LL).at(-1)!.stats!.rotate).toBe(1);
    expect(avlInsertAll(avlPresets.RR).at(-1)!.stats!.rotate).toBe(1);
    expect(avlInsertAll(avlPresets.LR).at(-1)!.stats!.rotate).toBe(2);
    expect(avlInsertAll(avlPresets.RL).at(-1)!.stats!.rotate).toBe(2);
  });

  it('連續遞增 7 個數字：AVL 保持完美平衡，樹高 3、根是 40', () => {
    const trace = avlInsertAll(avlPresets.ascending);
    const final = trace.at(-1)!.state.root!;
    expect(final.value).toBe(40);
    expect(final.height).toBe(3);
    expect(depthOf(final)).toBe(3);
    assertValidAvl(final);
  });

  it('一次插入最多旋轉 2 個動作（單旋 1、雙旋 2），而且只會失衡一次', () => {
    const rand = rng(5);
    for (let t = 0; t < 200; t++) {
      const n = 2 + Math.floor(rand() * 11);
      const input = Array.from({ length: n }, () => Math.floor(rand() * 40));
      const trace = avlInsertAll(input);
      const perInsert = new Map<number, number>();
      for (const s of trace) if (s.state.unbalanced) perInsert.set(s.state.index, (perInsert.get(s.state.index) ?? 0) + 1);
      for (const c of perInsert.values()) expect(c).toBe(1);
    }
  });

  it('重複的數字會被略過，不改變樹', () => {
    const trace = avlInsertAll([5, 3, 5, 3, 8]);
    const dupSteps = trace.filter((s) => s.explain.key === 'avl.dup');
    expect(dupSteps).toHaveLength(2);
    expect(inorder(trace.at(-1)!.state.root).map((n) => n.value)).toEqual([3, 5, 8]);
    expect(trace.at(-1)!.explain.params!.n).toBe(3);
  });

  it('節點 id 在整條軌跡中固定對應同一個數值（旋轉只換位置，不換身分）', () => {
    const trace = avlInsertAll([50, 30, 70, 20, 40, 10, 25, 5, 1]);
    const valueOf = new Map<number, number>();
    for (const s of trace) {
      for (const n of inorder(s.state.root)) {
        if (valueOf.has(n.id)) expect(valueOf.get(n.id)).toBe(n.value);
        else valueOf.set(n.id, n.value);
      }
    }
    expect(valueOf.size).toBe(9);
  });

  it('旋轉不改變中序順序（相鄰兩步的中序只會多出新插入的那個值）', () => {
    const trace = avlInsertAll([10, 20, 30, 40, 50, 25]);
    for (let i = 1; i < trace.length; i++) {
      const a = inorder(trace[i - 1].state.root).map((n) => n.value);
      const b = inorder(trace[i].state.root).map((n) => n.value);
      if (b.length === a.length) expect(b).toEqual(a);
      else {
        expect(b.length).toBe(a.length + 1);
        expect(b.filter((x) => !a.includes(x))).toHaveLength(1);
      }
    }
  });

  it('樹高不超過 1.44·log2(n + 2)（AVL 的理論上界）', () => {
    const rand = rng(77);
    for (let t = 0; t < 100; t++) {
      const n = 1 + Math.floor(rand() * 12);
      const input = Array.from({ length: n }, (_, i) => i); // 遞增：一般 BST 的最差情況
      const root = avlInsertAll(input).at(-1)!.state.root;
      expect(emptyHeight(root)).toBeLessThanOrEqual(1.4405 * Math.log2(n + 2));
    }
  });

  it('空輸入與單一數字', () => {
    expect(avlInsertAll([]).at(-1)!.state.root).toBeNull();
    const one = avlInsertAll([7]).at(-1)!.state.root!;
    expect(one.value).toBe(7);
    expect(one.height).toBe(1);
  });

  it('比較次數：沿途每個節點比一次', () => {
    const stats = avlInsertAll([20, 10, 30]).at(-1)!.stats!;
    expect(stats.compare).toBe(1 + 1); // 10 比 20 一次；30 比 20 一次
    expect(avlInsertAll(avlPresets.ascending).at(-1)!.stats!.compare).toBeGreaterThan(0);
  });
});
