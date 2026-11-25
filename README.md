# 步步看懂（Step Through）

給備考的人（初期以資工所、資管所為主）的科目學習地圖：先選科目，在先修關係圖上看清全貌與進度，再分章節學習觀念、用互動視覺化一步步演練、練考題並自我檢核。產品規格見 [PRODUCT.md](PRODUCT.md)（v2.0 草案），視覺規範見 [DESIGN.md](DESIGN.md)。

> 網址：科目 `/zh-TW/<科目>/`、章節 `/zh-TW/<科目>/<章節>/`、單元 `/zh-TW/<科目>/<章節>/<單元>/`。里程碑進度見 PRODUCT.md。

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
pnpm smoke [網址]  # 對已部署的網站做冒煙測試（預設正式站）
```

技術棧：Astro + Svelte 5 + Tailwind CSS v4 + TypeScript，部署於 Cloudflare Pages。
演算法核心放在 `src/core/<topic>/`，以純 TS 輸出 Step Trace。

## 維護

- **新增主題**：在 `src/content/topics/<主題>/` 加 `zh-TW.mdx`，並在 `src/data/subjects.ts` 對應章節的單元加上 `topic`（沒登記會在建置時報錯）。科目、章節、先修關係也都在這個檔案；學習地圖由先修關係自動排版（`src/core/map/layout.ts`），先修不存在或有環時建置會失敗。接著執行 `pnpm build && pnpm og` 產生 OG 圖；vitest 會檢查每個主題都有圖。主題若曾在 v1 以 `/zh-TW/<主題>/` 上線，`public/_redirects` 要有轉到新網址的一行（vitest 會檢查）。
- **新增考題**：在 `src/content/questions/<科目>/<章節>/` 加一個 MDX（frontmatter 見 `src/content.config.ts`：出處、題型、難度、章內順序；省略出處＝自編題）。內文是題目，詳解寫在 `<Solution>…</Solution>` 裡，章節頁會把它收合起來。指到不存在的章節時建置會失敗。
- **章節的觀念說明**：在 `src/content/chapters/<科目>/<章節>.mdx` 寫一篇（frontmatter 有 `summary`，顯示在章節頁標題下方，也當作頁面描述）。內文用 `###` 分段；標題與單元名稱相同時，章節頁的單元清單會連到那一段。程式碼區塊不上色（偽代碼）。
- **章末自我檢核**：在 `src/data/subjects.ts` 該章的 `checklist` 寫「能……」的具體能力描述。
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
- 404 由 `dist/404.html` 處理；只有繁體中文：`public/_redirects` 把根路徑 `/` 301 到 `/zh-TW/`，已移除的英文版舊網址 `/en/*` 也 301 到對應的中文頁。`src/pages/index.astro` 是本機預覽用的備援跳轉頁（noindex）。
- **分析（可選）**：沒設定環境變數就不載入任何分析腳本。在 Cloudflare Pages 的環境變數設定 `PUBLIC_CF_WEB_ANALYTICS_TOKEN`（Cloudflare Web Analytics，只量頁面瀏覽）；之後改用 Umami 則設定 `PUBLIC_UMAMI_SRC` 與 `PUBLIC_UMAMI_WEBSITE_ID`，自訂事件（`track()`，見 `src/lib/analytics.ts`）會自動送出。範例見 `.env.example`。

## CI/CD

```
開分支 → push（Cloudflare Pages 自動產生預覽站）→ 開 PR（CI 執行）
       → CI 通過 → 合併到 master → Pages 部署正式站 → 冒煙測試
```

- **CI**（`.github/workflows/ci.yml`）：PR 與 push 到 master 時執行型別檢查、Vitest、建置、Playwright。只建置一次（Playwright 在 CI 直接預覽 `dist/`）；Chromium 依版本快取；同一 PR 的舊執行會被取消；e2e 失敗時重試一次並上傳報告與 trace（Actions 頁面的 artifact `playwright-report`）。
- **CD**：Cloudflare Pages 的 Git 整合。master 部署正式站，其他分支部署預覽站（網址在 PR 的 Cloudflare Pages 檢查裡）。Pages 不會等 CI，所以由 master 的保護規則把關：合併前必須開 PR，且 CI 的 `test` 檢查必須通過。
- **冒煙測試**（`.github/workflows/smoke.yml`、`scripts/smoke.mjs`）：master 更新後，輪詢正式站的 `/version.txt`（內容是 Cloudflare 建置時的 commit SHA），等到換成這個 commit 才檢查關鍵頁面、轉址、404、sitemap 與標頭；10 分鐘內沒換上（例如 Pages 建置失敗）也算失敗，GitHub 會寄信通知。也可以在 Actions 頁面手動執行並填入預覽站網址，或在本機執行 `pnpm smoke <網址>`。
- **依賴更新**（`.github/dependabot.yml`）：每月一次；npm 的 minor／patch 合成一個 PR，major 各自一個；新版發布滿 7 天才提。GitHub Actions 的版本更新也合成一個 PR。CI 通過即可合併。

## 品質檢查（上線前）

- Lighthouse 行動版（模擬慢速 4G）：效能 99、無障礙 100、最佳實務 100、SEO 100（首頁、主題頁皆量過；當時含英文版）。
- 首頁互動 JS 為 0；主題頁約 34～37 KB gzip（目標 < 50 KB）。404 頁的 Lighthouse SEO 較低是預期的（404 狀態且刻意 noindex）。
- `pnpm test:e2e` 含 axe 無障礙掃描（WCAG 2.0／2.1 A 與 AA）：所有頁面與互動後的狀態。
