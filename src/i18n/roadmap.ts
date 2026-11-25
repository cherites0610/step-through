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
    title: { 'zh-TW': '排序' },
    items: [
      { topic: 'insertion-sort', title: { 'zh-TW': '插入排序' } },
      { topic: 'bubble-sort', title: { 'zh-TW': '氣泡排序' } },
      { topic: 'selection-sort', title: { 'zh-TW': '選擇排序' } },
      { topic: 'merge-sort', title: { 'zh-TW': '合併排序' } },
      { topic: 'quick-sort', title: { 'zh-TW': '快速排序' } },
    ],
  },
  {
    id: 'trees',
    title: { 'zh-TW': '樹' },
    items: [
      { topic: 'bst', title: { 'zh-TW': '二元搜尋樹' } },
      { topic: 'avl-insert', title: { 'zh-TW': 'AVL 樹插入' } },
      { topic: 'heap', title: { 'zh-TW': '堆積與堆積排序' } },
      { topic: 'red-black-tree', title: { 'zh-TW': '紅黑樹' } },
    ],
  },
  {
    id: 'systems',
    title: { 'zh-TW': '雜湊與系統' },
    items: [
      { topic: 'hash-table', title: { 'zh-TW': '雜湊表碰撞' } },
      { topic: 'page-replacement', title: { 'zh-TW': '頁面置換' } },
      { topic: 'tlb-eat', title: { 'zh-TW': 'TLB 命中與 EAT 計算' } },
      { topic: 'cache-mapping', title: { 'zh-TW': '快取映射' } },
    ],
  },
  {
    id: 'graphs',
    title: { 'zh-TW': '圖與動態規劃' },
    items: [
      { topic: 'dijkstra', title: { 'zh-TW': 'Dijkstra 最短路徑' } },
      { topic: 'dp-table', title: { 'zh-TW': '動態規劃填表' } },
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
