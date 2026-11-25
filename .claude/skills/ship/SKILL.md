---
name: ship
description: 把這個 repo 的變更交付上線：開分支、commit、push、開 PR，等 CI 與 Cloudflare Pages 預覽完成後把預覽網址交給使用者確認，使用者明確同意後才合併，再確認正式站的冒煙測試通過。改完程式碼或文件要交付、使用者說「發 PR」「開 PR」「上線」「合併」「確認可以」時使用。
---

# ship：PR → 預覽確認 → 合併 → 上線驗證

流程與 CI/CD 的背景見 README 的「CI/CD」。master 有保護規則：必須透過 PR、CI 的 `test` 必須通過；不能直接 push、不能 force push。

## 準備

- `gh` 在 `~/.local/bin`（已用使用者帳號登入），指令前先 `export PATH=$HOME/.local/bin:$PATH`。
- `gh` 偶爾會在輸出中附上 `gh event listen` 的提示，忽略即可。
- git 作者已設在 repo 的 local config（`cherites <cherites0610@gmail.com>`）。

## 1. 分支與 commit

1. 不在 master 上改。從最新的 master 開分支：`git fetch origin && git switch -c <kebab-case 名稱> origin/master`。已經在功能分支上就沿用。
2. 本機先跑 `pnpm check && pnpm test && pnpm build`；動到頁面或互動時再跑 `pnpm test:e2e`。失敗就先修好。
3. commit 訊息用繁體中文：第一行是摘要，空一行後用條列寫重點（參考 `git log`）。**不要**加 `Co-Authored-By` 或任何 Claude／AI 署名。不同性質的變更拆成不同 commit。
4. `git push -u origin <分支>`；網路錯誤時以 2、4、8、16 秒間隔最多重試 4 次。

## 2. 開 PR

- 這個分支已經有開著的 PR 就沿用（`gh pr view --json number,url`），push 後它會自動更新。
- 否則 `gh pr create --base master --title "<繁中標題>" --body-file <檔案>`。內文用繁體中文，包含「摘要」「變更」「測試」三段，「測試」寫實際跑過的指令與結果。**不要**加 Claude／AI 署名。

## 3. 等 CI 與預覽

1. 用背景執行等待所有檢查完成：`gh pr checks <n> --watch --interval 20`（完成時會通知，不要自己輪詢）。
2. `test` 失敗：用 `gh run view <run-id> --log-failed` 看原因，修好、commit、push，回到 3.1。不要用 `--admin` 或任何方式繞過檢查。
3. 取得這個 commit 的預覽網址：
   ```sh
   SHA=$(gh pr view <n> --json headRefOid --jq .headRefOid)
   gh api repos/cherites0610/step-through/commits/$SHA/check-runs \
     --jq '.check_runs[]|select(.app.slug=="cloudflare-workers-and-pages")|.output.summary' \
     | grep -oE 'https://[a-z0-9.-]+\.pages\.dev' | sort -u
   ```
   會有兩個：`https://<8 碼>.step-through.pages.dev` 是這個 commit 固定的預覽，`https://<分支>.step-through.pages.dev` 會跟著分支更新。給使用者看前者。
4. 對預覽站跑冒煙測試：`pnpm smoke <commit 預覽網址>`。

## 4. 交給使用者確認，然後停下來

回報以下內容後**結束這一輪，等使用者回覆**：

- PR 連結與標題、這次的 commit（短 SHA）
- **預覽網址**（commit 固定的那個），以及這次變更建議看的具體頁面（完整網址）
- CI 與預覽站冒煙測試的結果
- 一句話：「確認沒問題請回覆，我就合併上線」

## 5. 合併（只在使用者明確同意後）

- 只有使用者對**這個 PR** 明確表示可以合併（例如「可以」「OK」「合併吧」「沒問題」）才合併。提出修改意見、問問題或回覆不明確時都不合併：照意見修改後回到第 3 步，重新給預覽網址。
- 合併前再確認一次：PR 的 head SHA 和交給使用者確認的那個相同（不同就重新給預覽網址，不合併），而且 `gh pr view <n> --json mergeStateStatus --jq .mergeStateStatus` 是 `CLEAN`。
- `gh pr merge <n> --merge`（沿用這個 repo 的 merge commit 慣例；遠端分支會自動刪除）。**絕不**使用 `--admin`。

## 6. 上線驗證

1. 取得合併後的 commit：`gh pr view <n> --json mergeCommit --jq .mergeCommit.oid`。
2. 找到它的 Smoke 執行：`gh run list --workflow smoke.yml --commit <oid> --json databaseId --jq '.[0].databaseId'`（剛合併時可能還沒出現，稍等再查）。用背景執行 `gh run watch <id> --exit-status` 等它結束。
3. 回報正式站（https://step-through.cherites.org）的結果。Smoke 失敗時用 `gh run view <id> --log-failed` 查原因並告訴使用者。正式站已經是新版，有問題就照同樣流程開修正 PR。
4. 本機收尾：`git switch master && git pull --ff-only && git branch -d <分支>`。

## 絕對不要

- 直接 push 到 master、force push master、刪除 master
- 用 `--admin` 或修改保護規則來繞過 CI
- 沒有使用者對該 PR 的明確同意就合併
- 在 commit、PR 或程式碼中加入 Claude／AI 署名
