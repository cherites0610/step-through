<script lang="ts">
  import Player from '../../player/Player.svelte';
  import AvlView from './AvlView.svelte';
  import { avlInsertAll, avlPseudocode } from '../../../core/avl/avl';
  import { avlPresets } from '../../../core/avl/presets';
  import { depthOf, inorder } from '../../../core/avl/types';
  import { parseInput } from '../../../core/sorting/input';
  import { explain, t, type Locale } from '../../../i18n';
  import { track } from '../../../lib/analytics';

  let { lang, initial }: { lang: Locale; initial: number[] } = $props();

  const text = $derived(t(lang));
  const a = $derived(text.avl);

  let values = $state<number[]>([...initial]);
  let draft = $state(initial.join(', '));
  let error = $state<string | null>(null);

  const steps = $derived(avlInsertAll(values));
  const keys = $derived([...new Set(values)].sort((x, y) => x - y));
  const levels = $derived(Math.max(1, ...steps.map((s) => depthOf(s.state.root))));

  function setValues(v: number[]) {
    values = v;
    draft = v.join(', ');
    error = null;
  }

  function apply(e: SubmitEvent) {
    e.preventDefault();
    const r = parseInput(draft);
    if (r.ok) {
      setValues(r.values);
      track('custom_input', { topic: 'avl-insert', count: r.values.length });
    } else {
      error = text.input.errors[r.error];
    }
  }

  const chip = 'h-9 border border-hairline px-3 text-[13px] hover:border-ink';
  const presets = $derived([
    { label: text.input.random, values: () => avlPresets.random() },
    { label: a.ll, values: () => avlPresets.LL },
    { label: a.rr, values: () => avlPresets.RR },
    { label: a.lr, values: () => avlPresets.LR },
    { label: a.rl, values: () => avlPresets.RL },
    { label: a.ascending, values: () => avlPresets.ascending },
  ]);
  const colon = $derived(lang === 'en' ? ': ' : '：');
</script>

<Player {steps} labels={text}>
  {#snippet children(step, index)}
    <div class="grid gap-0 lg:grid-cols-[1fr_340px]">
      <section class="min-w-0 border-hairline px-4 py-6 lg:border-r lg:px-8">
        <form class="mb-6 flex flex-wrap items-end gap-3" onsubmit={apply} novalidate>
          <label class="grid min-w-56 flex-1 gap-1">
            <span class="font-mono text-[11px] uppercase tracking-[0.14em]">{a.label}</span>
            <input
              class="h-9 border border-ink bg-paper px-3 font-mono text-[15px]"
              bind:value={draft}
              aria-invalid={error ? 'true' : undefined}
              aria-describedby={error ? 'input-error' : undefined}
              inputmode="numeric"
              autocomplete="off"
            />
          </label>
          <button type="submit" class="h-9 border border-ink bg-ink px-4 text-[13px] text-paper">
            {text.input.apply}
          </button>
        </form>
        {#if error}
          <p id="input-error" class="-mt-3 mb-4 text-[13px]" role="alert">✕ {error}</p>
        {/if}

        <div class="mb-4 flex flex-wrap items-center gap-2">
          {#each presets as p}
            <button type="button" class={chip} onclick={() => setValues(p.values())}>{p.label}</button>
          {/each}
        </div>
        <p class="mb-4 max-w-[65ch] text-[13px] leading-[1.7]">{a.hint}</p>

        <p class="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] tabular-nums">
          {step.state.index === 0
            ? a.notStarted
            : a.progress.replace('{k}', String(step.state.index)).replace('{total}', String(step.state.total))}
        </p>

        <!-- 圖版舞台：四角套準十字、底下網點 -->
        <div
          class="plate relative border border-hairline px-4 py-6"
          style="background-image: radial-gradient(var(--color-hairline) 1px, transparent 1px); background-size: 16px 16px;"
        >
          <span class="reg tl" aria-hidden="true"></span>
          <span class="reg tr" aria-hidden="true"></span>
          <span class="reg bl" aria-hidden="true"></span>
          <span class="reg br" aria-hidden="true"></span>
          <AvlView
            state={step.state}
            highlight={step.highlight}
            {keys}
            {levels}
            insertLabel={a.insertTag}
            emptyLabel={a.emptyTree}
            rootLabel={a.rootSlot}
            rootHint={a.rootHint.replace('{v}', String(values[0]))}
            ariaLabel={`${a.treeLabel}${colon}${inorder(step.state.root)
              .map((n) => n.value)
              .join(', ')}`}
          />
        </div>

        <!-- 計數面板 -->
        <dl class="mt-6 grid grid-cols-3 border-y border-hairline">
          {#each Object.entries(step.stats ?? {}) as [k, v]}
            <div class="border-r border-hairline px-4 py-3 last:border-r-0">
              <dt class="font-mono text-[11px] uppercase tracking-[0.14em]">
                {text.stats[k as keyof typeof text.stats]}
              </dt>
              <dd class="font-mono text-[28px] font-medium tabular-nums">{v}</dd>
            </div>
          {/each}
        </dl>
      </section>

      <aside class="min-w-0 px-4 py-6 lg:px-6">
        <p class="font-mono text-[11px] uppercase tracking-[0.14em]">{text.explanation}</p>
        <p
          class="mt-2 max-w-[65ch] text-[17px] leading-[1.7] {lang === 'en' ? 'min-h-[15rem]' : 'min-h-[11rem]'}"
          aria-live="polite"
        >
          {explain(lang, step.explain)}
        </p>

        <div class="mt-4 border-t border-hairline pt-3">
          <p class="font-mono text-[11px] uppercase tracking-[0.14em]">{a.bfTitle}</p>
          <p class="mt-1 text-[13px] leading-[1.7]">{a.bfBody}</p>
        </div>

        <p class="mt-6 font-mono text-[11px] uppercase tracking-[0.14em]">{text.pseudocode}</p>
        <ol class="mt-2 overflow-x-auto font-mono text-[13px] leading-[1.9]">
          {#each avlPseudocode as line, i}
            <li
              class="whitespace-pre px-2 {i === step.line ? 'bg-stamp outline outline-1 outline-ink' : ''}"
              aria-current={i === step.line ? 'step' : undefined}
            >
              {line}
            </li>
          {/each}
        </ol>
      </aside>
    </div>
  {/snippet}
</Player>

<style>
  .reg {
    position: absolute;
    width: 11px;
    height: 11px;
    background:
      linear-gradient(var(--color-ink), var(--color-ink)) center / 100% 1px no-repeat,
      linear-gradient(var(--color-ink), var(--color-ink)) center / 1px 100% no-repeat;
  }
  .tl { top: 4px; left: 4px; }
  .tr { top: 4px; right: 4px; }
  .bl { bottom: 4px; left: 4px; }
  .br { bottom: 4px; right: 4px; }
</style>
