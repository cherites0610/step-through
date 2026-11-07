<script lang="ts" generics="S">
  import { PlayerController, type Trace } from '../../core/trace';

  type Labels = {
    prev: string;
    next: string;
    play: string;
    pause: string;
    reset: string;
    step: string;
  };
  let {
    steps,
    labels,
    intervalMs = 800,
  }: { steps: Trace<S>; labels: Labels; intervalMs?: number } = $props();

  const ctl = new PlayerController(steps.length);
  let snap = $state(ctl.snapshot);
  const act = (fn: () => void) => () => {
    fn();
    snap = ctl.snapshot;
  };

  $effect(() => {
    if (!snap.playing) return;
    const id = setInterval(() => {
      ctl.next();
      snap = ctl.snapshot;
    }, intervalMs);
    return () => clearInterval(id);
  });

  function onKey(e: KeyboardEvent) {
    if (e.key === 'ArrowRight') act(() => ctl.next())();
    else if (e.key === 'ArrowLeft') act(() => ctl.prev())();
    else if (e.key === ' ' && e.target === document.body) {
      e.preventDefault();
      act(() => ctl.toggle())();
    }
  }

  const current = $derived(steps[snap.index]);
</script>

<svelte:window onkeydown={onKey} />

<section class="mt-10 border-t border-hairline pt-6" aria-label="player">
  <p class="font-mono text-[11px] uppercase tracking-[0.14em]">
    {labels.step}
    {snap.index + 1} / {snap.length}
  </p>
  <p class="mt-2 text-[17px]" aria-live="polite">
    {current?.explain.key}
    {JSON.stringify(current?.explain.params ?? {})}
  </p>

  <div class="mt-6 flex items-center gap-3">
    <button
      class="border border-ink px-3 py-1 disabled:border-hairline disabled:text-hairline"
      disabled={snap.atStart}
      onclick={act(() => ctl.prev())}>{labels.prev}</button
    >
    <button class="border border-ink bg-ink px-3 py-1 text-paper" onclick={act(() => ctl.toggle())}>
      {snap.playing ? labels.pause : labels.play}
    </button>
    <button
      class="border border-ink px-3 py-1 disabled:border-hairline disabled:text-hairline"
      disabled={snap.atEnd}
      onclick={act(() => ctl.next())}>{labels.next}</button
    >
    <button class="px-3 py-1 underline" onclick={act(() => ctl.reset())}>{labels.reset}</button>
    <input
      class="flex-1"
      type="range"
      min="0"
      max={snap.length - 1}
      value={snap.index}
      aria-label={labels.step}
      oninput={(e) => act(() => ctl.goTo(+e.currentTarget.value))()}
    />
  </div>
</section>
