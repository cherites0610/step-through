import { base, range, type SortAlgorithm, type SortTrace } from './types';

export const insertionPseudocode = [
  'for i = 1 to n - 1',
  '  key = A[i]',
  '  j = i - 1',
  '  while j >= 0 and A[j] > key',
  '    A[j + 1] = A[j]',
  '    j = j - 1',
  '  A[j + 1] = key',
];

export const insertionSort: SortAlgorithm = (input) => {
  const a = [...input];
  const n = a.length;
  const steps: SortTrace = [];
  let compare = 0;
  let shift = 0;
  const stats = () => ({ compare, shift });

  steps.push({
    state: base([...a], n <= 1 ? range(0, n - 1) : [0]),
    highlight: [],
    line: 0,
    explain: { key: 'sort.init', params: { n } },
    stats: stats(),
  });
  if (n <= 1) return steps;

  for (let i = 1; i < n; i++) {
    const key = a[i];
    let hole = i;
    steps.push({
      state: { ...base([...a], range(0, i - 1)), key, hole },
      highlight: [String(i)],
      line: 1,
      explain: { key: 'insertion.pick', params: { i, key } },
      stats: stats(),
    });

    let j = i - 1;
    while (j >= 0) {
      compare++;
      if (a[j] > key) {
        a[j + 1] = a[j];
        shift++;
        hole = j;
        steps.push({
          state: { ...base([...a], range(0, i - 1)), key, hole },
          highlight: [String(j + 1)],
          line: 4,
          explain: { key: 'insertion.shift', params: { left: a[j], key } },
          stats: stats(),
        });
        j--;
      } else {
        steps.push({
          state: { ...base([...a], range(0, i - 1)), key, hole },
          highlight: [String(j)],
          line: 3,
          explain: { key: 'insertion.stop', params: { left: a[j], key } },
          stats: stats(),
        });
        break;
      }
    }
    if (j < 0) {
      steps.push({
        state: { ...base([...a], range(0, i - 1)), key, hole },
        highlight: [],
        line: 3,
        explain: { key: 'insertion.edge', params: { key } },
        stats: stats(),
      });
    }

    a[hole] = key;
    steps.push({
      state: base([...a], range(0, i)),
      highlight: [String(hole)],
      line: 6,
      explain: { key: 'insertion.place', params: { key, at: hole, i } },
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
