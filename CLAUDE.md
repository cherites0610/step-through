# 步步看懂（Step Through）

產品規格見 [PRODUCT.md](PRODUCT.md)，視覺規範見 [DESIGN.md](DESIGN.md)，開發指令與 CI/CD 見 [README.md](README.md)。

## 慣例

- 回覆、文件、程式碼註解、commit 訊息、PR 一律使用繁體中文（台灣用語），專有名詞依 PRODUCT.md 的用語規則。
- 網站只有繁體中文（zh-TW）；不要新增英文頁面或其他語系。
- commit 與 PR 不加 `Co-Authored-By` 或任何 Claude／AI 署名。

## 撰寫章節內容

寫或改任何章節的觀念說明、圖、考題、章末檢核時，一律用 `write-chapter` skill（`.claude/skills/write-chapter/SKILL.md`），並遵守 `docs/content-guide.md`；品質以資料結構第 1 章為準。

## 交付變更

master 受保護：只能透過 PR 合併，且 CI 的 `test` 必須通過。交付變更一律用 `ship` skill（`.claude/skills/ship/SKILL.md`）：開分支 → PR → 等 CI 與 Cloudflare Pages 預覽 → 把預覽網址交給使用者確認 → **使用者明確同意後**才合併 → 確認正式站的冒煙測試通過。
