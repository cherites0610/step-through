<script lang="ts">
  import { balanceFactor, type AvlNode, type AvlState } from '../../../core/avl/types';

  let {
    state,
    highlight,
    keys,
    levels,
    insertLabel,
    emptyLabel,
    ariaLabel,
  }: {
    state: AvlState;
    highlight: string[];
    /** 整條軌跡會用到的所有數字（排序後、不重複）；節點的水平位置以它在其中的名次決定，旋轉時不會左右跳動 */
    keys: number[];
    /** 整條軌跡中樹的最大深度；整頁固定，步驟之間版面不位移 */
    levels: number;
    insertLabel: string;
    emptyLabel: string;
    ariaLabel: string;
  } = $props();

  const NODE_W = 52;
  const NODE_H = 56;
  const PITCH = 64;
  const LEVEL = 96;
  const TOP = 64;
  const PADX = 8;

  type Laid = {
    id: number;
    value: number;
    x: number;
    y: number;
    bf: number;
    parent: number | null;
  };

  const rank = $derived(new Map(keys.map((k, i) => [k, i])));
  const width = $derived(keys.length * PITCH + PADX * 2);
  const H = $derived(TOP + levels * LEVEL);

  const nodes = $derived.by(() => {
    const out: Laid[] = [];
    const walk = (n: AvlNode | null, depth: number, parent: number | null) => {
      if (!n) return;
      out.push({
        id: n.id,
        value: n.value,
        x: PADX + (rank.get(n.value) ?? 0) * PITCH,
        y: TOP + depth * LEVEL,
        bf: balanceFactor(n),
        parent,
      });
      walk(n.left, depth + 1, n.id);
      walk(n.right, depth + 1, n.id);
    };
    walk(state.root, 0, null);
    return out;
  });
  const byId = $derived(new Map(nodes.map((n) => [n.id, n])));

  const hi = $derived(new Set(highlight.map(Number)));
  const onPath = $derived(new Set(state.path));
  const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${n * -1}` : '0');

  const edge = (child: Laid) => {
    const p = byId.get(child.parent!)!;
    return `M ${p.x + NODE_W / 2} ${p.y + NODE_H} L ${child.x + NODE_W / 2} ${child.y}`;
  };
</script>

<!-- 窄螢幕不把整張圖縮到看不清楚：維持最小寬度，超出時在框內橫向捲動 -->
<div class="overflow-x-auto">
  <svg
    viewBox={`0 0 ${width} ${H}`}
    role="img"
    aria-label={ariaLabel}
    class="mx-auto block h-auto w-full"
    style:max-width={`${width}px`}
    style:min-width={`min(${width}px, 480px)`}
  >
    <!-- 邊：先畫，才會在節點底下 -->
    {#each nodes.filter((n) => n.parent !== null) as n (n.id)}
      <path class="edge" d={edge(n)} style:d={`path('${edge(n)}')`} fill="none" stroke="var(--color-ink)" stroke-width="1" />
    {/each}

    {#each nodes as n (n.id)}
      {@const isHi = hi.has(n.id)}
      {@const bad = state.unbalanced?.id === n.id}
      {@const inPath = onPath.has(n.id) && !isHi}
      <g class="node" style:transform={`translate(${n.x}px, ${n.y}px)`}>
        <rect
          x="1"
          y="1"
          width={NODE_W - 2}
          height={NODE_H - 2}
          fill={isHi ? 'var(--color-ink)' : inPath ? 'var(--color-stamp)' : 'var(--color-paper)'}
          stroke={isHi || inPath || bad ? 'var(--color-ink)' : 'var(--color-hairline)'}
          stroke-width={bad ? 3 : 1}
        />
        <text
          x={NODE_W / 2}
          y="27"
          text-anchor="middle"
          font-family="var(--font-mono)"
          font-size="20"
          font-weight="500"
          fill={isHi ? 'var(--color-paper)' : 'var(--color-ink)'}>{n.value}</text
        >
        <!-- 平衡因子：永遠顯示在方框內（不會被邊線穿過），等寬對齊 -->
        <text
          x={NODE_W / 2}
          y="47"
          text-anchor="middle"
          font-family="var(--font-mono)"
          font-size="11"
          font-weight={bad ? 500 : 400}
          fill={isHi ? 'var(--color-paper)' : 'var(--color-ink)'}>BF {signed(n.bf)}</text
        >
        {#if bad}
          <!-- 失衡標籤：小型實心標籤放在遠離父節點那一側，避免被進來的邊線穿過 -->
          {@const tagX = n.parent !== null && byId.get(n.parent)!.x < n.x ? NODE_W - 24 : 0}
          <rect x={tagX} y="-21" width="24" height="17" fill="var(--color-ink)" />
          <text
            x={tagX + 12}
            y="-8.5"
            text-anchor="middle"
            font-family="var(--font-mono)"
            font-size="11"
            font-weight="500"
            fill="var(--color-paper)">{state.unbalanced!.kind}</text
          >
        {/if}
      </g>
    {/each}

    {#if state.inserting !== null}
      <!-- 待插入的值：還在比較階段（尚未掛進樹）時顯示在左上角 -->
      <text
        x={PADX}
        y="14"
        font-family="var(--font-mono)"
        font-size="11"
        letter-spacing="1.5"
        fill="var(--color-ink)">{insertLabel}</text
      >
      <rect x={PADX + 0.5} y="22.5" width={NODE_W - 1} height="30" fill="var(--color-ink)" />
      <text
        x={PADX + NODE_W / 2}
        y="44"
        text-anchor="middle"
        font-family="var(--font-mono)"
        font-size="20"
        font-weight="500"
        fill="var(--color-paper)">{state.inserting}</text
      >
    {/if}

    {#if !state.root}
      <text
        x={width / 2}
        y={TOP + NODE_H}
        text-anchor="middle"
        font-family="var(--font-mono)"
        font-size="13"
        fill="var(--color-ink)">{emptyLabel}</text
      >
    {/if}
  </svg>
</div>

<style>
  /* 旋轉時節點與邊平滑移動；prefers-reduced-motion 時由全域規則停用 */
  .node {
    transition: transform 450ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  .edge {
    transition: d 450ms cubic-bezier(0.16, 1, 0.3, 1);
  }
</style>
