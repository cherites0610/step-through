import { base, range, type SortAlgorithm, type SortTrace } from './types';

export const selectionPseudocode = [
  'for i = 0 to n - 2',
  '  min = i',
  '  for j = i + 1 to n - 1',
  '    if A[j] < A[min]',
  '      min = j',
  '  swap(A[i], A[min])',
];

export const selectionSort: SortAlgorithm = (input) => {
  const a = [...input];
  const n = a.length;
  const steps: SortTrace = [];
  let compare = 0;
  let swap = 0;
  const stats = () => ({ compare, swap });

  steps.push({
    state: base([...a]),
    highlight: [],
    line: 0,
    explain: { key: 'sort.init', params: { n } },
    stats: stats(),
  });

  for (let i = 0; i < n - 1; i++) {
    let min = i;
    const done = range(0, i - 1);
    steps.push({
      state: { ...base([...a], done), min },
      highlight: [String(i)],
      line: 1,
      explain: { key: 'selection.start', params: { i, v: a[i] } },
      stats: stats(),
    });

    for (let j = i + 1; j < n; j++) {
      compare++;
      if (a[j] < a[min]) {
        const prev = a[min];
        min = j;
        steps.push({
          state: { ...base([...a], done), min },
          highlight: [String(j)],
          line: 4,
          explain: { key: 'selection.newMin', params: { j, v: a[j], m: prev } },
          stats: stats(),
        });
      } else {
        steps.push({
          state: { ...base([...a], done), min },
          highlight: [String(j)],
          line: 3,
          explain: { key: 'selection.keep', params: { j, v: a[j], m: a[min] } },
          stats: stats(),
        });
      }
    }

    if (min !== i) {
      [a[i], a[min]] = [a[min], a[i]];
      swap++;
      steps.push({
        state: base([...a], range(0, i)),
        highlight: [String(i), String(min)],
        line: 5,
        explain: { key: 'selection.swap', params: { i, m: a[i], v: a[min] } },
        stats: stats(),
      });
    } else {
      steps.push({
        state: base([...a], range(0, i)),
        highlight: [String(i)],
        line: 5,
        explain: { key: 'selection.noSwap', params: { i, m: a[i] } },
        stats: stats(),
      });
    }
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
