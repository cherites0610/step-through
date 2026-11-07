<script lang="ts">
  import type { SortState } from '../../../core/sorting/types';

  let {
    state,
    highlight,
    keyLabel,
    minLabel,
    ariaLabel,
  }: {
    state: SortState;
    highlight: string[];
    keyLabel: string;
    minLabel: string;
    ariaLabel: string;
  } = $props();

  const W = 72; // 格寬
  const GAP = 12;
  const PITCH = W + GAP;
  const CELL_TOP = 76; // 上方留給待插入值
  const CELL_H = 64;
  const BAR_MAX = 84;
  const BAR_TOP = CELL_TOP + CELL_H + 12;
  const H = BAR_TOP + BAR_MAX + 28;

  const n = $derived(state.arr.length);
  const width = $derived(Math.max(1, n) * PITCH - GAP);
  // 依目前資料縮放，小數字也看得出長條高低
  const maxVal = $derived(Math.max(1, ...state.arr, state.key ?? 0));
  const hi = $derived(new Set(highlight.map(Number)));
  const done = $derived(new Set(state.sorted));
</script>

<svg
  viewBox={`-8 0 ${width + 16} ${H}`}
  role="img"
  aria-label={ariaLabel}
  class="mx-auto block h-auto w-full"
  style:max-width={`${width + 16}px`}
>
  {#each state.arr as v, i (i)}
    {@const x = i * PITCH}
    {@const isHole = state.hole === i}
    {@const isHi = hi.has(i) && !isHole}
    {@const isDone = done.has(i) && !isHi}
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
          stroke={isHi || isDone ? 'var(--color-ink)' : 'var(--color-hairline)'}
          stroke-width="1"
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
        y={H - 6}
        text-anchor="middle"
        font-family="var(--font-mono)"
        font-size="11"
        fill="var(--color-ink)">{i}</text
      >
      {#if state.min === i}
        <text
          x={W / 2}
          y={CELL_TOP - 10}
          text-anchor="middle"
          font-family="var(--font-mono)"
          font-size="11"
          letter-spacing="1.5"
          fill="var(--color-ink)">▼ {minLabel}</text
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
