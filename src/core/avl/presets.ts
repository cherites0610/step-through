/** 四種失衡情況各一組最小的示範序列：插入第三個數字時剛好失衡。 */
export const avlPresets = {
  LL: [30, 20, 10],
  RR: [10, 20, 30],
  LR: [30, 10, 20],
  RL: [10, 30, 20],
  /** 連續遞增：一般二元搜尋樹會退化成一條線，AVL 會一路旋轉保持平衡 */
  ascending: [10, 20, 30, 40, 50, 60, 70],
  /** 7 個不重複的隨機數字 */
  random: (n = 7, rand: () => number = Math.random): number[] => {
    const seen = new Set<number>();
    while (seen.size < n) seen.add(1 + Math.floor(rand() * 99));
    return [...seen];
  },
};
