import { defineConfig } from '@playwright/test';

// 用專屬埠，避免撞到本機其他專案的開發伺服器
const PORT = 4399;

export default defineConfig({
  testDir: 'e2e',
  webServer: {
    command: `pnpm build && pnpm preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/zh-TW/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  use: { baseURL: `http://localhost:${PORT}` },
});
