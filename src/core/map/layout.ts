/**
 * 科目地圖的版面：把「章節 + 先修」這張有向無環圖排成由上往下的分層圖。
 * 純函式、與框架無關，建置時計算座標後輸出成靜態 SVG。
 *
 * 1. 分層：每個節點的層 = 最長的先修鏈長度（同一層的章節可以平行讀）。
 * 2. 跨層的邊插入虛擬節點，讓每條邊只連相鄰兩層。
 * 3. 層內順序：上下來回以重心（barycenter）排序，減少交叉。
 * 4. 水平位置：盡量對齊上一層的先修，再推開重疊、置中。
 * 5. 邊的路徑：直角折線；兩層之間的水平段依來源分到不同高度，不會互相重疊。
 */

export type MapNodeInput = { id: string; prereqs: string[] };

export type LayoutOptions = {
  nodeWidth: number;
  nodeHeight: number;
  /** 同層節點之間的最小水平間距 */
  gapX: number;
  /** 層與層之間的垂直間距（邊的水平段走在這裡） */
  gapY: number;
};

export type PlacedNode = { id: string; layer: number; x: number; y: number };
export type RoutedEdge = { from: string; to: string; points: [number, number][] };
export type MapLayout = {
  width: number;
  height: number;
  layers: string[][];
  nodes: PlacedNode[];
  edges: RoutedEdge[];
};

export const defaultLayoutOptions: LayoutOptions = { nodeWidth: 168, nodeHeight: 64, gapX: 32, gapY: 64 };

type Slot = { key: string; real: boolean };

/** 每個節點的層（0 起算）。先修不存在或有環時拋出錯誤。 */
export function assignLayers(nodes: MapNodeInput[]): Map<string, number> {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  for (const n of nodes)
    for (const p of n.prereqs) if (!byId.has(p)) throw new Error(`「${n.id}」的先修「${p}」不存在`);

  const layer = new Map<string, number>();
  const visiting = new Set<string>();
  const visit = (id: string): number => {
    const known = layer.get(id);
    if (known !== undefined) return known;
    if (visiting.has(id)) throw new Error(`先修關係有環：經過「${id}」`);
    visiting.add(id);
    const l = Math.max(-1, ...byId.get(id)!.prereqs.map(visit)) + 1;
    visiting.delete(id);
    layer.set(id, l);
    return l;
  };
  nodes.forEach((n) => visit(n.id));
  return layer;
}

export function layoutMap(nodes: MapNodeInput[], options: Partial<LayoutOptions> = {}): MapLayout {
  const o = { ...defaultLayoutOptions, ...options };
  const layerOf = assignLayers(nodes);
  const depth = Math.max(0, ...layerOf.values()) + 1;

  // 各層的格位（含虛擬節點），以及相鄰兩層之間的連線（以格位 key 表示）
  const slots: Slot[][] = Array.from({ length: depth }, () => []);
  nodes.forEach((n) => slots[layerOf.get(n.id)!].push({ key: n.id, real: true }));
  const links: [string, string][] = [];
  const chains: { from: string; to: string; keys: string[] }[] = [];
  for (const n of nodes) {
    for (const p of n.prereqs) {
      const keys = [p];
      for (let l = layerOf.get(p)! + 1; l < layerOf.get(n.id)!; l++) {
        const key = `${p}->${n.id}@${l}`;
        slots[l].push({ key, real: false });
        keys.push(key);
      }
      keys.push(n.id);
      for (let i = 0; i + 1 < keys.length; i++) links.push([keys[i], keys[i + 1]]);
      chains.push({ from: p, to: n.id, keys });
    }
  }
  const up = new Map<string, string[]>();
  const down = new Map<string, string[]>();
  for (const [a, b] of links) {
    up.set(b, [...(up.get(b) ?? []), a]);
    down.set(a, [...(down.get(a) ?? []), b]);
  }

  // 層內順序：上下來回各數次，依相鄰層的平均位置排序（穩定排序，平手維持原順序）
  const order = new Map<string, number>();
  const reindex = (l: number) => slots[l].forEach((s, i) => order.set(s.key, i));
  slots.forEach((_, l) => reindex(l));
  const sweep = (l: number, neighbours: Map<string, string[]>) => {
    const bary = (s: Slot) => {
      const ns = neighbours.get(s.key) ?? [];
      return ns.length ? ns.reduce((sum, k) => sum + order.get(k)!, 0) / ns.length : order.get(s.key)!;
    };
    const scored = slots[l].map((s) => ({ s, b: bary(s) }));
    scored.sort((a, b) => a.b - b.b);
    slots[l] = scored.map((x) => x.s);
    reindex(l);
  };
  for (let round = 0; round < 4; round++) {
    for (let l = 1; l < depth; l++) sweep(l, up);
    for (let l = depth - 2; l >= 0; l--) sweep(l, down);
  }

  // 水平位置（中心點）：對齊相鄰層的平均位置，推開重疊後以期望位置的平均置中
  const width = (s: Slot) => (s.real ? o.nodeWidth : 0);
  const minDist = (a: Slot, b: Slot) => (width(a) + width(b)) / 2 + o.gapX;
  const cx = new Map<string, number>();
  const place = (l: number, desired: number[]) => {
    const row = slots[l];
    const xs = [...desired];
    for (let i = 1; i < row.length; i++) xs[i] = Math.max(xs[i], xs[i - 1] + minDist(row[i - 1], row[i]));
    const shift = desired.reduce((a, b) => a + b, 0) / desired.length - xs.reduce((a, b) => a + b, 0) / xs.length;
    row.forEach((s, i) => cx.set(s.key, xs[i] + shift));
  };
  const desiredFrom = (l: number, neighbours: Map<string, string[]>) =>
    slots[l].map((s) => {
      const ns = (neighbours.get(s.key) ?? []).filter((k) => cx.has(k));
      return ns.length ? ns.reduce((sum, k) => sum + cx.get(k)!, 0) / ns.length : (cx.get(s.key) ?? 0);
    });
  place(0, slots[0].map(() => 0));
  for (let l = 1; l < depth; l++) place(l, desiredFrom(l, up));
  // 由下往上再修一次，讓只有一個後續的節點對齊它的後續
  for (let l = depth - 2; l >= 0; l--) place(l, desiredFrom(l, down));
  for (let l = 1; l < depth; l++) place(l, desiredFrom(l, up));

  const minX = Math.min(...slots.flatMap((row) => row.map((s) => cx.get(s.key)! - width(s) / 2)));
  const maxX = Math.max(...slots.flatMap((row) => row.map((s) => cx.get(s.key)! + width(s) / 2)));
  const top = (l: number) => l * (o.nodeHeight + o.gapY);
  const X = (key: string) => cx.get(key)! - minX;

  const placed: PlacedNode[] = nodes.map((n) => ({
    id: n.id,
    layer: layerOf.get(n.id)!,
    x: X(n.id) - o.nodeWidth / 2,
    y: top(layerOf.get(n.id)!),
  }));

  // 兩層之間的水平段高度：依來源由左到右分配，不同來源不會疊在同一條線上
  const channelY = new Map<string, number>();
  for (let l = 0; l + 1 < depth; l++) {
    const sources = slots[l].filter((s) => (down.get(s.key) ?? []).length > 0);
    sources.forEach((s, i) =>
      channelY.set(s.key, top(l) + o.nodeHeight + (o.gapY * (i + 1)) / (sources.length + 1)),
    );
  }

  const edges: RoutedEdge[] = chains.map(({ from, to, keys }) => {
    const pts: [number, number][] = [[X(from), top(layerOf.get(from)!) + o.nodeHeight]];
    for (let i = 0; i + 1 < keys.length; i++) {
      const a = keys[i];
      const b = keys[i + 1];
      const yc = channelY.get(a)!;
      const lb = layerOf.get(from)! + i + 1;
      pts.push([X(a), yc], [X(b), yc]);
      // 經過虛擬節點時直直穿過那一層
      pts.push([X(b), b === to ? top(lb) : top(lb) + o.nodeHeight]);
    }
    return { from, to, points: simplify(pts) };
  });

  return {
    width: maxX - minX,
    height: top(depth - 1) + o.nodeHeight,
    layers: slots.map((row) => row.filter((s) => s.real).map((s) => s.key)),
    nodes: placed,
    edges,
  };
}

/** 去掉重複點與共線的中間點 */
function simplify(points: [number, number][]): [number, number][] {
  const out: [number, number][] = [];
  for (const p of points) {
    const last = out[out.length - 1];
    if (last && last[0] === p[0] && last[1] === p[1]) continue;
    const prev = out[out.length - 2];
    if (prev && last && ((prev[0] === last[0] && last[0] === p[0]) || (prev[1] === last[1] && last[1] === p[1]))) {
      out[out.length - 1] = p;
      continue;
    }
    out.push(p);
  }
  return out;
}
