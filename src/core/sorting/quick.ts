import {
  base,
  range,
  type Frame,
  type PivotStrategy,
  type SortAlgorithm,
  type SortState,
  type SortTrace,
} from './types';

export const quickPseudocode = [
  'quickSort(lo, hi)',
  '  if lo >= hi: return',
  '  p = choosePivot(lo, hi)',
  '  swap(A[p], A[hi])',
  '  pivot = A[hi]; i = lo',
  '  for j = lo to hi - 1',
  '    if A[j] < pivot',
  '      swap(A[i], A[j]); i = i + 1',
  '  swap(A[i], A[hi])',
  '  quickSort(lo, i - 1)',
  '  quickSort(i + 1, hi)',
];

/**
 * 依策略挑基準的索引。三數取中：取首、中、尾三個數字的中位數；
 * 數值相同時以索引順序決勝，結果才是確定的。
 */
export function choosePivotIndex(
  a: readonly number[],
  lo: number,
  hi: number,
  strategy: PivotStrategy,
): number {
  if (strategy === 'first') return lo;
  if (strategy === 'last') return hi;
  const mid = lo + Math.floor((hi - lo) / 2);
  return [lo, mid, hi].sort((x, y) => a[x] - a[y] || x - y)[1];
}

export const quickSort: SortAlgorithm = (input, options = {}) => {
  const strategy = options.pivot ?? 'last';
  const a = [...input];
  const n = a.length;
  const steps: SortTrace = [];
  let compare = 0;
  let swap = 0;
  let maxDepth = 0;
  const sorted = new Set<number>();
  const stack: Frame[] = [];
  const stats = () => ({ compare, swap, depth: maxDepth });

  const snap = (
    extra: Partial<SortState>,
    highlight: number[],
    line: number,
    explain: { key: string; params?: Record<string, string | number> },
  ) => {
    steps.push({
      state: {
        ...base([...a], [...sorted].sort((x, y) => x - y)),
        stack: stack.map((f) => ({ ...f })),
        ...extra,
      },
      highlight: highlight.map(String),
      line,
      explain,
      stats: stats(),
    });
  };

  const exchange = (x: number, y: number) => {
    if (x === y) return false;
    [a[x], a[y]] = [a[y], a[x]];
    swap++;
    return true;
  };

  snap({}, [], 0, { key: 'sort.init', params: { n } });

  function sort(lo: number, hi: number, callerLine: number) {
    stack.push({ lo, hi });
    maxDepth = Math.max(maxDepth, stack.length);
    const rng: [number, number] = [lo, hi];

    if (lo === hi) {
      sorted.add(lo);
      snap({ range: rng }, [lo], 1, { key: 'quick.single', params: { v: a[lo], at: lo } });
      stack.pop();
      return;
    }

    snap({ range: rng }, [], callerLine, {
      key: 'quick.enter',
      params: { lo, hi, size: hi - lo + 1 },
    });

    // 挑基準
    const pi = choosePivotIndex(a, lo, hi, strategy);
    const mid = lo + Math.floor((hi - lo) / 2);
    snap({ range: rng, pivot: pi }, [pi], 2, {
      key: `quick.choose.${strategy}`,
      params: { v: a[pi], at: pi, a: a[lo], b: a[mid], c: a[hi] },
    });

    // 先把基準換到最右邊
    if (pi !== hi) {
      const v = a[pi];
      exchange(pi, hi);
      snap({ range: rng, pivot: hi }, [pi, hi], 3, { key: 'quick.toEnd', params: { v, at: hi } });
    }

    const p = a[hi];
    let i = lo;
    snap({ range: rng, pivot: hi, i }, [hi], 4, { key: 'quick.setup', params: { p, i } });

    for (let j = lo; j < hi; j++) {
      compare++;
      if (a[j] < p) {
        const i0 = i;
        const v = a[j];
        const swapped = exchange(i, j);
        i++;
        snap({ range: rng, pivot: hi, i, j }, swapped ? [j, i0] : [j], 7, {
          key: swapped ? 'quick.small' : 'quick.smallStay',
          params: { j, v, p, i0, i },
        });
      } else {
        snap({ range: rng, pivot: hi, i, j }, [j], 6, {
          key: 'quick.large',
          params: { j, v: a[j], p },
        });
      }
    }

    exchange(i, hi);
    sorted.add(i);
    snap({ range: rng, pivot: i, i }, [i], 8, {
      key: 'quick.place',
      params: { p, at: i, left: i - lo, right: hi - i },
    });

    // 空的一側不會出現在堆疊裡（沒有數字可處理）
    if (i - 1 >= lo) sort(lo, i - 1, 9);
    if (hi >= i + 1) sort(i + 1, hi, 10);
    stack.pop();
  }

  if (n > 0) sort(0, n - 1, 0);
  // 最後一步：全部都在最終位置，堆疊為空
  steps.push({
    state: base([...a], range(0, n - 1)),
    highlight: [],
    line: 0,
    explain: { key: 'sort.done' },
    stats: stats(),
  });
  return steps;
};
