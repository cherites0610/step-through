import { defineConfig } from '@playwright/test';

// 用專屬埠，避免撞到本機其他專案的開發伺服器
const PORT = 4399;
const CI = !!process.env.CI;

export default defineConfig({
  testDir: 'e2e',
  forbidOnly: CI,
  // CI 失敗時重試一次並錄 trace，報告由 workflow 上傳成 artifact
  retries: CI ? 1 : 0,
  reporter: CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  webServer: {
    // CI 在前一個步驟已經建置過，這裡只預覽，避免建置兩次。
    // --ignore-lock：Astro 偵測到 AI agent 時會自動把 preview 轉到背景，
    // Playwright 會誤以為伺服器結束；加上它就一律在前景執行。
    command: `${CI ? '' : 'pnpm build && '}pnpm preview --port ${PORT} --strictPort --ignore-lock`,
    url: `http://localhost:${PORT}/zh-TW/`,
    reuseExistingServer: !CI,
    timeout: 120_000,
  },
  use: { baseURL: `http://localhost:${PORT}`, trace: 'on-first-retry' },
});
