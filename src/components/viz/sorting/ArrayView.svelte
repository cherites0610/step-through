<script lang="ts">
  import type { SortState } from '../../../core/sorting/types';

  let {
    state,
    highlight,
    keyLabel,
    minLabel,
    pivotLabel = 'PIVOT',
    extra = false,
    ariaLabel,
  }: {
    state: SortState;
    highlight: string[];
    keyLabel: string;
    minLabel: string;
    /** 基準的標籤文字（快速排序） */
    pivotLabel?: string;
    /** 為快速排序多留上方（區間括號、基準標籤）與下方（i、j 指標）空間；整頁固定，步驟之間不位移 */
    extra?: boolean;
    ariaLabel: string;
  } = $props();

  const W = 72; // 格寬
  const GAP = 12;
  const PITCH = W + GAP;
  const TOP_PAD = $derived(extra ? 26 : 0);
  const CELL_TOP = $derived(76 + TOP_PAD); // 上方留給待插入值、標籤與區間括號
  const CELL_H = 64;
  const BAR_MAX = 84;
  const BAR_TOP = $derived(CELL_TOP + CELL_H + 12);
  const IDX_Y = $derived(BAR_TOP + BAR_MAX + 22);
  const H = $derived(IDX_Y + 6 + (extra ? 34 : 0));
  const TAG_Y = $derived(CELL_TOP - (extra ? 14 : 10));

  const n = $derived(state.arr.length);
  const width = $derived(Math.max(1, n) * PITCH - GAP);
  // 依目前資料縮放，小數字也看得出長條高低
  const maxVal = $derived(Math.max(1, ...state.arr, state.key ?? 0));
  const hi = $derived(new Set(highlight.map(Number)));
  const done = $derived(new Set(state.sorted));

  // 同一格上的指標標籤合併顯示，例如 i 與 j 重疊時顯示「i j」
  const pointers = $derived.by(() => {
    const m = new Map<number, string[]>();
    const add = (idx: number | null, name: string) => {
      if (idx === null || idx < 0 || idx >= n) return;
      m.set(idx, [...(m.get(idx) ?? []), name]);
    };
    add(state.i, 'i');
    add(state.j, 'j');
    return m;
  });
</script>

<!-- 窄螢幕不再把整張圖縮到看不清楚：維持最小寬度，超出時在框內橫向捲動 -->
<div class="overflow-x-auto">
<svg
  viewBox={`-8 0 ${width + 16} ${H}`}
  role="img"
  aria-label={ariaLabel}
  class="mx-auto block h-auto w-full"
  style:max-width={`${width + 16}px`}
  style:min-width={`min(${width + 16}px, 480px)`}
>
  {#if state.range}
    <!-- 目前處理的區間：括號 -->
    {@const [lo, rhi] = state.range}
    <path
      d={`M ${lo * PITCH} ${CELL_TOP - 4} V ${CELL_TOP - 9} H ${rhi * PITCH + W} V ${CELL_TOP - 4}`}
      fill="none"
      stroke="var(--color-ink)"
      stroke-width="1.5"
    />
  {/if}

  {#each state.arr as v, i (i)}
    {@const x = i * PITCH}
    {@const isHole = state.hole === i}
    {@const isHi = hi.has(i) && !isHole}
    {@const isDone = done.has(i) && !isHi}
    {@const isPivot = state.pivot === i}
    <g transform={`translate(${x} 0)`}>
      {#if isHole}
        <rect
          x="0.5"
          y={CELL_TOP + 0.5}
          width={W - 1}
          height={CELL_H - 1}
          fill="none"
          stroke="var(--color-hairline)"
          stroke-dasharray="4 4"
        />
      {:else}
        <rect
          x="0.5"
          y={CELL_TOP + 0.5}
          width={W - 1}
          height={CELL_H - 1}
          fill={isHi ? 'var(--color-ink)' : isDone ? 'var(--color-stamp)' : 'none'}
          stroke={isHi || isDone || isPivot ? 'var(--color-ink)' : 'var(--color-hairline)'}
          stroke-width={isPivot ? 3 : 1}
        />
        <text
          x={W / 2}
          y={CELL_TOP + CELL_H / 2 + 9}
          text-anchor="middle"
          font-family="var(--font-mono)"
          font-size="26"
          font-weight="500"
          fill={isHi ? 'var(--color-paper)' : 'var(--color-ink)'}>{v}</text
        >
        <rect
          x={W / 2 - 6}
          y={BAR_TOP + BAR_MAX - (v / maxVal) * BAR_MAX}
          width="12"
          height={(v / maxVal) * BAR_MAX}
          fill={isHi ? 'var(--color-ink)' : isDone ? 'var(--color-stamp)' : 'var(--color-hairline)'}
          stroke={isHi || isDone ? 'var(--color-ink)' : 'none'}
        />
      {/if}
      <text
        x={W / 2}
        y={IDX_Y}
        text-anchor="middle"
        font-family="var(--font-mono)"
        font-size="11"
        fill="var(--color-ink)">{i}</text
      >
      {#if state.min === i}
        <text
          x={W / 2}
          y={TAG_Y}
          text-anchor="middle"
          font-family="var(--font-mono)"
          font-size="11"
          letter-spacing="1.5"
          fill="var(--color-ink)">▼ {minLabel}</text
        >
      {/if}
      {#if isPivot}
        <text
          x={W / 2}
          y={TAG_Y}
          text-anchor="middle"
          font-family="var(--font-mono)"
          font-size="11"
          letter-spacing="1.5"
          fill="var(--color-ink)">▼ {pivotLabel}</text
        >
      {/if}
      {#if pointers.has(i)}
        <!-- i、j 指標：向上的小三角加標籤 -->
        <polygon
          points={`${W / 2 - 5},${IDX_Y + 18} ${W / 2 + 5},${IDX_Y + 18} ${W / 2},${IDX_Y + 9}`}
          fill="var(--color-ink)"
        />
        <text
          x={W / 2}
          y={IDX_Y + 32}
          text-anchor="middle"
          font-family="var(--font-mono)"
          font-size="12"
          font-weight="500"
          letter-spacing="2"
          fill="var(--color-ink)">{pointers.get(i)!.join(' ')}</text
        >
      {/if}
    </g>
  {/each}

  {#if state.key !== null && state.hole !== null}
    {@const x = state.hole * PITCH}
    <g transform={`translate(${x} 0)`}>
      <text
        x={W / 2}
        y="14"
        text-anchor="middle"
        font-family="var(--font-mono)"
        font-size="11"
        letter-spacing="1.5"
        fill="var(--color-ink)">{keyLabel}</text
      >
      <rect x="0.5" y="22.5" width={W - 1} height="40" fill="var(--color-ink)" />
      <text
        x={W / 2}
        y="50"
        text-anchor="middle"
        font-family="var(--font-mono)"
        font-size="24"
        font-weight="500"
        fill="var(--color-paper)">{state.key}</text
      >
    </g>
  {/if}
</svg>
</div>
