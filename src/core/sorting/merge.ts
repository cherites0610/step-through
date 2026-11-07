import {
  base,
  range,
  type Frame,
  type MergeNode,
  type MergeView,
  type SortAlgorithm,
  type SortState,
  type SortTrace,
} from './types';

export const mergePseudocode = [
  'mergeSort(lo, hi)',
  '  if lo >= hi: return',
  '  mid = floor((lo + hi) / 2)',
  '  mergeSort(lo, mid)',
  '  mergeSort(mid + 1, hi)',
  '  merge(lo, mid, hi)',
  '    while both halves have numbers',
  '      take the smaller front number',
  '    append what is left',
];

const fmt = (xs: readonly number[]) => `[${xs.join(', ')}]`;

export const mergeSort: SortAlgorithm = (input) => {
  const a = [...input];
  const n = a.length;
  const steps: SortTrace = [];
  let compare = 0;
  let move = 0;
  let maxDepth = 0;
  const stack: Frame[] = [];
  const stats = () => ({ compare, move, depth: maxDepth });

  // 先把整棵遞迴樹的結構建好；之後只更新每個節點的狀態與數值
  const nodes: MergeNode[] = [];
  const build = (lo: number, hi: number, depth: number) => {
    nodes.push({ lo, hi, depth, status: 'hidden', values: a.slice(lo, hi + 1) });
    if (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      build(lo, mid, depth + 1);
      build(mid + 1, hi, depth + 1);
    }
  };
  if (n > 0) {
    build(0, n - 1, 0);
    nodes[0].status = 'open';
  }
  const find = (lo: number, hi: number) => nodes.find((x) => x.lo === lo && x.hi === hi)!;

  const snap = (
    line: number,
    explain: { key: string; params?: Record<string, string | number> },
    highlight: number[] = [],
    merge: MergeView | null = null,
  ) => {
    const state: SortState = {
      ...base([...a]),
      stack: stack.map((f) => ({ ...f })),
      tree: nodes.map((x) => ({ ...x, values: [...x.values] })),
      merge: merge && { ...merge, left: [...merge.left], right: [...merge.right], out: [...merge.out] },
    };
    steps.push({ state, highlight: highlight.map(String), line, explain, stats: stats() });
  };

  snap(0, { key: 'sort.init', params: { n } });

  function sort(lo: number, hi: number) {
    stack.push({ lo, hi });
    maxDepth = Math.max(maxDepth, stack.length);
    const node = find(lo, hi);
    node.status = 'open';

    if (lo === hi) {
      node.status = 'done';
      snap(1, { key: 'merge.leaf', params: { v: a[lo] } }, [lo]);
      stack.pop();
      return;
    }

    const mid = Math.floor((lo + hi) / 2);
    node.status = 'split';
    find(lo, mid).status = 'open';
    find(mid + 1, hi).status = 'open';
    snap(2, { key: 'merge.split', params: { lo, hi, left: mid - lo + 1, right: hi - mid } });

    sort(lo, mid);
    sort(mid + 1, hi);

    // 合併：左右兩半都已排好
    const L = a.slice(lo, mid + 1);
    const R = a.slice(mid + 1, hi + 1);
    node.status = 'merging';
    const out: number[] = [];
    let i = 0;
    let j = 0;
    const view = (took: MergeView['took']): MergeView => ({
      lo,
      mid,
      hi,
      left: L,
      right: R,
      i,
      j,
      out,
      took,
    });
    snap(5, { key: 'merge.begin', params: { l: fmt(L), r: fmt(R) } }, [], view(null));

    while (i < L.length && j < R.length) {
      compare++;
      move++;
      const x = L[i];
      const y = R[j];
      if (x <= y) {
        out.push(x);
        i++;
        snap(7, { key: 'merge.takeLeft', params: { a: x, b: y } }, [], view('left'));
      } else {
        out.push(y);
        j++;
        snap(7, { key: 'merge.takeRight', params: { a: x, b: y } }, [], view('right'));
      }
    }

    if (i < L.length || j < R.length) {
      const fromLeft = i < L.length;
      const rest = fromLeft ? L.slice(i) : R.slice(j);
      out.push(...rest);
      move += rest.length;
      if (fromLeft) i = L.length;
      else j = R.length;
      snap(
        8,
        { key: fromLeft ? 'merge.restLeft' : 'merge.restRight', params: { k: rest.length } },
        [],
        view(fromLeft ? 'left' : 'right'),
      );
    }

    a.splice(lo, out.length, ...out);
    node.status = 'done';
    node.values = [...out];
    snap(5, { key: 'merge.done', params: { lo, hi, v: fmt(out) } }, [], view(null));
    stack.pop();
  }

  if (n > 0) sort(0, n - 1);

  steps.push({
    state: {
      ...base([...a], range(0, n - 1)),
      tree: nodes.map((x) => ({ ...x, values: [...x.values] })),
    },
    highlight: [],
    line: 0,
    explain: { key: 'sort.done' },
    stats: stats(),
  });
  return steps;
};
