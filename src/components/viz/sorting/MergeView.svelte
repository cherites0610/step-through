<script lang="ts">
  import type { SortState } from '../../../core/sorting/types';

  let {
    state,
    leftLabel,
    rightLabel,
    outLabel,
    ariaLabel,
  }: {
    state: SortState;
    leftLabel: string;
    rightLabel: string;
    outLabel: string;
    ariaLabel: string;
  } = $props();

  const LABEL_W = 56; // 左側標籤欄
  const PITCH = 62; // 一欄寬；每一欄對應原陣列的一個索引
  const CELL_H = 38;
  const ROW_T = 46; // 遞迴樹每層的高
  const ROW_M = 62; // 合併區每列的高（含指標）

  const n = $derived(state.arr.length);
  const levels = $derived(state.tree.length ? Math.max(...state.tree.map((x) => x.depth)) + 1 : 1);
  const treeH = $derived(levels * ROW_T);
  const mergeTop = $derived(treeH + 30);
  const H = $derived(mergeTop + 3 * ROW_M + 6);
  const width = $derived(LABEL_W + Math.max(1, n) * PITCH);

  const colX = (c: number) => LABEL_W + c * PITCH;
  const visible = $derived(state.tree.filter((x) => x.status !== 'hidden'));
  const top = $derived(state.stack.at(-1));
  const m = $derived(state.merge);

  const cellStyle = (kind: 'idle' | 'front' | 'taken' | 'consumed' | 'filled' | 'empty') => {
    switch (kind) {
      case 'front':
        return { fill: 'none', stroke: 'var(--color-ink)', sw: 2, dash: undefined, text: 'var(--color-ink)', strike: false };
      case 'taken':
        return { fill: 'var(--color-ink)', stroke: 'var(--color-ink)', sw: 1, dash: undefined, text: 'var(--color-paper)', strike: false };
      case 'consumed':
        return { fill: 'none', stroke: 'var(--color-hairline)', sw: 1, dash: '4 3', text: 'var(--color-ink)', strike: true };
      case 'filled':
        return { fill: 'var(--color-stamp)', stroke: 'var(--color-ink)', sw: 1, dash: undefined, text: 'var(--color-ink)', strike: false };
      case 'empty':
        return { fill: 'none', stroke: 'var(--color-hairline)', sw: 1, dash: '4 3', text: 'var(--color-ink)', strike: false };
      default:
        return { fill: 'none', stroke: 'var(--color-hairline)', sw: 1, dash: undefined, text: 'var(--color-ink)', strike: false };
    }
  };
</script>

<!-- 窄螢幕不再把整張圖縮到看不清楚：維持最小寬度，超出時在框內橫向捲動 -->
<div class="overflow-x-auto">
<svg
  viewBox={`0 0 ${width} ${H}`}
  role="img"
  aria-label={ariaLabel}
  class="mx-auto block h-auto w-full"
  style:max-width={`${width}px`}
  style:min-width={`min(${width}px, 520px)`}
>
  <!-- 遞迴樹：每層一列，欄位對齊原陣列的索引 -->
  {#each Array(levels) as _, d}
    <text
      x={LABEL_W - 12}
      y={d * ROW_T + CELL_H / 2 + 4}
      text-anchor="end"
      font-family="var(--font-mono)"
      font-size="11"
      fill="var(--color-ink)">{d}</text
    >
  {/each}
  {#each visible as node (node.lo + '-' + node.hi)}
    {@const x = colX(node.lo) + 2}
    {@const y = node.depth * ROW_T + 1}
    {@const w = (node.hi - node.lo + 1) * PITCH - 4}
    {@const active = top && top.lo === node.lo && top.hi === node.hi}
    {@const done = node.status === 'done'}
    <g>
      <rect
        {x}
        {y}
        width={w}
        height={CELL_H}
        fill={done ? 'var(--color-stamp)' : 'none'}
        stroke={active || done ? 'var(--color-ink)' : 'var(--color-hairline)'}
        stroke-width={active ? 2 : 1}
        stroke-dasharray={node.status === 'split' ? '4 3' : undefined}
      />
      {#each node.values as v, k}
        {#if k > 0}
          <line
            x1={colX(node.lo + k)}
            x2={colX(node.lo + k)}
            y1={y + 8}
            y2={y + CELL_H - 8}
            stroke="var(--color-hairline)"
          />
        {/if}
        <text
          x={colX(node.lo + k) + PITCH / 2 - 2}
          y={y + CELL_H / 2 + 6}
          text-anchor="middle"
          font-family="var(--font-mono)"
          font-size="18"
          font-weight="500"
          fill="var(--color-ink)">{v}</text
        >
      {/each}
    </g>
  {/each}

  <!-- 合併區：左段、右段、輸出；欄位同樣對齊原陣列 -->
  <line x1={LABEL_W} x2={width} y1={treeH + 10} y2={treeH + 10} stroke="var(--color-hairline)" />
  {#each [leftLabel, rightLabel, outLabel] as label, r}
    <text
      x={LABEL_W - 12}
      y={mergeTop + r * ROW_M + CELL_H / 2 + 4}
      text-anchor="end"
      font-family="var(--font-mono)"
      font-size="11"
      letter-spacing="1.5"
      fill="var(--color-ink)">{label}</text
    >
  {/each}

  {#if m}
    {#each [{ run: m.left, start: m.lo, ptr: m.i, name: 'i', row: 0, side: 'left' as const }, { run: m.right, start: m.mid + 1, ptr: m.j, name: 'j', row: 1, side: 'right' as const }] as r}
      {#each r.run as v, k}
        {@const kind =
          k < r.ptr
            ? m.took === r.side && k === r.ptr - 1
              ? 'taken'
              : 'consumed'
            : k === r.ptr
              ? 'front'
              : 'idle'}
        {@const s = cellStyle(kind)}
        <g>
          <rect
            x={colX(r.start + k) + 3}
            y={mergeTop + r.row * ROW_M + 1}
            width={PITCH - 6}
            height={CELL_H}
            fill={s.fill}
            stroke={s.stroke}
            stroke-width={s.sw}
            stroke-dasharray={s.dash}
          />
          <text
            x={colX(r.start + k) + PITCH / 2}
            y={mergeTop + r.row * ROW_M + CELL_H / 2 + 7}
            text-anchor="middle"
            font-family="var(--font-mono)"
            font-size="18"
            font-weight="500"
            text-decoration={s.strike ? 'line-through' : undefined}
            fill={s.text}>{v}</text
          >
        </g>
      {/each}
      {#if r.ptr < r.run.length}
        {@const cx = colX(r.start + r.ptr) + PITCH / 2}
        {@const py = mergeTop + r.row * ROW_M + CELL_H + 4}
        <polygon points={`${cx - 5},${py + 9} ${cx + 5},${py + 9} ${cx},${py}`} fill="var(--color-ink)" />
        <text
          x={cx}
          y={py + 21}
          text-anchor="middle"
          font-family="var(--font-mono)"
          font-size="12"
          font-weight="500"
          fill="var(--color-ink)">{r.name}</text
        >
      {/if}
    {/each}

    {#each Array(m.hi - m.lo + 1) as _, k}
      {@const filled = k < m.out.length}
      {@const kind = filled ? (m.took !== null && k === m.out.length - 1 ? 'taken' : 'filled') : 'empty'}
      {@const s = cellStyle(kind)}
      <g>
        <rect
          x={colX(m.lo + k) + 3}
          y={mergeTop + 2 * ROW_M + 1}
          width={PITCH - 6}
          height={CELL_H}
          fill={s.fill}
          stroke={s.stroke}
          stroke-width={s.sw}
          stroke-dasharray={s.dash}
        />
        {#if filled}
          <text
            x={colX(m.lo + k) + PITCH / 2}
            y={mergeTop + 2 * ROW_M + CELL_H / 2 + 7}
            text-anchor="middle"
            font-family="var(--font-mono)"
            font-size="18"
            font-weight="500"
            fill={s.text}>{m.out[k]}</text
          >
        {/if}
      </g>
    {/each}
  {/if}
</svg>
</div>
