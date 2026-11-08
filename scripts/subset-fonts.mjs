/**
 * 產生 src/styles/fonts.css：只包含網站實際用到字元的 @font-face。
 *
 * 為什麼：自架的 Noto Sans TC 有約 200 個 unicode-range 切片。網站用到約 1000 個不同的中文字，
 * 會一次下載 25 個、約 800 KB 的字體檔，Lighthouse 行動版（模擬慢速 4G）效能只有 63、LCP 6.2 秒。
 * 所以**刻意不載入中文切片**：中文內文用系統的繁體中文字體（見 global.css 的 --font-sans），
 * Noto Sans TC 只負責拉丁字母與數字（內文裡的英文），JetBrains Mono 負責等寬字。
 * 效能 99、LCP 1.8 秒。其餘切片再依網站實際用到的字元過濾，並只留 woff2。
 *
 * 用法：
 *   pnpm fonts          重新產生 src/styles/fonts.css
 *   pnpm fonts --check  只檢查是否過期（vitest 也會檢查）
 *
 * 新增了含新字的文案後若測試提示過期，執行 pnpm fonts 即可。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(root, 'src/styles/fonts.css');

const SOURCES = [
  { pkg: '@fontsource/noto-sans-tc', css: ['400.css', '500.css'] },
  { pkg: '@fontsource/jetbrains-mono', css: ['latin-400.css', 'latin-500.css'] },
];

/** 掃描這些資料夾裡的文字檔，收集用到的字元 */
const SCAN_DIRS = ['src', 'public'];
const SCAN_EXT = new Set(['.astro', '.svelte', '.ts', '.js', '.mdx', '.md', '.css', '.json', '.txt', '.svg']);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist') continue;
      walk(p, out);
    } else if (SCAN_EXT.has(path.extname(entry.name)) && path.basename(p) !== 'fonts.css') out.push(p);
  }
  return out;
}

export function collectChars() {
  const chars = new Set();
  for (const dir of SCAN_DIRS) {
    const abs = path.join(root, dir);
    if (!fs.existsSync(abs)) continue;
    for (const file of walk(abs)) {
      for (const ch of fs.readFileSync(file, 'utf8')) chars.add(ch.codePointAt(0));
    }
  }
  return chars;
}

/** 'U+4E00-4E3F, U+4E59, U+4E??' → [[lo, hi], ...] */
export function parseRanges(list) {
  return list
    .split(',')
    .map((s) => s.trim().replace(/^U\+/i, ''))
    .filter(Boolean)
    .map((tok) => {
      if (tok.includes('?')) return [parseInt(tok.replace(/\?/g, '0'), 16), parseInt(tok.replace(/\?/g, 'F'), 16)];
      const [a, b] = tok.split('-');
      return [parseInt(a, 16), parseInt(b ?? a, 16)];
    });
}

const intersects = (ranges, chars) => ranges.some(([lo, hi]) => [...chars].some((c) => c >= lo && c <= hi));

/** 中文（CJK）切片的名稱形如 noto-sans-tc-[94]-400-normal；拉丁字母的是 noto-sans-tc-latin-400-normal */
export const isCjkSlice = (label) => /noto-sans-tc-\[\d+\]-/.test(label);

export function buildCss() {
  const chars = collectChars();
  const blocks = [];
  let total = 0;
  for (const { pkg, css } of SOURCES) {
    for (const file of css) {
      const text = fs.readFileSync(path.join(root, 'node_modules', pkg, file), 'utf8');
      for (const m of text.matchAll(/\/\*\s*([^*]+?)\s*\*\/\s*@font-face\s*\{([^}]*)\}/g)) {
        total++;
        const [, label, body] = m;
        if (isCjkSlice(label)) continue; // 刻意不載入：改用系統中文字體
        const range = body.match(/unicode-range:\s*([^;]+);/)?.[1];
        // 沒有 unicode-range 的規則（理論上不會有）一律保留
        if (range && !intersects(parseRanges(range), chars)) continue;
        const woff2 = body.match(/url\(([^)]+\.woff2)\)\s*format\('woff2'\)/)?.[1];
        if (!woff2) continue;
        const family = body.match(/font-family:\s*([^;]+);/)[1].trim();
        const weight = body.match(/font-weight:\s*([^;]+);/)[1].trim();
        const url = `../../node_modules/${pkg}/${woff2.replace(/^\.\//, '')}`;
        blocks.push(
          `/* ${label} */\n@font-face{font-family:${family};font-style:normal;font-display:swap;font-weight:${weight};src:url(${url}) format('woff2');${
            range ? `unicode-range:${range.replace(/\s+/g, '')};` : ''
          }}`,
        );
      }
    }
  }
  const header = `/* 由 scripts/subset-fonts.mjs 產生，請勿手動修改（pnpm fonts）。\n * 只含網站用到字元的切片：${blocks.length} / ${total}。 */\n`;
  return { css: header + blocks.join('\n') + '\n', kept: blocks.length, total };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { css, kept, total } = buildCss();
  if (process.argv.includes('--check')) {
    const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
    if (current.replace(/\r\n/g, '\n') !== css) {
      console.error('src/styles/fonts.css 已過期，請執行 pnpm fonts');
      process.exit(1);
    }
    console.log(`fonts.css 是最新的（${kept}/${total} 個切片）`);
  } else {
    fs.writeFileSync(OUT, css);
    console.log(`已產生 ${path.relative(root, OUT)}：保留 ${kept} / ${total} 個切片，${css.length} bytes`);
  }
}
