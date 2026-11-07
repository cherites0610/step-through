import {
  balanceFactor,
  cloneTree,
  emptyHeight,
  type AvlNode,
  type AvlState,
  type AvlTrace,
  type ImbalanceKind,
} from './types';

export const avlPseudocode = [
  'insert(v)',
  '  node = root',
  '  while node != null',
  '    go left if v < node else right',
  '  attach v as a new leaf',
  '  for each ancestor, bottom up',
  '    update height; bf = hL - hR',
  '    if |bf| > 1: unbalanced',
  '      LL: right(node)',
  '      RR: left(node)',
  '      LR: left(child), right(node)',
  '      RL: right(child), left(node)',
];

const signed = (n: number) => (n > 0 ? `+${n}` : String(n));
const updateHeight = (n: AvlNode) => {
  n.height = 1 + Math.max(emptyHeight(n.left), emptyHeight(n.right));
};

/** 右旋：左孩子升上來當根，原本的根變成它的右孩子。回傳新的子樹根。 */
function rotateRight(node: AvlNode): AvlNode {
  const pivot = node.left!;
  node.left = pivot.right;
  pivot.right = node;
  updateHeight(node);
  updateHeight(pivot);
  return pivot;
}

/** 左旋：右孩子升上來當根，原本的根變成它的左孩子。回傳新的子樹根。 */
function rotateLeft(node: AvlNode): AvlNode {
  const pivot = node.right!;
  node.right = pivot.left;
  pivot.left = node;
  updateHeight(node);
  updateHeight(pivot);
  return pivot;
}

/**
 * 依序把 input 的數字插入 AVL 樹，回傳完整的步驟軌跡。
 * 每個插入的流程：照二元搜尋樹規則往下找位置 → 掛成新葉節點 →
 * 由下往上更新高度與平衡因子 → 失衡就旋轉（單旋或雙旋）。
 * 一次插入最多只需要一次旋轉（雙旋算兩個動作），旋轉後或高度不變時就可以停止往上檢查。
 */
export function avlInsertAll(input: readonly number[]): AvlTrace {
  const total = input.length;
  const steps: AvlTrace = [];
  let root: AvlNode | null = null;
  let nextId = 1;
  let compare = 0;
  let rotate = 0;

  const snap = (
    index: number,
    extra: Partial<AvlState>,
    highlight: number[],
    line: number,
    explain: { key: string; params?: Record<string, string | number> },
  ) => {
    steps.push({
      state: {
        root: cloneTree(root),
        inserting: null,
        path: [],
        unbalanced: null,
        index,
        total,
        ...extra,
      },
      highlight: highlight.map(String),
      line,
      explain,
      stats: { compare, rotate, height: emptyHeight(root) },
    });
  };

  snap(0, {}, [], 0, { key: 'avl.init', params: { n: total, seq: input.join(', ') } });

  for (let k = 1; k <= total; k++) {
    const v = input[k - 1];

    if (!root) {
      root = { id: nextId++, value: v, left: null, right: null, height: 1 };
      snap(k, {}, [root.id], 4, { key: 'avl.root', params: { k, v } });
      continue;
    }

    // 1) 照二元搜尋樹的規則往下走
    const path: AvlNode[] = [];
    const ids = () => path.map((p) => p.id);
    let cur: AvlNode | null = root;
    let created: AvlNode | null = null;
    let duplicate = false;

    snap(k, { inserting: v }, [], 1, { key: 'avl.insert', params: { k, v } });

    while (cur) {
      compare++;
      path.push(cur);
      if (v === cur.value) {
        duplicate = true;
        snap(k, { inserting: v, path: ids() }, [cur.id], 3, { key: 'avl.dup', params: { v, n: cur.value } });
        break;
      }
      const goLeft: boolean = v < cur.value;
      snap(k, { inserting: v, path: ids() }, [cur.id], 3, {
        key: goLeft ? 'avl.goLeft' : 'avl.goRight',
        params: { v, n: cur.value },
      });
      const next: AvlNode | null = goLeft ? cur.left : cur.right;
      if (!next) {
        created = { id: nextId++, value: v, left: null, right: null, height: 1 };
        if (goLeft) cur.left = created;
        else cur.right = created;
        snap(k, { path: ids() }, [created.id], 4, {
          key: goLeft ? 'avl.attachLeft' : 'avl.attachRight',
          params: { v, n: cur.value },
        });
        break;
      }
      cur = next;
    }
    if (duplicate || !created) continue;

    // 2) 由下往上更新高度與平衡因子；失衡就旋轉
    for (let i = path.length - 1; i >= 0; i--) {
      const node = path[i];
      const oldHeight = node.height;
      updateHeight(node);
      const hl = emptyHeight(node.left);
      const hr = emptyHeight(node.right);
      const bf = balanceFactor(node);
      const pathIds = ids();

      if (Math.abs(bf) <= 1) {
        const stop = node.height === oldHeight && i > 0;
        snap(k, { path: pathIds }, [node.id], 6, {
          key: stop ? 'avl.balancedStop' : 'avl.balanced',
          params: { n: node.value, hl, hr, bf: signed(bf) },
        });
        if (stop) break;
        continue;
      }

      // 失衡：新節點落在哪一側決定是哪一種情況
      const heavyLeft = bf > 1;
      const child = (heavyLeft ? node.left : node.right)!;
      const kind: ImbalanceKind = heavyLeft
        ? v < child.value ? 'LL' : 'LR'
        : v > child.value ? 'RR' : 'RL';
      snap(k, { path: pathIds, unbalanced: { id: node.id, kind } }, [node.id], 7, {
        key: `avl.unbalanced.${kind}`,
        params: { n: node.value, hl, hr, bf: signed(bf), c: child.value },
      });

      const parent: AvlNode | null = i > 0 ? path[i - 1] : null;
      const replace = (top: AvlNode) => {
        if (!parent) root = top;
        else if (parent.left === node) parent.left = top;
        else parent.right = top;
      };

      let top: AvlNode;
      if (kind === 'LL') {
        top = rotateRight(node);
        rotate++;
        replace(top);
        snap(k, { path: pathIds }, [top.id, node.id], 8, { key: 'avl.rot.right', params: { n: node.value, c: top.value } });
      } else if (kind === 'RR') {
        top = rotateLeft(node);
        rotate++;
        replace(top);
        snap(k, { path: pathIds }, [top.id, node.id], 9, { key: 'avl.rot.left', params: { n: node.value, c: top.value } });
      } else if (kind === 'LR') {
        const mid = rotateLeft(child);
        node.left = mid;
        updateHeight(node);
        rotate++;
        snap(k, { path: pathIds }, [mid.id, child.id], 10, { key: 'avl.rot.firstLeft', params: { n: child.value, c: mid.value } });
        top = rotateRight(node);
        rotate++;
        replace(top);
        snap(k, { path: pathIds }, [top.id, node.id], 10, { key: 'avl.rot.right', params: { n: node.value, c: top.value } });
      } else {
        const mid = rotateRight(child);
        node.right = mid;
        updateHeight(node);
        rotate++;
        snap(k, { path: pathIds }, [mid.id, child.id], 11, { key: 'avl.rot.firstRight', params: { n: child.value, c: mid.value } });
        top = rotateLeft(node);
        rotate++;
        replace(top);
        snap(k, { path: pathIds }, [top.id, node.id], 11, { key: 'avl.rot.left', params: { n: node.value, c: top.value } });
      }

      // 旋轉後這棵子樹的高度回到插入前，所以更上面的節點都不受影響
      snap(k, {}, [top.id], 5, { key: 'avl.fixed', params: { n: top.value } });
      break;
    }
  }

  const distinct = new Set(input).size;
  snap(total, {}, [], 0, {
    key: 'avl.finished',
    params: { n: distinct, h: emptyHeight(root) },
  });
  return steps;
}
