<script lang="ts">
  import { balanceFactor, type AvlNode, type AvlState } from '../../../core/avl/types';

  let {
    state,
    highlight,
    keys,
    levels,
    insertLabel,
    emptyLabel,
    rootLabel,
    rootHint,
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
    /** 空樹時，根節點預留位置裡的標籤 */
    rootLabel: string;
    /** 空樹時的提示，例如「10 會成為根」 */
    rootHint: string;
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
  // 數字很少時樹會很窄：舞台設最小寬度，樹與空狀態都置中，說明文字也放得下
  const MIN_W = 300;
  const contentW = $derived(keys.length * PITCH + PADX * 2);
  const width = $derived(Math.max(contentW, MIN_W));
  const ox = $derived((width - contentW) / 2);
  // 最小高度：只有 1～2 層的樹也要放得下空狀態的整組內容與刻度軸
  const MIN_H = 260;
  const H = $derived(Math.max(TOP + levels * LEVEL, MIN_H));

  const nodes = $derived.by(() => {
    const out: Laid[] = [];
    const walk = (n: AvlNode | null, depth: number, parent: number | null) => {
      if (!n) return;
      out.push({
        id: n.id,
        value: n.value,
        x: ox + PADX + (rank.get(n.value) ?? 0) * PITCH + (PITCH - NODE_W) / 2,
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

  const inTree = $derived(new Set(nodes.map((n) => n.value)));
  const AXIS_Y = $derived(H - 26);
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
      <path class="edge" data-step-motion d={edge(n)} style:d={`path('${edge(n)}')`} fill="none" stroke="var(--color-ink)" stroke-width="1" />
    {/each}

    {#each nodes as n (n.id)}
      {@const isHi = hi.has(n.id)}
      {@const bad = state.unbalanced?.id === n.id}
      {@const inPath = onPath.has(n.id) && !isHi}
      <g class="node" data-step-motion style:transform={`translate(${n.x}px, ${n.y}px)`}>
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

    <!-- 大小順序刻度軸：整條軌跡所有數字由小到大。節點的水平位置就是它在這條軸上的位置。
         已掛進樹＝實心刻度，還沒插入＝空心刻度（不只靠顏色）。 -->
    <line x1={ox + PADX} x2={ox + contentW - PADX} y1={AXIS_Y} y2={AXIS_Y} stroke="var(--color-hairline)" />
    {#each keys as k, i (k)}
      {@const cx = ox + PADX + i * PITCH + PITCH / 2}
      <rect
        x={cx - 3}
        y={AXIS_Y - 3}
        width="6"
        height="6"
        fill={inTree.has(k) ? 'var(--color-ink)' : 'var(--color-paper)'}
        stroke="var(--color-ink)"
      />
      <text
        x={cx}
        y={AXIS_Y + 19}
        text-anchor="middle"
        font-family="var(--font-mono)"
        font-size="11"
        fill="var(--color-ink)">{k}</text
      >
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
      <!-- 空樹：整組內容在舞台中央——虛線的「根」預留框（同陣列視圖的「空位」）、
           「空樹」標題、一行「{v} 會成為根」。第一個數字掛上去後就切換成正常的樹。 -->
      {@const SLOT = 72}
      {@const BLOCK_H = SLOT + 34 + 26}
      {@const y0 = (AXIS_Y - 12 - BLOCK_H) / 2}
      {@const cxm = width / 2}
      <rect
        x={cxm - SLOT / 2 + 0.5}
        y={y0 + 0.5}
        width={SLOT - 1}
        height={SLOT - 1}
        fill="none"
        stroke="var(--color-hairline)"
        stroke-width="1.5"
        stroke-dasharray="6 5"
      />
      <text
        x={cxm}
        y={y0 + SLOT / 2 + 4}
        text-anchor="middle"
        font-family="var(--font-mono)"
        font-size="12"
        letter-spacing="1.5"
        fill="var(--color-ink)">{rootLabel}</text
      >
      <text
        x={cxm}
        y={y0 + SLOT + 34}
        text-anchor="middle"
        font-family="var(--font-sans)"
        font-size="20"
        font-weight="500"
        fill="var(--color-ink)">{emptyLabel}</text
      >
      <text
        x={cxm}
        y={y0 + SLOT + 34 + 26}
        text-anchor="middle"
        font-family="var(--font-sans)"
        font-size="15"
        fill="var(--color-ink)">{rootHint}</text
      >
    {/if}
  </svg>
</div>

<style>
  /* 旋轉時節點與邊平滑移動。這是承載資訊的移動，所以減少動態時也保留，只是縮短 */
  .node {
    transition: transform 450ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  .edge {
    transition: d 450ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  @media (prefers-reduced-motion: reduce) {
    .node {
      transition-duration: 250ms;
    }
    .edge {
      transition-duration: 250ms;
    }
  }
</style>
