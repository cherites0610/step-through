import type { Trace } from '../trace';

/** 遞迴呼叫堆疊中的一格：處理索引 lo 到 hi 的區間。 */
export type Frame = { lo: number; hi: number };

/** 合併排序遞迴樹的一個節點（一段區間）。 */
export type MergeNode = {
  lo: number;
  hi: number;
  depth: number;
  /** hidden：還沒遞迴到；open：已出現；split：已切成兩半；merging：正在合併；done：已排好 */
  status: 'hidden' | 'open' | 'split' | 'merging' | 'done';
  /** done 時為排好的值，其餘為原始區間的值 */
  values: number[];
};

/** 合併排序：目前正在進行的合併。i、j 指向左右兩段「下一個要比較的」位置。 */
export type MergeView = {
  lo: number;
  mid: number;
  hi: number;
  left: number[];
  right: number[];
  i: number;
  j: number;
  out: number[];
  /** 剛剛取走的是哪一邊（null 表示還沒取） */
  took: 'left' | 'right' | null;
};

/** 五種排序共用的畫面狀態；用不到的欄位保持預設值。 */
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
  /** 快速排序：目前處理的區間 */
  range: [number, number] | null;
  /** 快速排序：基準的索引 */
  pivot: number | null;
  /** 快速排序：「小於基準區」的下一格（Lomuto 的 i） */
  i: number | null;
  /** 快速排序：正在掃描的索引（Lomuto 的 j） */
  j: number | null;
  /** 快速／合併排序：目前的遞迴呼叫堆疊（底在前、頂在後） */
  stack: Frame[];
  /** 合併排序：遞迴樹 */
  tree: MergeNode[];
  /** 合併排序：進行中的合併 */
  merge: MergeView | null;
};

export type SortTrace = Trace<SortState>;

export type PivotStrategy = 'first' | 'last' | 'median';
export type SortOptions = { pivot?: PivotStrategy };

export type SortAlgorithm = (input: readonly number[], options?: SortOptions) => SortTrace;

export const base = (arr: number[], sorted: number[] = []): SortState => ({
  arr,
  sorted,
  key: null,
  hole: null,
  min: null,
  range: null,
  pivot: null,
  i: null,
  j: null,
  stack: [],
  tree: [],
  merge: null,
});

export const range = (from: number, to: number): number[] =>
  Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i);
