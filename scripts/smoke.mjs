// 部署後的冒煙測試：對一個已部署的網址檢查關鍵頁面、轉址與標頭。
// 只用 Node 內建模組，CI 不需要安裝依賴。
//
//   node scripts/smoke.mjs [網址] [--expect-sha <commit>] [--wait <秒>]
//
// 不給網址時檢查正式站。給了 --expect-sha 時，先輪詢 /version.txt，
// 等到站上是這個 commit 才開始檢查（最多等 --wait 秒，預設 600）。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(name);
  if (i === -1) return undefined;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
};
const expectSha = opt('--expect-sha');
const wait = Number(opt('--wait') ?? 600);
const base = (args[0] ?? 'https://step-through.cherites.org').replace(/\/$/, '');

const topics = fs
  .readdirSync(path.join(root, 'src/content/topics'), { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name);

const get = (p) => fetch(base + p, { redirect: 'manual', headers: { 'Cache-Control': 'no-cache' } });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (expectSha) {
  const deadline = Date.now() + wait * 1000;
  let live = '';
  for (;;) {
    try {
      const res = await get('/version.txt');
      live = res.ok ? (await res.text()).trim() : `HTTP ${res.status}`;
    } catch (e) {
      live = String(e);
    }
    if (live === expectSha) break;
    if (Date.now() > deadline) {
      console.error(`✕ 等了 ${wait} 秒，站上仍不是 ${expectSha}（目前：${live}）`);
      process.exit(1);
    }
    await sleep(15_000);
  }
  console.log(`✓ 站上已是 ${expectSha}`);
}

let failed = 0;
async function check(name, fn) {
  try {
    await fn();
    console.log(`✓ ${name}`);
  } catch (e) {
    failed++;
    console.error(`✕ ${name}：${e.message}`);
  }
}
const assert = (ok, msg) => {
  if (!ok) throw new Error(msg);
};
const redirectsTo = async (from, to) => {
  const res = await get(from);
  assert(res.status === 301, `狀態 ${res.status}，預期 301`);
  const loc = new URL(res.headers.get('location') ?? '', base + from);
  assert(loc.pathname === to, `轉到 ${loc.pathname}，預期 ${to}`);
};

console.log(`檢查 ${base}`);

await check('/zh-TW/ 回 200、是繁體中文、有安全標頭', async () => {
  const res = await get('/zh-TW/');
  assert(res.status === 200, `狀態 ${res.status}`);
  assert((await res.text()).includes('<html lang="zh-TW"'), '找不到 <html lang="zh-TW">');
  assert(res.headers.get('x-content-type-options') === 'nosniff', '缺少 X-Content-Type-Options');
});
// 網址以 sitemap 為準：單元頁在 /zh-TW/<科目>/<章節>/<主題>/
const sitemap = await (await get('/sitemap-0.xml')).text();
const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
const unitOf = (t) => paths.find((p) => p.endsWith(`/${t}/`) && p.split('/').length === 6);
for (const t of topics) {
  await check(`主題 ${t} 的單元頁在 sitemap 裡`, async () => assert(unitOf(t), '找不到'));
}
await check('sitemap 裡的每個網址都回 200', async () => {
  assert(paths.length > 0, 'sitemap 沒有網址');
  const bad = [];
  for (const p of paths) {
    const res = await get(p);
    if (res.status !== 200) bad.push(`${p} → ${res.status}`);
  }
  assert(!bad.length, bad.join('、'));
});
await check('/ 轉到 /zh-TW/', () => redirectsTo('/', '/zh-TW/'));
await check('/en/ 轉到 /zh-TW/', () => redirectsTo('/en/', '/zh-TW/'));
for (const t of topics) {
  const to = unitOf(t);
  if (!to) continue;
  await check(`v1 的 /zh-TW/${t}/ 轉到 ${to}`, () => redirectsTo(`/zh-TW/${t}/`, to));
  await check(`/en/${t}/ 轉到 ${to}`, () => redirectsTo(`/en/${t}/`, to));
}
await check('不存在的頁面回 404', async () => {
  const res = await get('/zh-TW/no-such-page/');
  assert(res.status === 404, `狀態 ${res.status}`);
});
await check('sitemap 與 robots.txt 可取得', async () => {
  for (const p of ['/sitemap-index.xml', '/sitemap-0.xml', '/robots.txt']) {
    const res = await get(p);
    assert(res.status === 200, `${p} 狀態 ${res.status}`);
  }
});
await check('OG 圖是 PNG 且有快取標頭', async () => {
  const res = await get('/og/zh-TW/home.png');
  assert(res.status === 200, `狀態 ${res.status}`);
  assert(res.headers.get('content-type')?.includes('image/png'), `content-type ${res.headers.get('content-type')}`);
  assert(res.headers.get('cache-control')?.includes('max-age=86400'), `cache-control ${res.headers.get('cache-control')}`);
});

if (failed) {
  console.error(`\n${failed} 項失敗`);
  process.exit(1);
}
console.log('\n全部通過');
