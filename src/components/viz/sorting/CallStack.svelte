<script lang="ts">
  import type { Frame } from '../../../core/sorting/types';

  let {
    frames,
    fn,
    label,
    empty,
  }: {
    frames: Frame[];
    /** 函式名稱，例如 quickSort */
    fn: string;
    label: string;
    empty: string;
  } = $props();

  // 堆疊頂端在最上面
  const rows = $derived([...frames].reverse());
  const ROWS = 6;
</script>

<section aria-label={label}>
  <p class="font-mono text-[11px] uppercase tracking-[0.14em]">{label}</p>
  <!-- 高度固定（ROWS 列），堆疊變深時在框內捲動，版面不位移 -->
  <ol
    class="mt-2 overflow-y-auto border border-hairline font-mono text-[13px] leading-[24px]"
    style:height={`${ROWS * 24 + 2}px`}
  >
    {#if rows.length === 0}
      <li class="px-2">{empty}</li>
    {:else}
      {#each rows as f, i}
        <li
          class="whitespace-pre px-2 {i === 0 ? 'bg-stamp outline outline-1 outline-ink' : ''}"
          aria-current={i === 0 ? 'step' : undefined}
        >
          {fn}({f.lo}, {f.hi})
        </li>
      {/each}
    {/if}
  </ol>
</section>
