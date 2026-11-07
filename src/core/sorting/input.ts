export const MAX_LENGTH = 12;
export const MIN_VALUE = 0;
export const MAX_VALUE = 99;

export type ParseResult =
  | { ok: true; values: number[] }
  | { ok: false; error: 'empty' | 'notInteger' | 'tooMany' | 'outOfRange' };

/** 解析使用者輸入：以逗號、頓號或空白分隔的整數。 */
export function parseInput(text: string): ParseResult {
  const parts = text.split(/[\s,，、]+/).filter(Boolean);
  if (parts.length === 0) return { ok: false, error: 'empty' };
  if (parts.some((p) => !/^-?\d+$/.test(p))) return { ok: false, error: 'notInteger' };
  if (parts.length > MAX_LENGTH) return { ok: false, error: 'tooMany' };
  const values = parts.map(Number);
  if (values.some((v) => v < MIN_VALUE || v > MAX_VALUE)) return { ok: false, error: 'outOfRange' };
  return { ok: true, values };
}

export const presets = {
  best: (n = 8) => Array.from({ length: n }, (_, i) => (i + 1) * 10),
  worst: (n = 8) => Array.from({ length: n }, (_, i) => (n - i) * 10),
  random: (n = 8, rand: () => number = Math.random) => {
    // 1–99，允許重複，貼近真實資料
    return Array.from({ length: n }, () => 1 + Math.floor(rand() * 99));
  },
};

/**
 * 快速排序（「尾」基準）的最佳情況：每次分割都剛好從中間切開。
 * 排法：[左半的最佳排列, 右半的最佳排列, 中位數]——中位數放最後當基準，
 * 左半都比它小、右半都比它大，掃描時不需要交換，只剩最後把基準放定位那一次。
 */
export function balancedForQuick(n = 8): number[] {
  // 最後「把基準換到定位」會把右半的第一個數字甩到右半最後面，
  // 所以右半要先反向旋轉一格，換完才會剛好是它自己的最佳排列。
  const rotateBack = (xs: number[]) => (xs.length > 1 ? [xs[xs.length - 1], ...xs.slice(0, -1)] : xs);
  const build = (sortedValues: number[]): number[] => {
    if (sortedValues.length <= 1) return sortedValues;
    const m = Math.floor((sortedValues.length - 1) / 2);
    return [
      ...build(sortedValues.slice(0, m)),
      ...rotateBack(build(sortedValues.slice(m + 1))),
      sortedValues[m],
    ];
  };
  return build(Array.from({ length: n }, (_, i) => (i + 1) * 10));
}

/** 各演算法的預設資料；快速排序的最佳／最差情況與其他排序不同。 */
export function presetsFor(algo: 'insertion' | 'bubble' | 'selection' | 'merge' | 'quick') {
  if (algo === 'quick') {
    return { random: presets.random, best: balancedForQuick, worst: presets.best };
  }
  return presets;
}
