import type { Locale } from './index';

type Bilingual = Record<Locale, string>;

export type RoadmapItem = {
  /** 對應主題頁的 topic（content collection 有此項目才算已上線） */
  topic?: string;
  title: Bilingual;
  /** 沒有 topic 時顯示的英文原文 */
  en?: string;
};

export type Chapter = { id: string; title: Bilingual; items: RoadmapItem[] };

/** 依資料結構課程的學習順序排列的主題路線圖。已上線與否由 content collection 決定。 */
export const roadmap: Chapter[] = [
  {
    id: 'sorting',
    title: { 'zh-TW': '排序', en: 'Sorting' },
    items: [
      { topic: 'insertion-sort', title: { 'zh-TW': '插入排序', en: 'Insertion Sort' }, en: 'Insertion Sort' },
      { topic: 'bubble-sort', title: { 'zh-TW': '氣泡排序', en: 'Bubble Sort' }, en: 'Bubble Sort' },
      { topic: 'selection-sort', title: { 'zh-TW': '選擇排序', en: 'Selection Sort' }, en: 'Selection Sort' },
      { topic: 'merge-sort', title: { 'zh-TW': '合併排序', en: 'Merge Sort' }, en: 'Merge Sort' },
      { topic: 'quick-sort', title: { 'zh-TW': '快速排序', en: 'Quick Sort' }, en: 'Quick Sort' },
    ],
  },
  {
    id: 'trees',
    title: { 'zh-TW': '樹', en: 'Trees' },
    items: [
      { topic: 'bst', title: { 'zh-TW': '二元搜尋樹', en: 'Binary Search Tree' }, en: 'Binary Search Tree' },
      { topic: 'avl-insert', title: { 'zh-TW': 'AVL 樹插入', en: 'AVL Tree Insertion' }, en: 'AVL Tree Insertion' },
      { topic: 'heap', title: { 'zh-TW': '堆積與堆積排序', en: 'Heap and Heap Sort' }, en: 'Heap Sort' },
      { topic: 'red-black-tree', title: { 'zh-TW': '紅黑樹', en: 'Red-Black Tree' }, en: 'Red-Black Tree' },
    ],
  },
  {
    id: 'systems',
    title: { 'zh-TW': '雜湊與系統', en: 'Hashing and systems' },
    items: [
      { topic: 'hash-table', title: { 'zh-TW': '雜湊表碰撞', en: 'Hash Table Collisions' }, en: 'Hash Table' },
      { topic: 'page-replacement', title: { 'zh-TW': '頁面置換', en: 'Page Replacement' }, en: 'Page Replacement' },
      { topic: 'tlb-eat', title: { 'zh-TW': 'TLB 命中與 EAT 計算', en: 'TLB Hits and EAT' }, en: 'TLB / EAT' },
      { topic: 'cache-mapping', title: { 'zh-TW': '快取映射', en: 'Cache Mapping' }, en: 'Cache Mapping' },
    ],
  },
  {
    id: 'graphs',
    title: { 'zh-TW': '圖與動態規劃', en: 'Graphs and DP' },
    items: [
      { topic: 'dijkstra', title: { 'zh-TW': 'Dijkstra 最短路徑', en: 'Dijkstra' }, en: 'Dijkstra' },
      { topic: 'dp-table', title: { 'zh-TW': '動態規劃填表', en: 'Dynamic Programming Tables' }, en: 'DP Tables' },
    ],
  },
];

/** 主題在路線圖中的位置：所屬章節與章內序號（1 起算）。順序以路線圖為唯一來源。 */
export function locateTopic(topic: string) {
  for (const chapter of roadmap) {
    const i = chapter.items.findIndex((it) => it.topic === topic);
    if (i >= 0) return { chapter, index: i + 1 };
  }
  return undefined;
}

/** 全站主題的先後順序（章節順序加章內順序），用來排序 collection 項目。 */
export const topicOrder = roadmap.flatMap((c) => c.items.map((it) => it.topic));
