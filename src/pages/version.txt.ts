import type { APIRoute } from 'astro';

// 部署後冒煙測試用：確認正式站已經換成哪一個 commit。
// Cloudflare Pages 建置時會提供 CF_PAGES_COMMIT_SHA；本機建置為 dev。
export const GET: APIRoute = () =>
  new Response(`${process.env.CF_PAGES_COMMIT_SHA ?? 'dev'}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
