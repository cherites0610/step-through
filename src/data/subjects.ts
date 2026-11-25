/**
 * 科目 → 章節 → 單元。章節的先修關係構成科目地圖（見 PRODUCT.md §5）。
 * 單元有 topic 時對應一個主題頁；content collection 有這個 topic 才算已上線。
 */
export type Unit = { title: string; topic?: string };

export type Chapter = {
  id: string;
  /** 章節編號，地圖、清單與主題頁的位置標籤共用 */
  no: number;
  title: string;
  /** 建議先讀的章節 id（同一科目內）；構成地圖的邊 */
  prereqs: string[];
  units: Unit[];
};

export type Subject = {
  id: string;
  title: string;
  /** 一句話的範圍說明 */
  scope: string;
  /** 適用的考試 */
  exams: string[];
  /** 沒有章節的科目＝即將推出 */
  chapters: Chapter[];
};

export const subjects: Subject[] = [
  {
    id: 'data-structures',
    title: '資料結構',
    scope: '陣列、串列、樹、圖、排序與雜湊，共 11 章。',
    exams: ['資工所', '資管所'],
    chapters: [
      {
        id: 'basics',
        no: 1,
        title: '基本觀念與複雜度',
        prereqs: [],
        units: [{ title: '漸近符號' }, { title: '遞迴與遞迴關係式' }, { title: '主定理' }],
      },
      {
        id: 'arrays',
        no: 2,
        title: '陣列與矩陣',
        prereqs: ['basics'],
        units: [{ title: '多維陣列位址計算' }, { title: '稀疏矩陣' }, { title: '特殊矩陣' }],
      },
      {
        id: 'stacks-queues',
        no: 3,
        title: '堆疊與佇列',
        prereqs: ['arrays'],
        units: [{ title: '中序轉後序' }, { title: '運算式求值' }, { title: '環狀佇列' }, { title: '遞迴的堆疊模擬' }],
      },
      {
        id: 'linked-lists',
        no: 4,
        title: '鏈結串列',
        prereqs: ['arrays'],
        units: [{ title: '單向、雙向與環狀串列' }, { title: '多項式相加' }],
      },
      {
        id: 'trees',
        no: 5,
        title: '樹與二元樹',
        prereqs: ['stacks-queues', 'linked-lists'],
        units: [
          { title: '二元樹的性質' },
          { title: '走訪（前序、中序、後序、層序）' },
          { title: '由走訪結果重建二元樹' },
          { title: '引線二元樹' },
          { title: '樹與森林的轉換' },
          { title: '互斥集合（Union-Find）' },
        ],
      },
      {
        id: 'bst',
        no: 6,
        title: '二元搜尋樹',
        prereqs: ['trees'],
        units: [{ title: '搜尋' }, { title: '插入' }, { title: '刪除' }],
      },
      {
        id: 'heaps',
        no: 7,
        title: '堆積與優先佇列',
        prereqs: ['trees'],
        units: [
          { title: '二元堆積與建堆' },
          { title: 'Min-Max Heap' },
          { title: 'Leftist Heap' },
          { title: 'Binomial 與 Fibonacci Heap' },
        ],
      },
      {
        id: 'balanced-trees',
        no: 8,
        title: '平衡搜尋樹',
        prereqs: ['bst'],
        units: [
          { title: 'AVL 樹插入', topic: 'avl-insert' },
          { title: 'AVL 樹刪除' },
          { title: '2-3 樹與 2-3-4 樹' },
          { title: '紅黑樹' },
          { title: 'B 樹與 B+ 樹' },
          { title: 'Splay Tree' },
        ],
      },
      {
        id: 'graphs',
        no: 9,
        title: '圖',
        prereqs: ['linked-lists', 'trees'],
        units: [
          { title: '表示法' },
          { title: 'DFS 與 BFS' },
          { title: '最小生成樹' },
          { title: '最短路徑' },
          { title: '拓樸排序' },
          { title: 'AOE 與關鍵路徑' },
          { title: '關節點' },
        ],
      },
      {
        id: 'sorting',
        no: 10,
        title: '排序',
        prereqs: ['arrays'],
        units: [
          { title: '插入排序', topic: 'insertion-sort' },
          { title: '氣泡排序', topic: 'bubble-sort' },
          { title: '選擇排序', topic: 'selection-sort' },
          { title: '合併排序', topic: 'merge-sort' },
          { title: '快速排序', topic: 'quick-sort' },
          { title: '堆積排序' },
          { title: '計數排序與基數排序' },
          { title: '比較排序的下界' },
        ],
      },
      {
        id: 'hashing',
        no: 11,
        title: '搜尋與雜湊',
        prereqs: ['arrays'],
        units: [
          { title: '循序與二分搜尋' },
          { title: '雜湊函數' },
          { title: '碰撞處理' },
          { title: '負載因子' },
        ],
      },
    ],
  },
  { id: 'algorithms', title: '演算法', scope: '分治、貪婪、動態規劃、圖論演算法與複雜度。', exams: ['資工所'], chapters: [] },
  { id: 'operating-systems', title: '作業系統', scope: '行程、同步、排程、記憶體管理與頁面置換。', exams: ['資工所'], chapters: [] },
  { id: 'computer-organization', title: '計算機組織', scope: '指令集、管線、快取與記憶體階層。', exams: ['資工所'], chapters: [] },
  { id: 'discrete-math', title: '離散數學', scope: '邏輯、集合、組合、遞迴關係與圖論。', exams: ['資工所'], chapters: [] },
  { id: 'linear-algebra', title: '線性代數', scope: '矩陣、向量空間、特徵值與對角化。', exams: ['資工所'], chapters: [] },
  { id: 'databases', title: '資料庫', scope: '關聯模型、SQL、正規化與交易。', exams: ['資管所'], chapters: [] },
  { id: 'intro-cs', title: '計算機概論', scope: '數字系統、硬體、軟體、網路與資訊安全。', exams: ['資管所'], chapters: [] },
];

export const isOpen = (s: Subject) => s.chapters.length > 0;

/** 主題（單元頁）在科目中的位置：所屬科目、章節與章內序號（1 起算）。 */
export function locateTopic(topic: string) {
  for (const subject of subjects) {
    for (const chapter of subject.chapters) {
      const i = chapter.units.findIndex((u) => u.topic === topic);
      if (i >= 0) return { subject, chapter, index: i + 1 };
    }
  }
  return undefined;
}

/** 全站主題的先後順序：依科目、章節編號與章內順序。 */
export const topicOrder = subjects.flatMap((s) =>
  [...s.chapters].sort((a, b) => a.no - b.no).flatMap((c) => c.units.flatMap((u) => (u.topic ? [u.topic] : []))),
);

export const pad2 = (n: number) => String(n).padStart(2, '0');
