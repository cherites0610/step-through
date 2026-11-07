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
