import { chapterStates, emptyProgress, type ChapterInfo } from '../lib/progress';

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
  /** 章末自我檢核的「我能……」；全部自評為已掌握時，這一章在地圖上變成已掌握 */
  checklist?: string[];
};

export type Subject = {
  id: string;
  title: string;
  /** 一句話的範圍說明 */
  scope: string;
  /** 適用的考試 */
  exams: string[];
  /** 學習地圖的章節；空陣列＝即將推出（沒有科目頁） */
  chapters: Chapter[];
};

/** 還沒有單元頁的章節：單元只有名稱 */
const ch = (id: string, no: number, title: string, prereqs: string[], units: string[]): Chapter => ({
  id,
  no,
  title,
  prereqs,
  units: units.map((title) => ({ title })),
});

export const subjects: Subject[] = [
  {
    id: 'data-structures',
    title: '資料結構',
    scope: '陣列、串列、樹、圖、排序與雜湊。',
    exams: ['資工所', '資管所'],
    chapters: [
      {
        id: 'basics',
        no: 1,
        title: '基本觀念與複雜度',
        prereqs: [],
        units: [{ title: '演算法與效能分析' }, { title: '漸近符號' }, { title: '遞迴與遞迴關係式' }, { title: '主定理' }],
        checklist: [
          '能說明演算法的五個性質，並判斷一段程式是不是演算法',
          '能算出巢狀迴圈中某一行的執行次數，並用 Θ 表示',
          '能用 Big-O、Ω、Θ 描述成長率，並比較兩個函數的大小關係',
          '能從遞迴程式列出遞迴關係式，並用展開法或遞迴樹求解',
          '能用主定理求解 T(n) = aT(n/b) + f(n)，並判斷什麼時候不能用',
        ],
      },
      {
        id: 'arrays',
        no: 2,
        title: '陣列與矩陣',
        prereqs: ['basics'],
        units: [{ title: '多維陣列位址計算' }, { title: '稀疏矩陣' }, { title: '特殊矩陣' }],
        checklist: [
          '能用列優先與行優先公式計算多維陣列元素的位址',
          '能把稀疏矩陣轉成三元組表示，並完成轉置',
          '能計算三角矩陣與帶狀矩陣的元素存在一維陣列的哪個位置',
        ],
      },
      {
        id: 'stacks-queues',
        no: 3,
        title: '堆疊與佇列',
        prereqs: ['arrays'],
        units: [{ title: '中序轉後序' }, { title: '運算式求值' }, { title: '環狀佇列' }, { title: '遞迴的堆疊模擬' }],
        checklist: [
          '能把中序運算式轉成前序與後序',
          '能用堆疊計算後序運算式',
          '能寫出環狀佇列判斷空與滿的條件',
          '能用堆疊模擬遞迴呼叫的過程',
        ],
      },
      {
        id: 'linked-lists',
        no: 4,
        title: '鏈結串列',
        prereqs: ['arrays'],
        units: [{ title: '單向、雙向與環狀串列' }, { title: '多項式相加' }],
        checklist: [
          '能寫出單向與雙向串列插入、刪除節點的步驟',
          '能說明環狀串列與帶頭節點的好處',
          '能用串列表示多項式並完成相加',
        ],
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
        checklist: [
          '能推導二元樹的節點數、葉節點數與高度之間的關係',
          '能寫出前序、中序、後序與層序走訪的結果',
          '能由「中序＋前序」或「中序＋後序」重建二元樹',
          '能說明引線二元樹的引線如何建立',
          '能用 Union-Find 的 union by rank 與路徑壓縮',
        ],
      },
      {
        id: 'bst',
        no: 6,
        title: '二元搜尋樹',
        prereqs: ['trees'],
        units: [{ title: '搜尋' }, { title: '插入' }, { title: '刪除' }],
        checklist: [
          '能在二元搜尋樹中搜尋、插入並畫出結果',
          '能刪除有零、一、兩個子節點的節點',
          '能說明二元搜尋樹在最差情況會退化成什麼，以及時間複雜度',
        ],
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
        checklist: [
          '能手算二元堆積的插入與刪除最小值',
          '能用由下而上的建堆法，並說明為什麼是 O(n)',
          '能說明 Min-Max Heap 與 Leftist Heap 的性質與操作',
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
        checklist: [
          '能手算 AVL 樹插入，並指出 LL、RR、LR、RL 哪一種旋轉',
          '能手算 AVL 樹刪除後的再平衡',
          '能在 2-3-4 樹與紅黑樹之間互相轉換',
          '能手算 B 樹插入時的節點分裂',
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
        checklist: [
          '能用相鄰矩陣與相鄰串列表示圖，並比較它們的空間',
          '能寫出 DFS 與 BFS 的走訪順序',
          '能用 Kruskal 與 Prim 求最小生成樹',
          '能用 Dijkstra 求單源最短路徑，並說明為什麼不能有負邊',
          '能做拓樸排序，並求出 AOE 網路的關鍵路徑',
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
        checklist: [
          '能手算插入、氣泡、選擇排序每一趟之後的陣列',
          '能手算合併排序與快速排序（指定基準）的過程',
          '能比較各種排序的最佳、平均、最差時間與是否穩定',
          '能說明比較排序的下界為什麼是 Ω(n log n)',
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
        checklist: [
          '能寫出二分搜尋並計算比較次數',
          '能用線性探測、二次探測與雙重雜湊處理碰撞，並畫出雜湊表',
          '能用鏈結法處理碰撞',
          '能說明負載因子對搜尋效率的影響',
        ],
      },
    ],
  },
  {
    id: 'algorithms',
    title: '演算法',
    scope: '分析方法、分治、貪婪、動態規劃、圖論演算法與 NP 完備。',
    exams: ['資工所'],
    chapters: [
      ch('analysis', 1, '演算法分析', [], ['漸近符號', '遞迴關係式求解', '主定理', '攤銷分析']),
      ch('divide-conquer', 2, '分治法', ['analysis'], ['合併排序與快速排序的分析', 'Strassen 矩陣乘法', '最近點對', '中位數的中位數']),
      ch('sorting', 3, '排序與順序統計', ['analysis'], ['比較排序的下界', '計數、基數與桶排序', '第 k 小的元素']),
      ch('greedy', 4, '貪婪演算法', ['analysis'], ['活動選擇', 'Huffman 編碼', '分數背包', '貪婪選擇性質的證明']),
      ch('dp', 5, '動態規劃', ['divide-conquer'], ['最長共同子序列', '0/1 背包', '矩陣鏈乘', '最佳二元搜尋樹', '編輯距離']),
      ch('graph-basics', 6, '圖的基本演算法', ['analysis'], ['BFS 與 DFS', '拓樸排序', '強連通元件']),
      ch('mst', 7, '最小生成樹', ['greedy', 'graph-basics'], ['Kruskal', 'Prim', '互斥集合']),
      ch('shortest-paths', 8, '最短路徑', ['dp', 'graph-basics'], ['Dijkstra', 'Bellman-Ford', 'Floyd-Warshall', 'DAG 的最短路徑']),
      ch('max-flow', 9, '網路流', ['shortest-paths'], ['Ford-Fulkerson', 'Edmonds-Karp', '二分圖匹配']),
      ch('strings', 10, '字串比對', ['analysis'], ['樸素比對', 'KMP', 'Rabin-Karp']),
      ch('np', 11, 'NP 完備', ['dp', 'graph-basics'], ['P 與 NP', '多項式時間歸約', '常見的 NP 完備問題', '近似演算法']),
    ],
  },
  {
    id: 'operating-systems',
    title: '作業系統',
    scope: '行程、排程、同步、死結、記憶體管理、虛擬記憶體與檔案系統。',
    exams: ['資工所'],
    chapters: [
      ch('intro', 1, '作業系統概論', [], ['作業系統結構', '系統呼叫', '中斷與雙模式']),
      ch('processes', 2, '行程與執行緒', ['intro'], ['行程狀態', 'PCB 與內容切換', '執行緒模型', '行程間通訊']),
      ch('scheduling', 3, 'CPU 排程', ['processes'], ['FCFS、SJF、RR 與優先權', '多層回饋佇列', '平均等待時間的計算', '即時排程']),
      ch('sync', 4, '同步', ['processes'], ['臨界區問題', 'Peterson 演算法', '號誌（Semaphore）', 'Monitor', '經典同步問題']),
      ch('deadlock', 5, '死結', ['sync'], ['必要條件', '資源配置圖', '銀行家演算法', '偵測與回復']),
      ch('memory', 6, '記憶體管理', ['intro'], ['連續配置', '分頁', '分段', '分頁表結構', 'TLB 與有效存取時間']),
      ch('virtual-memory', 7, '虛擬記憶體', ['memory'], ['需求分頁', '頁面置換（FIFO、LRU、OPT）', '頁框配置', 'Thrashing 與工作集']),
      ch('storage', 8, '大量儲存', ['intro'], ['磁碟排程（SSTF、SCAN、C-SCAN、LOOK）', 'RAID']),
      ch('file-systems', 9, '檔案系統', ['storage'], ['檔案配置方式', '目錄結構', '空間管理']),
    ],
  },
  {
    id: 'computer-organization',
    title: '計算機組織',
    scope: '效能評估、指令集、計算機算術、管線、快取與記憶體階層。',
    exams: ['資工所'],
    chapters: [
      ch('performance', 1, '效能評估', [], ['CPI 與執行時間', 'Amdahl 定律', 'MIPS 與效能指標']),
      ch('isa', 2, '指令集架構', ['performance'], ['MIPS 指令格式', '定址模式', '程序呼叫與堆疊']),
      ch('arithmetic', 3, '計算機算術', ['isa'], ['二補數與溢位', '加法器（漣波與前瞻進位）', '乘法與除法', 'IEEE 754 浮點數']),
      ch('datapath', 4, '單週期處理器', ['isa', 'arithmetic'], ['資料路徑', '控制單元']),
      ch('pipeline', 5, '管線', ['datapath'], ['五級管線', '資料危障與轉送', '控制危障與分支預測', '結構危障']),
      ch('cache', 6, '快取', ['performance'], ['直接映射、集合關聯與全關聯', '置換與寫入策略', '平均記憶體存取時間', '多層快取']),
      ch('virtual-memory', 7, '虛擬記憶體與 TLB', ['cache'], ['分頁與分頁表', 'TLB', '快取與 TLB 的整合']),
      ch('io', 8, '輸入輸出', ['performance'], ['輪詢、中斷與 DMA', '匯流排']),
      ch('parallel', 9, '平行處理', ['pipeline', 'cache'], ['指令層級平行與超純量', '多核心與快取一致性']),
    ],
  },
  {
    id: 'discrete-math',
    title: '離散數學',
    scope: '邏輯、集合與關係、計數、遞迴關係、數論、圖論與代數結構。',
    exams: ['資工所'],
    chapters: [
      ch('logic', 1, '邏輯與證明', [], ['命題邏輯', '述詞邏輯', '證明方法', '數學歸納法']),
      ch('sets', 2, '集合、函數與關係', ['logic'], ['集合運算', '函數', '關係的性質', '等價關係', '偏序與 Hasse 圖']),
      ch('counting', 3, '計數', ['logic'], ['加法與乘法原理', '排列與組合', '鴿籠原理', '二項式定理']),
      ch('advanced-counting', 4, '進階計數', ['counting'], ['排容原理', '生成函數', 'Catalan 數', 'Stirling 數']),
      ch('recurrence', 5, '遞迴關係', ['counting'], ['線性齊次遞迴', '非齊次遞迴', '以生成函數解遞迴']),
      ch('number-theory', 6, '數論', ['logic'], ['整除與質數', '歐幾里得演算法', '同餘', '中國剩餘定理']),
      ch('graphs', 7, '圖論', ['sets'], ['基本名詞與同構', 'Euler 與 Hamilton 路徑', '平面圖', '著色']),
      ch('trees', 8, '樹', ['graphs'], ['樹的性質', '生成樹', '前綴碼']),
      ch('algebra', 9, '代數結構', ['sets', 'number-theory'], ['群', '環與體', '格與布林代數']),
    ],
  },
  {
    id: 'linear-algebra',
    title: '線性代數',
    scope: '線性方程組、矩陣、行列式、向量空間、特徵值、內積與奇異值分解。',
    exams: ['資工所'],
    chapters: [
      ch('systems', 1, '線性方程組', [], ['高斯消去法', '列梯形式', '解的存在與唯一性']),
      ch('matrices', 2, '矩陣代數', ['systems'], ['矩陣運算', '反矩陣', 'LU 分解', '分塊矩陣']),
      ch('determinants', 3, '行列式', ['matrices'], ['行列式的性質', '餘因子展開', 'Cramer 法則']),
      ch('vector-spaces', 4, '向量空間', ['matrices'], ['子空間', '線性獨立', '基底與維度', '四個基本子空間與秩']),
      ch('linear-maps', 5, '線性變換', ['vector-spaces'], ['核與值域', '矩陣表示', '基底變換與相似']),
      ch('eigen', 6, '特徵值與特徵向量', ['determinants', 'linear-maps'], ['特徵多項式', '對角化', 'Cayley-Hamilton 定理', 'Jordan 形式']),
      ch('inner-product', 7, '內積空間', ['vector-spaces'], ['正交', 'Gram-Schmidt', 'QR 分解', '最小平方法']),
      ch('symmetric', 8, '對稱矩陣與二次型', ['eigen', 'inner-product'], ['正交對角化', '正定矩陣', '二次型']),
      ch('svd', 9, '奇異值分解', ['symmetric'], ['SVD', '虛擬反矩陣']),
    ],
  },
  {
    id: 'databases',
    title: '資料庫',
    scope: 'ER 模型、關聯模型與代數、SQL、正規化、索引、查詢處理與交易。',
    exams: ['資管所'],
    chapters: [
      ch('intro', 1, '資料庫概論', [], ['資料庫系統架構', '資料獨立性', '資料模型']),
      ch('er', 2, 'ER 模型', ['intro'], ['實體與關係', '基數與參與限制', '弱實體', 'ER 圖轉關聯綱要']),
      ch('relational', 3, '關聯模型', ['intro'], ['鍵', '完整性限制']),
      ch('algebra', 4, '關聯代數', ['relational'], ['選擇與投影', '合併（Join）', '除法', '關聯演算']),
      ch('sql', 5, 'SQL', ['algebra'], ['基本查詢', '子查詢', '聚合與分組', '檢視表', '觸發程序']),
      ch('normalization', 6, '正規化', ['relational'], ['函數相依', '屬性閉包與候選鍵', '1NF 到 BCNF', '多值相依與 4NF', '無損分解與保持相依']),
      ch('storage', 7, '儲存與索引', ['relational'], ['檔案組織', 'B+ 樹索引', '雜湊索引']),
      ch('query', 8, '查詢處理與最佳化', ['algebra', 'storage'], ['合併演算法', '成本估計', '查詢最佳化']),
      ch('transactions', 9, '交易與並行控制', ['intro'], ['ACID', '可序列化', '兩階段鎖定', '時間戳記排序']),
      ch('recovery', 10, '回復', ['transactions'], ['日誌', '檢查點', 'ARIES']),
    ],
  },
  {
    id: 'intro-cs',
    title: '計算機概論',
    scope: '數字系統、邏輯電路、計算機組織、作業系統、程式語言、網路與資訊安全。',
    exams: ['資管所'],
    chapters: [
      ch('numbers', 1, '數字系統與資料表示', [], ['進位轉換', '二補數', '浮點數', '字元編碼']),
      ch('logic', 2, '布林代數與邏輯電路', ['numbers'], ['邏輯閘', '卡諾圖化簡', '組合電路', '循序電路']),
      ch('organization', 3, '計算機組織', ['logic'], ['CPU 與指令週期', '記憶體階層', '輸入輸出']),
      ch('os', 4, '作業系統', ['organization'], ['行程與排程', '記憶體管理', '檔案系統']),
      ch('programming', 5, '程式語言', ['numbers'], ['程式語言的分類', '編譯與直譯', '資料型別與控制結構']),
      ch('ds-algo', 6, '資料結構與演算法', ['programming'], ['陣列與串列', '堆疊與佇列', '樹與圖', '排序與搜尋']),
      ch('networks', 7, '網路', ['numbers'], ['OSI 與 TCP/IP', 'IP 位址與子網路', '常見的應用層協定']),
      ch('security', 8, '資訊安全', ['networks'], ['加密與雜湊', '數位簽章與憑證', '常見的攻擊']),
      ch('databases', 9, '資料庫', ['ds-algo'], ['關聯模型', 'SQL 基礎', '正規化']),
      ch('software-eng', 10, '軟體工程', ['programming'], ['開發流程', 'UML', '軟體測試']),
    ],
  },
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

/** 頁面網址（不含網域）：科目／章節／單元 */
export const subjectPath = (lang: string, s: Subject) => `/${lang}/${s.id}/`;
export const chapterPath = (lang: string, s: Subject, c: Chapter) => `/${lang}/${s.id}/${c.id}/`;
export const unitPath = (lang: string, s: Subject, c: Chapter, topic: string) => `/${lang}/${s.id}/${c.id}/${topic}/`;

/** 主題（v1 的 /zh-TW/<topic>/）的新網址 */
export function topicPath(lang: string, topic: string) {
  const loc = locateTopic(topic);
  if (!loc) throw new Error(`主題 "${topic}" 沒有登記在 src/data/subjects.ts`);
  return unitPath(lang, loc.subject, loc.chapter, topic);
}

/** 進度計算需要的章節資料 */
export const chapterInfos = (s: Subject): ChapterInfo[] =>
  s.chapters.map((c) => ({ id: c.id, no: c.no, prereqs: c.prereqs, checks: c.checklist?.length ?? 0 }));

/** 沒有任何進度時的章節狀態（靜態輸出用；載入後由 progress-dom.ts 依本機進度更新） */
export const initialStates = (s: Subject) => chapterStates(s.id, chapterInfos(s), emptyProgress());

/** 依先修關係反查：哪些章節把這一章列為先修 */
export const dependentsOf = (s: Subject, c: Chapter) => s.chapters.filter((x) => x.prereqs.includes(c.id));
