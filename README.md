# 步步看懂（Step Through）

把演算法與資料結構變成可親手操作、逐步前進與倒退的互動視覺化。產品規格見 [PRODUCT.md](PRODUCT.md)，視覺規範見 [DESIGN.md](DESIGN.md)。

## 開發

```sh
npm install
npm run dev        # 開發伺服器
npm run check      # 型別檢查
npm test           # Vitest（核心邏輯）
npm run build      # 靜態輸出至 dist/
npm run test:e2e   # Playwright（SEO meta 與互動）
```

技術棧：Astro + Svelte 5 + Tailwind CSS v4 + TypeScript，部署於 Cloudflare Pages。
演算法核心放在 `src/core/<topic>/`，以純 TS 輸出 Step Trace。
