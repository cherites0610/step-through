import { expect, test } from './fixtures';
import type { Page } from '@playwright/test';

const SITE = 'https://step-through.cherites.org';
const topics = ['insertion-sort', 'bubble-sort', 'selection-sort', 'merge-sort', 'quick-sort', 'avl-insert'];
const subjects = [
  'data-structures',
  'algorithms',
  'operating-systems',
  'computer-organization',
  'discrete-math',
  'linear-algebra',
  'databases',
  'intro-cs',
];

const meta = (page: Page, sel: string) => page.locator(sel).first().getAttribute('content');
const ldTypes = (page: Page) =>
  page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((els: Element[]) => els.map((e) => JSON.parse(e.textContent ?? '{}')['@type']));

test('首頁有 title、description、canonical，沒有 hreflang', async ({ page }) => {
  await page.goto('/zh-TW/');
  await expect(page).toHaveTitle(/步步看懂/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  // 只有一個語系，不輸出 hreflang
  await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0);
});

{
  const lang = 'zh-TW';

  for (const slug of ['', ...topics.map((t) => `${t}/`)]) {
    const label = slug || 'home';
    test(`${lang}/${label}：Open Graph、Twitter card 與 OG 圖`, async ({ page, request }) => {
      await page.goto(`/${lang}/${slug}`);
      const expectedImage = `${SITE}/og/${lang}/${slug ? slug.replace('/', '') : 'home'}.png`;

      expect(await meta(page, 'meta[property="og:image"]')).toBe(expectedImage);
      expect(await meta(page, 'meta[property="og:image:width"]')).toBe('1200');
      expect(await meta(page, 'meta[property="og:image:height"]')).toBe('630');
      expect(await meta(page, 'meta[property="og:image:alt"]')).toBeTruthy();
      expect(await meta(page, 'meta[property="og:type"]')).toBe(slug ? 'article' : 'website');
      expect(await meta(page, 'meta[property="og:site_name"]')).toBeTruthy();
      // og:locale 是 zh_TW（底線），不是 lang 的連字號
      expect(await meta(page, 'meta[property="og:locale"]')).toBe('zh_TW');
      await expect(page.locator('meta[property="og:locale:alternate"]')).toHaveCount(0);
      expect(await meta(page, 'meta[name="twitter:card"]')).toBe('summary_large_image');
      expect(await meta(page, 'meta[name="twitter:image"]')).toBe(expectedImage);
      expect(await meta(page, 'meta[name="theme-color"]')).toBe('#F5F4F6');
      expect(await meta(page, 'meta[property="og:url"]')).toBe(`${SITE}/${lang}/${slug}`);

      // 圖真的存在且是 PNG（用站內路徑請求，因為測試伺服器不是正式網域）
      const res = await request.get(new URL(expectedImage).pathname);
      expect(res.status()).toBe(200);
      expect(res.headers()['content-type']).toContain('image/png');
    });
  }

  for (const slug of topics) {
    test(`${lang}/${slug}：結構化資料 LearningResource、FAQPage、BreadcrumbList`, async ({ page }) => {
      await page.goto(`/${lang}/${slug}/`);
      expect(await ldTypes(page)).toEqual(['LearningResource', 'BreadcrumbList', 'FAQPage']);

      const lr = await page.locator('script[type="application/ld+json"]').first().evaluate((e) => JSON.parse(e.textContent!));
      expect(lr.inLanguage).toBe(lang);
      expect(lr.image).toBe(`${SITE}/og/${lang}/${slug}.png`);
      expect(lr.isAccessibleForFree).toBe(true);
      expect(lr.url).toBe(`${SITE}/${lang}/${slug}/`);

      const bc = await page.locator('script[type="application/ld+json"]').nth(1).evaluate((e) => JSON.parse(e.textContent!));
      expect(bc.itemListElement.map((i: { position: number }) => i.position)).toEqual([1, 2, 3]);
      expect(bc.itemListElement[1].item).toBe(`${SITE}/${lang}/data-structures/`);
      expect(bc.itemListElement[2].item).toBe(`${SITE}/${lang}/${slug}/`);
    });
  }
}

test('站內沒有設定分析時，不載入任何分析腳本', async ({ page }) => {
  await page.goto('/zh-TW/quick-sort/');
  const html = await page.content();
  expect(html).not.toContain('cloudflareinsights');
  expect(html).not.toContain('umami');
});

test('sitemap：只有 zh-TW 網址，不含根路徑、404 與英文頁', async ({ request }) => {
  const index = await (await request.get('/sitemap-index.xml')).text();
  expect(index).toContain('sitemap-0.xml');
  const xml = await (await request.get('/sitemap-0.xml')).text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

  expect(locs).toHaveLength(topics.length + subjects.length + 1);
  expect(locs).not.toContain(`${SITE}/`);
  expect(locs.some((l) => l.includes('404'))).toBe(false);
  expect(locs).toContain(`${SITE}/zh-TW/`);
  for (const t of [...topics, ...subjects]) expect(locs).toContain(`${SITE}/zh-TW/${t}/`);
  expect(xml).not.toContain('/en/');
  expect(xml).not.toContain('hreflang');
});

test('英文頁已移除：/en/ 不存在，_redirects 把舊網址 301 到對應的中文頁', async ({ request }) => {
  for (const url of ['/en/', ...topics.map((t) => `/en/${t}/`)]) {
    expect((await request.get(url)).status()).toBe(404);
  }
  // 本機預覽不處理 _redirects，只檢查檔案內容；正式環境由 Cloudflare Pages 執行
  const rules = (await (await request.get('/_redirects')).text())
    .split('\n')
    .filter((l) => l.trim() && !l.startsWith('#'))
    .map((l) => l.trim().split(/\s+/));
  expect(rules).toContainEqual(['/', '/zh-TW/', '301']);
  expect(rules).toContainEqual(['/en', '/zh-TW/', '301']);
  expect(rules).toContainEqual(['/en/*', '/zh-TW/:splat', '301']);
});

test('robots.txt 指向 sitemap', async ({ request }) => {
  const txt = await (await request.get('/robots.txt')).text();
  expect(txt).toContain(`Sitemap: ${SITE}/sitemap-index.xml`);
});

test('404：回傳 404 狀態、noindex、沒有 canonical，並提供回首頁連結', async ({ page, request }) => {
  const res = await request.get('/zh-TW/no-such-topic/');
  expect(res.status()).toBe(404);
  await page.goto('/404.html');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('找不到這一頁');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0);
  await expect(page.getByRole('link', { name: '回到首頁' })).toHaveAttribute('href', '/zh-TW/');
});

test('根路徑 / 是 noindex 的跳轉頁，canonical 指向 zh-TW', async ({ request }) => {
  const html = await (await request.get('/')).text();
  expect(html).toContain('name="robots" content="noindex"');
  expect(html).toContain(`rel="canonical" href="${SITE}/zh-TW/"`);
  expect(html).not.toContain('hreflang');
});

test.describe('上一個／下一個主題', () => {
  test('依章節編號與章內順序（08 平衡搜尋樹在 10 排序之前），頭尾各缺一邊', async ({ page }) => {
    const nav = () => page.getByRole('navigation', { name: '上一個與下一個主題' });
    await page.goto('/zh-TW/avl-insert/');
    await expect(nav().getByRole('link')).toHaveCount(1);
    await expect(nav().getByRole('link', { name: /插入排序/ })).toHaveAttribute('href', '/zh-TW/insertion-sort/');

    await page.goto('/zh-TW/insertion-sort/');
    await expect(nav().getByRole('link', { name: /AVL 樹插入/ })).toHaveAttribute('href', '/zh-TW/avl-insert/');
    await expect(nav().getByRole('link', { name: /氣泡排序/ })).toHaveAttribute('href', '/zh-TW/bubble-sort/');

    await page.goto('/zh-TW/quick-sort/');
    await expect(nav().getByRole('link')).toHaveCount(1);
    await expect(nav().getByRole('link', { name: /合併排序/ })).toHaveAttribute('href', '/zh-TW/merge-sort/');
  });
});

test('Google Search Console 驗證檔：根目錄可取得，內容與檔名一致', async ({ request }) => {
  const res = await request.get('/google61a314138f530891.html');
  expect(res.status()).toBe(200);
  expect((await res.text()).trim()).toBe('google-site-verification: google61a314138f530891.html');
});
