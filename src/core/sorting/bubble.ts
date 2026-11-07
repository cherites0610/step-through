import { base, range, type SortAlgorithm, type SortTrace } from './types';

export const bubblePseudocode = [
  'for pass = 0 to n - 2',
  '  swapped = false',
  '  for j = 0 to n - pass - 2',
  '    if A[j] > A[j + 1]',
  '      swap(A[j], A[j + 1]); swapped = true',
  '  if not swapped: break',
];

export const bubbleSort: SortAlgorithm = (input) => {
  const a = [...input];
  const n = a.length;
  const steps: SortTrace = [];
  let compare = 0;
  let swap = 0;
  const stats = () => ({ compare, swap });
  /** 尾端已定位的索引 */
  let tail: number[] = [];

  steps.push({
    state: base([...a]),
    highlight: [],
    line: 0,
    explain: { key: 'sort.init', params: { n } },
    stats: stats(),
  });

  for (let pass = 0; pass < n - 1; pass++) {
    let swapped = false;
    for (let j = 0; j < n - pass - 1; j++) {
      compare++;
      const hi = [String(j), String(j + 1)];
      const needSwap = a[j] > a[j + 1];
      steps.push({
        state: base([...a], tail),
        highlight: hi,
        line: 3,
        explain: {
          key: needSwap ? 'bubble.compare.swap' : 'bubble.compare.keep',
          params: { a: a[j], b: a[j + 1] },
        },
        stats: stats(),
      });
      if (needSwap) {
        const [x, y] = [a[j], a[j + 1]];
        [a[j], a[j + 1]] = [y, x];
        swap++;
        swapped = true;
        steps.push({
          state: base([...a], tail),
          highlight: hi,
          line: 4,
          explain: { key: 'bubble.swap', params: { a: x, b: y } },
          stats: stats(),
        });
      }
    }
    tail = [n - pass - 1, ...tail];
    if (!swapped) {
      steps.push({
        state: base([...a], range(0, n - 1)),
        highlight: [],
        line: 5,
        explain: { key: 'bubble.earlyExit', params: { pass: pass + 1 } },
        stats: stats(),
      });
      return steps;
    }
    steps.push({
      state: base([...a], tail),
      highlight: [String(n - pass - 1)],
      line: 2,
      explain: { key: 'bubble.passEnd', params: { pass: pass + 1, max: a[n - pass - 1] } },
      stats: stats(),
    });
  }

  steps.push({
    state: base([...a], range(0, n - 1)),
    highlight: [],
    line: 0,
    explain: { key: 'sort.done' },
    stats: stats(),
  });
  return steps;
};
