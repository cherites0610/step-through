/**
 * 產生每一頁的 Open Graph 圖：public/og/<語系>/<主題>.png（與 home.png），1200×630。
 *
 * 內容是真實的畫面——腳本啟動預覽伺服器，把各主題頁的視覺化舞台（.plate）截下來，
 * 再和標題、章節標籤排成「圖版」風格（紙面、髮絲線框、四角套準十字）。
 *
 * 用法：
 *   pnpm build && pnpm og
 *
 * 需要本機有繁體中文字體（Windows 的微軟正黑體、macOS 的蘋方）與 Playwright 的 Chromium。
 * 產出的 PNG 會 commit 進 repo，所以 CI／Cloudflare 建置時不需要 Chromium。
 * 新增主題或改了標題／畫面後，重新執行一次即可（vitest 會檢查每個主題都有圖）。
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(root, 'dist');
const OUT = path.join(root, 'public/og');
const PORT = 4397;
const BASE = `http://localhost:${PORT}`;
const LANGS = ['zh-TW', 'en'];

if (!fs.existsSync(path.join(DIST, 'zh-TW/index.html'))) {
  console.error('找不到 dist/，請先執行 pnpm build');
  process.exit(1);
}

const fontData = (pkg, file) =>
  `data:font/woff2;base64,${fs.readFileSync(path.join(root, 'node_modules', pkg, 'files', file)).toString('base64')}`;
const FONTS = `
@font-face{font-family:'JB';font-weight:400;src:url(${fontData('@fontsource/jetbrains-mono', 'jetbrains-mono-latin-400-normal.woff2')}) format('woff2')}
@font-face{font-family:'JB';font-weight:500;src:url(${fontData('@fontsource/jetbrains-mono', 'jetbrains-mono-latin-500-normal.woff2')}) format('woff2')}
@font-face{font-family:'NT';font-weight:400;src:url(${fontData('@fontsource/noto-sans-tc', 'noto-sans-tc-latin-400-normal.woff2')}) format('woff2')}
@font-face{font-family:'NT';font-weight:500;src:url(${fontData('@fontsource/noto-sans-tc', 'noto-sans-tc-latin-500-normal.woff2')}) format('woff2')}
`;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

/** 標題依長度縮放，讓它放得進左欄 */
const titleSize = (s) => {
  const w = [...s].reduce((n, ch) => n + (/[⺀-鿿＀-￯]/.test(ch) ? 1 : 0.55), 0);
  return w <= 6 ? 104 : w <= 9 ? 88 : w <= 12 ? 72 : w <= 17 ? 58 : 48;
};

/** 首頁的兩行標題：字級取「最長一行剛好放得進左欄」，並限制在 40～64px */
const fitSize = (title) => {
  const longest = Math.max(...title.split('\n').map((l) => [...l].reduce((n, ch) => n + (/[\u2E80-\u9FFF\uFF00-\uFFEF]/.test(ch) ? 1 : 0.55), 0)));
  return Math.max(40, Math.min(64, Math.floor(500 / longest)));
};

function html({ label, title, sub, plate, brand, url, big, meta }) {
  const size = big ? fitSize(title) : titleSize(title.replace(/\n/g, ''));
  const reg = (pos) => `<i class="reg ${pos}"></i>`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
${FONTS}
*{box-sizing:border-box}
body{margin:0;width:1200px;height:630px;position:relative;overflow:hidden;background:#F5F4F6;color:#16181A;
  font-family:'NT','PingFang TC','Microsoft JhengHei','Noto Sans CJK TC',sans-serif}
.dots{position:absolute;inset:0;background-image:radial-gradient(#C9C7C4 1px,transparent 1px);background-size:20px 20px;opacity:.55}
.frame{position:absolute;inset:28px;border:1px solid #C9C7C4;background:transparent}
.reg{position:absolute;width:14px;height:14px;
  background:linear-gradient(#16181A,#16181A) center/100% 1px no-repeat,linear-gradient(#16181A,#16181A) center/1px 100% no-repeat}
.reg.tl{left:21px;top:21px}.reg.tr{right:21px;top:21px}.reg.bl{left:21px;bottom:21px}.reg.br{right:21px;bottom:21px}
.col{position:absolute;left:76px;top:84px;width:520px;bottom:76px}
.label{font:500 22px/1 'JB',monospace;letter-spacing:.14em;text-transform:uppercase}
h1{margin:34px 0 0;font-weight:400;font-size:${size}px;line-height:1.08;letter-spacing:-.02em;white-space:pre-line}
.meta{margin-top:22px;font:400 22px/1.3 'JB',monospace;letter-spacing:.02em}
.sub{margin-top:26px;font:400 ${big ? 26 : 30}px/1.35 ${big ? "'NT','PingFang TC','Microsoft JhengHei',sans-serif" : "'JB',monospace"};max-width:500px}
.brand{position:absolute;left:0;bottom:0;font-weight:500;font-size:30px}
.url{font:400 19px/1 'JB',monospace;margin-top:12px}
.plate{position:absolute;right:68px;top:50%;transform:translateY(-50%);width:520px;border:1px solid #16181A;background:#F5F4F6}
.plate img{display:block;width:100%}
</style></head><body>
<div class="dots"></div><div class="frame"></div>${reg('tl')}${reg('tr')}${reg('bl')}${reg('br')}
<div class="col">
  <div class="label">${esc(label)}</div>
  <h1>${esc(title)}</h1>
  ${sub ? `<div class="sub">${esc(sub)}</div>` : ''}
  ${meta ? `<div class="meta">${esc(meta)}</div>` : ''}
  <div class="brand">${esc(brand)}<div class="url">${esc(url)}</div></div>
</div>
<div class="plate"><img src="${plate}"></div>
</body></html>`;
}

async function startServer() {
  const child = spawn('pnpm', ['exec', 'astro', 'preview', '--port', String(PORT), '--strictPort'], {
    cwd: root,
    shell: true,
    stdio: 'ignore',
  });
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(`${BASE}/zh-TW/`)).ok) return child;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  child.kill();
  throw new Error('預覽伺服器沒有啟動');
}

const stopServer = (child) => {
  try {
    if (process.platform === 'win32') spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    else child.kill();
  } catch {}
};

const topicsOf = (lang) =>
  fs
    .readdirSync(path.join(DIST, lang), { withFileTypes: true })
    .filter((e) => e.isDirectory() && fs.existsSync(path.join(DIST, lang, e.name, 'index.html')))
    .map((e) => e.name);

async function hydrated(page) {
  await page.waitForFunction(() => !document.querySelector('astro-island[ssr]'));
}

const server = await startServer();
const browser = await chromium.launch();
try {
  const shot = await browser.newPage({ viewport: { width: 1280, height: 1000 }, deviceScaleFactor: 2 });
  // 固定在視窗下方的播放列會蓋在舞台上，截圖時隱藏
  // 只讓它透明（display:none 會連時間軸一起從無障礙樹移除，就無法操作了）
  const hidePlayerBar = () => shot.addStyleTag({ content: '[role="group"][aria-label="player"]{opacity:0 !important}' });
  const compose = await browser.newPage({ viewport: { width: 1200, height: 630 } });

  for (const lang of LANGS) {
    fs.mkdirSync(path.join(OUT, lang), { recursive: true });
    const brand = lang === 'en' ? 'Step Through' : '步步看懂  Step Through';
    const url = 'step-through.cherites.org';

    // 首頁：首屏標本
    await shot.goto(`${BASE}/${lang}/`);
    await hydrated(shot);
    const homePlate = await shot.locator('figure > div').first().screenshot();
    const lines = await shot.locator('h1 > span').allInnerTexts();
    // 副標用 <title> 裡的 tagline（「站名｜tagline」），比首頁導言短
    const lead = ((await shot.title()).split('｜')[1] ?? '').trim();
    await compose.setContent(
      html({
        label: 'Plate 00',
        title: lines.join('\n'),
        sub: lead,
        plate: `data:image/png;base64,${homePlate.toString('base64')}`,
        brand,
        url,
        big: true,
      }),
    );
    await compose.screenshot({ path: path.join(OUT, lang, 'home.png') });

    for (const topic of topicsOf(lang)) {
      await shot.goto(`${BASE}/${lang}/${topic}/`);
      await hydrated(shot);
      await hidePlayerBar();
      const slider = shot.getByRole('slider').first();
      const max = Number(await slider.getAttribute('max'));
      // 選一個有代表性的步驟：AVL 取第一次失衡，其餘取約 40% 處
      let step = Math.round(max * 0.4);
      if (topic === 'avl-insert') {
        for (let i = 0; i <= max; i++) {
          await slider.fill(String(i));
          if (/失衡|unbalanced/.test(await shot.locator('aside p[aria-live]').innerText())) {
            step = i;
            break;
          }
        }
      }
      await slider.fill(String(step));
      await shot.waitForTimeout(700); // 等旋轉動畫結束
      const plate = await shot.locator('.plate').first().screenshot();
      const title = (await shot.locator('h1').first().innerText()).trim();
      const titleEn = (await shot.locator('main p.font-mono').first().innerText()).trim();
      const label = (await shot.locator('header span.font-mono').first().textContent()).trim();
      const rows = (await shot.locator('article > table tbody tr').allInnerTexts()).map((r) => r.split(/\t|\n/).map((x) => x.trim()).filter(Boolean));
      const avg = rows[1];
      const worst = rows[2];
      const meta = avg && worst ? `${avg[0]} ${avg[1]}   ${worst[0]} ${worst[1]}` : '';
      await compose.setContent(
        html({
          label,
          title,
          sub: lang === 'en' ? '' : titleEn,
          meta,
          plate: `data:image/png;base64,${plate.toString('base64')}`,
          brand,
          url,
        }),
      );
      const file = path.join(OUT, lang, `${topic}.png`);
      await compose.screenshot({ path: file });
      console.log(`${lang}/${topic}.png  ${(fs.statSync(file).size / 1024).toFixed(0)} KB  （第 ${step + 1} 步）`);
    }
    console.log(`${lang}/home.png  ${(fs.statSync(path.join(OUT, lang, 'home.png')).size / 1024).toFixed(0)} KB`);
  }
} finally {
  await browser.close();
  stopServer(server);
}
