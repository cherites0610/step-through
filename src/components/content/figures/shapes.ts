/** 圖共用的形狀：座標由參數計算，元件裡不手寫路徑。 */

/** 資料庫的圓柱：上下兩個橢圓與兩條側邊。回傳 [外框, 上緣的前半弧]。 */
export function cylinder(x: number, y: number, w: number, h: number, ry = 6): [string, string] {
  const rx = w / 2;
  const outline = `M${x} ${y + ry} A${rx} ${ry} 0 0 1 ${x + w} ${y + ry} L${x + w} ${y + h - ry} A${rx} ${ry} 0 0 1 ${x} ${y + h - ry} Z`;
  const lip = `M${x} ${y + ry} A${rx} ${ry} 0 0 0 ${x + w} ${y + ry}`;
  return [outline, lip];
}

/** 從 (x1, y1) 到 (x2, y2) 的線，終點留 gap 給箭頭 */
export function line(x1: number, y1: number, x2: number, y2: number, gap = 0): string {
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const ex = x2 - ((x2 - x1) / len) * gap;
  const ey = y2 - ((y2 - y1) / len) * gap;
  return `M${round(x1)} ${round(y1)} L${round(ex)} ${round(ey)}`;
}

/** n 個寬 w 的格子平均排在 [x0, x0 + span] 裡，回傳每個格子的左緣 */
export function spread(n: number, w: number, x0: number, span: number): number[] {
  const gap = (span - n * w) / (n + 1);
  return Array.from({ length: n }, (_, i) => round(x0 + gap + i * (w + gap)));
}

export const round = (v: number) => Math.round(v * 10) / 10;

/** 菱形（ER 圖的關係） */
export function diamond(cx: number, cy: number, w: number, h: number): string {
  return `M${round(cx)} ${round(cy - h / 2)} L${round(cx + w / 2)} ${round(cy)} L${round(cx)} ${round(cy + h / 2)} L${round(cx - w / 2)} ${round(cy)} Z`;
}

/** 平行的兩條線（ER 圖的完全參與），兩條線相距 2 × off */
export function doubleLine(x1: number, y1: number, x2: number, y2: number, off = 2): string {
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const nx = (-(y2 - y1) / len) * off;
  const ny = ((x2 - x1) / len) * off;
  return `${line(x1 + nx, y1 + ny, x2 + nx, y2 + ny)} ${line(x1 - nx, y1 - ny, x2 - nx, y2 - ny)}`;
}

/** 線段上從 (x1, y1) 走到比例 t 的點，再往法線方向偏移 perp（標基數比用） */
export function along(x1: number, y1: number, x2: number, y2: number, t: number, perp = 0): [number, number] {
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  return [round(x1 + (x2 - x1) * t - ((y2 - y1) / len) * perp), round(y1 + (y2 - y1) * t + ((x2 - x1) / len) * perp)];
}

/** 等寬字（11px，JetBrains Mono 每字約 0.6em）的寬度，用來畫鍵屬性的底線 */
export const monoWidth = (s: string) => s.length * 6.6;
