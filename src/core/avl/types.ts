import type { Trace } from '../trace';

/** 失衡的四種情況：新節點落在失衡節點的 左左／右右／左右／右左 側。 */
export type ImbalanceKind = 'LL' | 'RR' | 'LR' | 'RL';

/** 樹的節點。id 在整條軌跡中固定不變（旋轉時節點換位置但 id 不變），畫面才能做移動動畫。 */
export type AvlNode = {
  id: number;
  value: number;
  left: AvlNode | null;
  right: AvlNode | null;
  /** 以此節點為根的子樹高度（葉節點為 1，空樹為 0） */
  height: number;
};

export type AvlState = {
  root: AvlNode | null;
  /** 正在插入的值（還沒放進樹時顯示為「待插入」） */
  inserting: number | null;
  /** 這次插入走過的祖先節點 id（由根到最深的祖先） */
  path: number[];
  /** 目前失衡的節點與情況 */
  unbalanced: { id: number; kind: ImbalanceKind } | null;
  /** 這是序列中的第幾個數字（1 起算；0 表示還沒開始） */
  index: number;
  total: number;
};

export type AvlTrace = Trace<AvlState>;

export const emptyHeight = (n: AvlNode | null): number => (n ? n.height : 0);

/** 平衡因子 = 左子樹高 − 右子樹高 */
export const balanceFactor = (n: AvlNode): number => emptyHeight(n.left) - emptyHeight(n.right);

export const cloneTree = (n: AvlNode | null): AvlNode | null =>
  n && { id: n.id, value: n.value, height: n.height, left: cloneTree(n.left), right: cloneTree(n.right) };

/** 由左到右（中序）走訪。 */
export function inorder(n: AvlNode | null, out: AvlNode[] = []): AvlNode[] {
  if (n) {
    inorder(n.left, out);
    out.push(n);
    inorder(n.right, out);
  }
  return out;
}

/** 依實際結構量出的深度（根為 1）；不依賴節點上記錄的 height（插入途中可能還沒更新）。 */
export function depthOf(n: AvlNode | null): number {
  return n ? 1 + Math.max(depthOf(n.left), depthOf(n.right)) : 0;
}
