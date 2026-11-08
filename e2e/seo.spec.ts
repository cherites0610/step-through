import { expect, test } from './fixtures';
import type { Page } from '@playwright/test';

const SITE = 'https://step-through.cherites.org';
const topics = ['insertion-sort', 'bubble-sort', 'selection-sort', 'merge-sort', 'quick-sort', 'avl-insert'];

const meta = (page: Page, sel: string) => page.locator(sel).first().getAttribute('content');
const ldTypes = (page: Page) =>
  page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((els: Element[]) => els.map((e) => JSON.parse(e.textContent ?? '{}')['@type']));

test('首頁有 title、description、canonical 與 hreflang', async ({ page }) => {
  await page.goto('/zh-TW/');
  await expect(page).toHaveTitle(/步步看懂/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  // zh-TW、en 與 x-default
  await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(3);
  await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute('href', `${SITE}/zh-TW/`);
});

for (const lang of ['zh-TW', 'en']) {
  const locale = lang === 'zh-TW' ? 'zh_TW' : 'en_US';
  const other = lang === 'zh-TW' ? 'en_US' : 'zh_TW';

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
      // og:locale 是 zh_TW／en_US（底線），不是 hreflang 的連字號
      expect(await meta(page, 'meta[property="og:locale"]')).toBe(locale);
      expect(await meta(page, 'meta[property="og:locale:alternate"]')).toBe(other);
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
      expect(bc.itemListElement.map((i: { position: number }) => i.position)).toEqual([1, 2]);
      expect(bc.itemListElement[1].item).toBe(`${SITE}/${lang}/${slug}/`);
    });
  }
}

test('站內沒有設定分析時，不載入任何分析腳本', async ({ page }) => {
  await page.goto('/zh-TW/quick-sort/');
  const html = await page.content();
  expect(html).not.toContain('cloudflareinsights');
  expect(html).not.toContain('umami');
});

test('sitemap：每個網址都有 hreflang alternate，且不含根路徑與 404', async ({ request }) => {
  const index = await (await request.get('/sitemap-index.xml')).text();
  expect(index).toContain('sitemap-0.xml');
  const xml = await (await request.get('/sitemap-0.xml')).text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

  expect(locs).toHaveLength(2 * (topics.length + 1));
  expect(locs).not.toContain(`${SITE}/`);
  expect(locs.some((l) => l.includes('404'))).toBe(false);
  for (const l of ['zh-TW', 'en']) {
    expect(locs).toContain(`${SITE}/${l}/`);
    for (const t of topics) expect(locs).toContain(`${SITE}/${l}/${t}/`);
  }
  // 每個 <url> 都有兩個語系的 alternate
  const urls = xml.split('<url>').slice(1);
  for (const u of urls) {
    expect(u).toContain('hreflang="zh-TW"');
    expect(u).toContain('hreflang="en"');
  }
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
  await expect(page.getByRole('link', { name: /Back to home/ })).toHaveAttribute('href', '/en/');
});

test('根路徑 / 是 noindex 的跳轉頁，canonical 指向 zh-TW', async ({ request }) => {
  const html = await (await request.get('/')).text();
  expect(html).toContain('name="robots" content="noindex"');
  expect(html).toContain(`rel="canonical" href="${SITE}/zh-TW/"`);
  expect(html).toContain('hreflang="x-default"');
});

test.describe('上一個／下一個主題', () => {
  test('依路線圖順序，頭尾各缺一邊', async ({ page }) => {
    await page.goto('/zh-TW/insertion-sort/');
    const nav = page.getByRole('navigation', { name: '上一個與下一個主題' });
    await expect(nav.getByRole('link')).toHaveCount(1);
    await expect(nav.getByRole('link', { name: /氣泡排序/ })).toHaveAttribute('href', '/zh-TW/bubble-sort/');

    await page.goto('/zh-TW/quick-sort/');
    const mid = page.getByRole('navigation', { name: '上一個與下一個主題' });
    await expect(mid.getByRole('link', { name: /合併排序/ })).toHaveAttribute('href', '/zh-TW/merge-sort/');
    await expect(mid.getByRole('link', { name: /AVL 樹插入/ })).toHaveAttribute('href', '/zh-TW/avl-insert/');

    await page.goto('/en/avl-insert/');
    const last = page.getByRole('navigation', { name: 'Previous and next topic' });
    await expect(last.getByRole('link')).toHaveCount(1);
    await expect(last.getByRole('link', { name: /Quick Sort/ })).toHaveAttribute('href', '/en/quick-sort/');
  });
});

test('Google Search Console 驗證檔：根目錄可取得，內容與檔名一致', async ({ request }) => {
  const res = await request.get('/google61a314138f530891.html');
  expect(res.status()).toBe(200);
  expect((await res.text()).trim()).toBe('google-site-verification: google61a314138f530891.html');
});
