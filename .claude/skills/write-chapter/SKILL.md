---
name: write-chapter
description: 撰寫或改寫某個科目某一章的內容（觀念說明、圖、考題、章末檢核），品質要和資料結構第 1 章一樣。使用者說「寫第 N 章」「寫○○這一章」「補章節內容」「改寫觀念說明」「加考題」時使用。
---

# write-chapter：照守則寫一章

守則在 `docs/content-guide.md`，範本是資料結構第 1 章（`src/content/chapters/data-structures/basics.mdx`、`src/content/questions/data-structures/basics/`、`src/components/content/figures/`）。開始前兩者都要完整讀過；守則與這份流程衝突時以守則為準。

## 流程

1. **確認範圍**：讀 `src/data/subjects.ts` 裡這一章的單元與先修，以及先修章節已寫好的內容（可以引用，不要重複講）。單元的切法若不合理，先提出調整建議，等使用者同意再動。
2. **開分支**：`git fetch origin && git switch -c <科目>-<章節> origin/master`。
3. **列大綱再寫**：每個單元一個 `###`；每段照「為什麼需要 → 白話意思 → 定義 → 例子 → 反例或限制」安排，並標出要畫圖的位置與要出的考題。
4. **寫觀念說明**：每個符號第一次出現就說明；推導寫成「目標 → 想法 → 步驟 → 結論」，不跳步。
5. **畫圖**：元件放 `src/components/content/figures/`，座標由函數計算，在 `src/components/content/index.ts` 登記；圖號「章-序號」連續。
6. **出題**：8～12 題由易到難；每個數字答案都先寫程式驗算（驗算程式放 `/tmp`，用 `python3 -I` 或以 vitest 跑 `src/core/` 的 Step Trace），驗算不出乾淨答案的題目就刪掉或改題。
7. **章末檢核與專有名詞**：更新 `subjects.ts` 的 `checklist`（4～6 條「能……」）；觀念說明最後加 `### 專有名詞` 表（名詞 | 英文 | 說明），收齊正文以粗體加英文引入的名詞（守則 4.4）。
8. **檢查**：`pnpm check && pnpm test && pnpm build`，再跑 `pnpm test:e2e`。用 Playwright 截圖（桌機 1280、`devices['iPhone 13']`），逐張看圖與長公式；預覽伺服器用 `node node_modules/astro/bin/astro.mjs preview --port <埠> --ignore-lock` 啟動，結束時關掉。每次 `page.goto` 之後先等 `document.documentElement.dataset.scrollGuard !== 'on'`（新頁面從頂端開始的保護，見 Base.astro），否則捲動會被拉回頂端、截到空白。
9. **自我審閱**：從頭讀一遍，逐段問「第一次讀的人跟得上嗎？」，把跳步的地方補上。
10. **交付**：照 `ship` skill 開 PR。PR 描述要列出：每個單元寫了什麼、圖的清單、題目清單（題型與難度）、**驗算了哪些答案**、使用者需要校訂的地方。

## 不要

- 不要用 `$…$` 寫公式、不要手寫圖的座標、不要加新顏色。
- 不要寫沒有驗算過的數字答案。
- 不要把考古題原文放進題目（授權未定，見 PRODUCT.md 待決事項）。
