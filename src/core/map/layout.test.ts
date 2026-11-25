import { describe, expect, it } from 'vitest';
import { subjects } from '../../data/subjects';
import { assignLayers, defaultLayoutOptions as o, layoutMap, type MapLayout, type MapNodeInput } from './layout';

const ds = subjects.find((s) => s.id === 'data-structures')!.chapters;

/** 每條邊都是直角折線、由上往下，起點在先修節點底部中央、終點在後續節點頂部中央 */
function expectWellFormed(layout: MapLayout, input: MapNodeInput[]) {
  const box = new Map(layout.nodes.map((n) => [n.id, n]));
  expect(layout.edges).toHaveLength(input.reduce((n, x) => n + x.prereqs.length, 0));
  for (const e of layout.edges) {
    const a = box.get(e.from)!;
    const b = box.get(e.to)!;
    expect(e.points[0]).toEqual([a.x + o.nodeWidth / 2, a.y + o.nodeHeight]);
    expect(e.points.at(-1)).toEqual([b.x + o.nodeWidth / 2, b.y]);
    for (let i = 1; i < e.points.length; i++) {
      const [x0, y0] = e.points[i - 1];
      const [x1, y1] = e.points[i];
      expect(x0 === x1 || y0 === y1, `${e.from}→${e.to} 第 ${i} 段不是水平或垂直`).toBe(true);
      expect(y1).toBeGreaterThanOrEqual(y0);
      // 線段不得穿過任何節點的內部
      for (const n of layout.nodes) {
        const inside =
          Math.max(x0, x1) > n.x && Math.min(x0, x1) < n.x + o.nodeWidth &&
          Math.max(y0, y1) > n.y && Math.min(y0, y1) < n.y + o.nodeHeight;
        expect(inside, `${e.from}→${e.to} 穿過節點 ${n.id}`).toBe(false);
      }
    }
  }
  // 同一層的節點不重疊，且保留間距
  for (const ids of layout.layers) {
    const xs = ids.map((id) => box.get(id)!.x).sort((p, q) => p - q);
    for (let i = 1; i < xs.length; i++) expect(xs[i] - xs[i - 1]).toBeGreaterThanOrEqual(o.nodeWidth + o.gapX);
  }
  // 全部在畫布內
  for (const n of layout.nodes) {
    expect(n.x).toBeGreaterThanOrEqual(0);
    expect(n.x + o.nodeWidth).toBeLessThanOrEqual(layout.width + 1e-9);
    expect(n.y + o.nodeHeight).toBeLessThanOrEqual(layout.height);
  }
}

describe('分層', () => {
  it('層＝最長的先修鏈長度', () => {
    const layer = assignLayers(ds);
    const by = (l: number) => ds.filter((c) => layer.get(c.id) === l).map((c) => c.no);
    expect(by(0)).toEqual([1]);
    expect(by(1)).toEqual([2]);
    expect(by(2)).toEqual([3, 4, 10, 11]);
    expect(by(3)).toEqual([5]);
    expect(by(4)).toEqual([6, 7, 9]);
    expect(by(5)).toEqual([8]);
  });

  it('先修不存在或有環時拋出錯誤', () => {
    expect(() => assignLayers([{ id: 'a', prereqs: ['x'] }])).toThrow(/不存在/);
    expect(() =>
      assignLayers([
        { id: 'a', prereqs: ['b'] },
        { id: 'b', prereqs: ['a'] },
      ]),
    ).toThrow(/環/);
  });
});

describe('版面', () => {
  it('資料結構：每條先修都畫成一條邊，邊不穿過節點、節點不重疊', () => {
    expectWellFormed(layoutMap(ds), ds);
  });

  it('跨層的邊（鏈結串列 → 圖）從中間那一層的空隙穿過', () => {
    const layout = layoutMap(ds);
    const e = layout.edges.find((x) => x.from === 'linked-lists' && x.to === 'graphs')!;
    expect(e.points.length).toBeGreaterThan(2);
  });

  it('同一段層間的水平線，不同來源分在不同高度', () => {
    const layout = layoutMap(ds);
    const layerOf = new Map(layout.nodes.map((n) => [n.id, n.layer]));
    const seen = new Map<string, string>(); // y@層 → 來源
    for (const e of layout.edges) {
      for (let i = 1; i < e.points.length; i++) {
        const [x0, y0] = e.points[i - 1];
        const [x1, y1] = e.points[i];
        if (y0 !== y1 || x0 === x1) continue;
        const key = `${y0}`;
        const owner = `${e.from}@${layerOf.get(e.from)}`;
        const prev = seen.get(key);
        // 同一高度只屬於同一個來源（或同一條跨層邊經過的虛擬節點）
        if (prev && prev !== owner) expect(prev.split('@')[0]).toBe(e.from);
        seen.set(key, owner);
      }
    }
  });

  it('各種形狀的圖都排得出來', () => {
    const cases: MapNodeInput[][] = [
      [{ id: 'a', prereqs: [] }],
      [
        { id: 'a', prereqs: [] },
        { id: 'b', prereqs: [] },
        { id: 'c', prereqs: ['a', 'b'] },
      ],
      [
        { id: 'a', prereqs: [] },
        { id: 'b', prereqs: ['a'] },
        { id: 'c', prereqs: ['b'] },
        { id: 'd', prereqs: ['a', 'c'] },
        { id: 'e', prereqs: ['a'] },
      ],
    ];
    for (const input of cases) expectWellFormed(layoutMap(input), input);
  });
});
