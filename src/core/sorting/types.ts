import type { Trace } from '../trace';

/** 五種排序共用的畫面狀態。 */
export type SortState = {
  arr: number[];
  /** 已在最終位置的索引 */
  sorted: number[];
  /** 插入排序：被取出、等待插入的值（否則為 null） */
  key: number | null;
  /** 插入排序：目前的空位索引（否則為 null） */
  hole: number | null;
  /** 選擇排序：目前最小值的索引（否則為 null） */
  min: number | null;
};

export type SortTrace = Trace<SortState>;

export type SortAlgorithm = (input: readonly number[]) => SortTrace;

export const base = (arr: number[], sorted: number[] = []): SortState => ({
  arr,
  sorted,
  key: null,
  hole: null,
  min: null,
});

export const range = (from: number, to: number): number[] =>
  Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i);
