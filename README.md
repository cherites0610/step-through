# 步步看懂（Step Through）

把演算法與資料結構變成可親手操作、逐步前進與倒退的互動視覺化。產品規格見 [PRODUCT.md](PRODUCT.md)，視覺規範見 [DESIGN.md](DESIGN.md)。

## 開發

```sh
pnpm install
pnpm dev        # 開發伺服器
pnpm check      # 型別檢查
pnpm test       # Vitest（核心邏輯）
pnpm build      # 靜態輸出至 dist/
pnpm test:e2e   # Playwright（SEO meta、互動、無障礙 axe）
pnpm fonts      # 重新產生 src/styles/fonts.css（字體 CSS）
pnpm og         # 重新產生 public/og/ 的 OG 圖（需先 pnpm build）
```

技術棧：Astro + Svelte 5 + Tailwind CSS v4 + TypeScript，部署於 Cloudflare Pages。
演算法核心放在 `src/core/<topic>/`，以純 TS 輸出 Step Trace。

## 維護

- **新增主題**：在 `src/content/topics/<主題>/` 加 `zh-TW.mdx` 與 `en.mdx`，並確認主題已登記在 `src/i18n/roadmap.ts`（沒登記會在建置時報錯）。接著執行 `pnpm build && pnpm og` 產生 OG 圖；vitest 會檢查每個主題都有圖。
- **字體**：中文刻意用系統字體（不載入網頁字體），Noto Sans TC 只載入拉丁字母／數字。原因與實測數字見 [DESIGN.md](DESIGN.md) 的 Typography。改了字體相關設定後執行 `pnpm fonts`，vitest 會確認沒有過期。
- **OG 圖**：`pnpm og` 會啟動預覽伺服器，把各頁視覺化舞台截圖後排版；需要本機有繁體中文字體與 Playwright 的 Chromium（`pnpm exec playwright install chromium`）。產出的 PNG 會 commit，所以 CI 與部署不需要 Chromium。

## 部署（Cloudflare Pages）

| 設定 | 值 |
|---|---|
| 建置指令 | `pnpm build` |
| 輸出目錄 | `dist` |
| Node 版本 | 22（`.node-version`） |
| 套件管理 | pnpm（`packageManager` 欄位；Cloudflare 會依 lockfile 偵測） |
| 正式網域 | `step-through.cherites.org`（`astro.config.mjs` 的 `site`） |

- `public/_headers` 設定快取（`/_astro/*` 一年、immutable）與基本安全標頭（nosniff、Referrer-Policy、X-Frame-Options、Permissions-Policy）。
- 404 由 `dist/404.html` 處理；根路徑 `/` 是依瀏覽器語言跳轉的 noindex 頁面（`src/pages/index.astro`）。
- **分析（可選）**：沒設定環境變數就不載入任何分析腳本。在 Cloudflare Pages 的環境變數設定 `PUBLIC_CF_WEB_ANALYTICS_TOKEN`（Cloudflare Web Analytics，只量頁面瀏覽）；之後改用 Umami 則設定 `PUBLIC_UMAMI_SRC` 與 `PUBLIC_UMAMI_WEBSITE_ID`，自訂事件（`track()`，見 `src/lib/analytics.ts`）會自動送出。範例見 `.env.example`。

## 品質檢查（上線前）

- Lighthouse 行動版（模擬慢速 4G）：效能 99、無障礙 100、最佳實務 100、SEO 100（首頁、主題頁、英文版皆量過）。
- 首頁互動 JS 為 0；主題頁約 34～37 KB gzip（目標 < 50 KB）。404 頁的 Lighthouse SEO 較低是預期的（404 狀態且刻意 noindex）。
- `pnpm test:e2e` 含 axe 無障礙掃描（WCAG 2.0／2.1 A 與 AA）：所有頁面、兩種語言、投影模式與互動後的狀態。
