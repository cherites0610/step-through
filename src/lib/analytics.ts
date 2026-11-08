/**
 * 事件追蹤的薄封裝。元件只呼叫 track()，不知道背後是哪個服務；日後換服務只改這裡。
 *
 * 目前：Cloudflare Web Analytics 只量頁面瀏覽（不支援自訂事件），所以事件是 no-op；
 * 改用 Umami 後（設定 PUBLIC_UMAMI_* 環境變數，見 Analytics.astro），事件會自動送出。
 * 兩者都不使用 cookie。
 */
type Props = Record<string, string | number | boolean>;

declare global {
  interface Window {
    umami?: { track: (event: string, props?: Props) => void };
  }
}

export function track(event: string, props?: Props): void {
  if (typeof window === 'undefined') return;
  try {
    window.umami?.track(event, props);
  } catch {
    // 追蹤失敗不該影響使用者操作
  }
}
