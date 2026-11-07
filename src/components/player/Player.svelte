<script lang="ts" generics="S">
  import type { Snippet } from 'svelte';
  import { untrack } from 'svelte';
  import { PlayerController, type Step, type Trace } from '../../core/trace';

  type Labels = {
    prev: string;
    next: string;
    play: string;
    pause: string;
    reset: string;
    step: string;
    speed: string;
  };

  let {
    steps,
    labels,
    children,
  }: { steps: Trace<S>; labels: Labels; children: Snippet<[Step<S>, number]> } = $props();

  const SPEEDS = [0.5, 1, 2, 4];
  const BASE_MS = 900;

  const ctl = new PlayerController(untrack(() => steps.length));
  let snap = $state(ctl.snapshot);
  let speed = $state(1);
  const sync = () => (snap = ctl.snapshot);
  const act = (fn: () => void) => () => {
    fn();
    sync();
  };

  // 使用者換了輸入 → 換一條新軌跡，回到第一步
  // 這裡讀的是 steps 這個 prop 本身：換資料、換基準會產生新的軌跡，即使長度剛好相同也會回到第一步
  $effect(() => {
    const len = steps.length;
    untrack(() => {
      ctl.load(len);
      sync();
    });
  });

  $effect(() => {
    if (!snap.playing) return;
    const id = setInterval(act(() => ctl.next()), BASE_MS / speed);
    return () => clearInterval(id);
  });

  function onKey(e: KeyboardEvent) {
    const el = e.target as HTMLElement | null;
    if (el && ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'ArrowRight') act(() => ctl.next())();
    else if (e.key === 'ArrowLeft') act(() => ctl.prev())();
    else if (e.key === ' ' && el === document.body) {
      e.preventDefault();
      act(() => ctl.toggle())();
    }
  }

  const current = $derived(steps[Math.min(snap.index, steps.length - 1)]);
  const btn =
    'h-9 border border-ink px-3 font-mono text-[13px] disabled:border-hairline disabled:text-hairline disabled:line-through';
</script>

<svelte:window onkeydown={onKey} />

<div class="flex min-h-0 flex-1 flex-col">
  <div class="min-h-0 flex-1">
    {@render children(current, snap.index)}
  </div>

  <div
    class="sticky bottom-0 z-10 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-hairline bg-paper px-4 py-3 max-lg:gap-y-1 lg:h-[72px] lg:flex-nowrap"
    role="group"
    aria-label="player"
  >
    <div class="flex items-center gap-2 max-lg:basis-full">
      <button class={btn} disabled={snap.atStart} onclick={act(() => ctl.prev())}>
        ← {labels.prev}
      </button>
      <button
        class="h-9 min-w-20 border border-ink bg-ink px-3 font-mono text-[13px] text-paper"
        aria-pressed={snap.playing}
        onclick={act(() => ctl.toggle())}
      >
        {snap.playing ? labels.pause : labels.play}
      </button>
      <button class={btn} disabled={snap.atEnd} onclick={act(() => ctl.next())}>
        {labels.next} →
      </button>
      <button class="h-9 px-2 text-[13px] underline" onclick={act(() => ctl.reset())}>
        {labels.reset}
      </button>
    </div>

    <label class="flex min-w-40 flex-1 items-center gap-3 max-lg:order-2 max-lg:min-w-0">
      <span class="font-mono text-[11px] uppercase tracking-[0.14em] tabular-nums whitespace-nowrap">
        {labels.step}
        {String(snap.index + 1).padStart(2, '0')} / {String(snap.length).padStart(2, '0')}
      </span>
      <input
        class="flex-1 accent-ink"
        type="range"
        min="0"
        max={Math.max(0, snap.length - 1)}
        value={snap.index}
        aria-label={labels.step}
        oninput={(e) => act(() => ctl.goTo(+e.currentTarget.value))()}
      />
    </label>

    <label class="flex items-center gap-2 text-[13px] max-lg:order-3">
      <span class="font-mono text-[11px] uppercase tracking-[0.14em] max-sm:sr-only">{labels.speed}</span>
      <select class="h-9 border border-ink bg-paper px-2 font-mono text-[13px]" bind:value={speed}>
        {#each SPEEDS as s}
          <option value={s}>{s}×</option>
        {/each}
      </select>
    </label>
  </div>
</div>
