export const locales = ['zh-TW', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'zh-TW';

const ui = {
  'zh-TW': {
    siteName: '步步看懂',
    tagline: '親手操作、逐步前進與倒退的互動視覺化',
    description: '把看課本看不懂的演算法與資料結構，變成可以親手操作、逐步前進與倒退的互動視覺化。',
    prev: '上一步',
    next: '下一步',
    play: '播放',
    pause: '暫停',
    reset: '重設',
    step: '步驟',
    interactive: '互動視覺化',
    speed: '速度',
    topics: '主題',
    sorting: '排序演算法',
    explanation: '這一步',
    pseudocode: '偽代碼',
    stats: { compare: '比較次數', shift: '位移次數', swap: '交換次數' },
    input: {
      label: '自訂陣列（用逗號或空白分隔，最多 12 個、0–99 的整數）',
      apply: '套用',
      random: '隨機',
      best: '最佳情況',
      worst: '最差情況',
      key: '待插入',
      min: '最小',
      arrayLabel: '目前陣列',
      errors: {
        empty: '請至少輸入一個數字。',
        notInteger: '只能輸入整數，並用逗號或空白分隔。',
        tooMany: '最多 12 個數字。',
        outOfRange: '數字必須介於 0 到 99。',
      },
    },
    home: { topicsHeading: '目前的主題', empty: '主題即將推出。' },
    toc: { complexity: '複雜度', faq: '常見問題' },
    complexityRows: { best: '最佳', average: '平均', worst: '最差', space: '額外空間', stable: '穩定', yes: '是', no: '否' },
  },
  en: {
    siteName: 'Step Through',
    tagline: 'Interactive visualizations you can step forward and back',
    description:
      'Algorithms and data structures you can operate by hand, one step at a time — forward and backward.',
    prev: 'Previous',
    next: 'Next',
    play: 'Play',
    pause: 'Pause',
    reset: 'Reset',
    step: 'Step',
    interactive: 'Interactive Visualization',
    speed: 'Speed',
    topics: 'Topics',
    sorting: 'Sorting algorithms',
    explanation: 'This step',
    pseudocode: 'Pseudocode',
    stats: { compare: 'Comparisons', shift: 'Shifts', swap: 'Swaps' },
    input: {
      label: 'Custom array (comma or space separated, up to 12 integers, 0–99)',
      apply: 'Apply',
      random: 'Random',
      best: 'Best case',
      worst: 'Worst case',
      key: 'KEY',
      min: 'MIN',
      arrayLabel: 'Current array',
      errors: {
        empty: 'Enter at least one number.',
        notInteger: 'Integers only, separated by commas or spaces.',
        tooMany: 'At most 12 numbers.',
        outOfRange: 'Numbers must be between 0 and 99.',
      },
    },
    home: { topicsHeading: 'Topics', empty: 'Topics are coming soon.' },
    toc: { complexity: 'Complexity', faq: 'FAQ' },
    complexityRows: { best: 'Best', average: 'Average', worst: 'Worst', space: 'Extra space', stable: 'Stable', yes: 'Yes', no: 'No' },
  },
} as const;

export const t = (lang: Locale) => ui[lang];

const messages: Record<Locale, Record<string, string>> = {
  'zh-TW': {
    'sort.init': '初始陣列，共 {n} 個數字。按「下一步」開始。',
    'sort.done': '排序完成，整個陣列都在正確的位置上。',
    'insertion.pick': '取出索引 {i} 的 {key} 當作「待插入值」，並在原位留下空位，準備往左找它該放的地方。',
    'insertion.shift': '比較左邊的 {left} 與待插入值 {key}：{left} 比較大，所以把 {left} 往右位移一格，空位往左移。',
    'insertion.stop': '比較左邊的 {left} 與待插入值 {key}：{left} 不比 {key} 大，不用再往左了。',
    'insertion.edge': '已經到最左邊，沒有更多數字可比較，待插入值 {key} 就放在這裡。',
    'insertion.place': '把 {key} 放進索引 {at} 的空位。索引 0 到 {i} 現在是排好的一段。',
    'bubble.compare.swap': '比較相鄰的 {a} 與 {b}：左邊比右邊大，順序不對，需要交換。',
    'bubble.compare.keep': '比較相鄰的 {a} 與 {b}：左邊不比右邊大，順序正確，不用交換。',
    'bubble.swap': '交換後，{b} 在左、{a} 在右。',
    'bubble.passEnd': '第 {pass} 趟結束：這一趟最大的 {max} 已經「浮」到最右邊的正確位置。',
    'bubble.earlyExit': '第 {pass} 趟沒有發生任何交換，代表整個陣列已經排好，提早結束。',
    'selection.start': '第 {i} 輪：先假設索引 {i} 的 {v} 是剩下的數字中最小的。',
    'selection.newMin': '看索引 {j} 的 {v}：比目前最小值 {m} 更小，把它記為新的最小值。',
    'selection.keep': '看索引 {j} 的 {v}：不比目前最小值 {m} 小，最小值維持不變。',
    'selection.swap': '掃描完畢，把最小值 {m} 與索引 {i} 的 {v} 交換。索引 0 到 {i} 現在是排好的一段。',
    'selection.noSwap': '掃描完畢，最小值 {m} 本來就在索引 {i}，不用交換。索引 0 到 {i} 現在是排好的一段。',
  },
  en: {
    'sort.init': 'Initial array of {n} numbers. Press “Next” to begin.',
    'sort.done': 'Sorted: every element is now in its final position.',
    'insertion.pick': 'Take {key} at index {i} as the “key” and leave a hole there; look left for where it belongs.',
    'insertion.shift': 'Compare {left} with key {key}: {left} is larger, so shift {left} one place right and move the hole left.',
    'insertion.stop': 'Compare {left} with key {key}: {left} is not larger than {key}, so stop moving left.',
    'insertion.edge': 'Reached the left edge with nothing left to compare; key {key} goes here.',
    'insertion.place': 'Put {key} into the hole at index {at}. Indices 0 to {i} are now sorted.',
    'bubble.compare.swap': 'Compare neighbours {a} and {b}: the left one is larger, so they must be swapped.',
    'bubble.compare.keep': 'Compare neighbours {a} and {b}: already in order, no swap.',
    'bubble.swap': 'After the swap, {b} is on the left and {a} on the right.',
    'bubble.passEnd': 'Pass {pass} done: the largest value {max} has “bubbled” to its final place on the right.',
    'bubble.earlyExit': 'Pass {pass} made no swaps, so the array is sorted; stop early.',
    'selection.start': 'Round {i}: assume {v} at index {i} is the smallest of what remains.',
    'selection.newMin': 'Look at {v} at index {j}: smaller than the current minimum {m}, so it becomes the new minimum.',
    'selection.keep': 'Look at {v} at index {j}: not smaller than the current minimum {m}; keep it.',
    'selection.swap': 'Scan finished: swap the minimum {m} with {v} at index {i}. Indices 0 to {i} are now sorted.',
    'selection.noSwap': 'Scan finished: the minimum {m} is already at index {i}, no swap. Indices 0 to {i} are now sorted.',
  },
};

export function explain(
  lang: Locale,
  e: { key: string; params?: Record<string, string | number> },
): string {
  const tpl = messages[lang][e.key] ?? e.key;
  return tpl.replace(/\{(\w+)\}/g, (_, k: string) => String(e.params?.[k] ?? `{${k}}`));
}
