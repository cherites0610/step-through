<script lang="ts">
  import Player from '../../player/Player.svelte';
  import ArrayView from './ArrayView.svelte';
  import MergeView from './MergeView.svelte';
  import CallStack from './CallStack.svelte';
  import { bubbleSort, bubblePseudocode } from '../../../core/sorting/bubble';
  import { insertionSort, insertionPseudocode } from '../../../core/sorting/insertion';
  import { selectionSort, selectionPseudocode } from '../../../core/sorting/selection';
  import { mergeSort, mergePseudocode } from '../../../core/sorting/merge';
  import { quickSort, quickPseudocode } from '../../../core/sorting/quick';
  import { parseInput, presetsFor } from '../../../core/sorting/input';
  import type { PivotStrategy, SortAlgorithm } from '../../../core/sorting/types';
  import { explain, t, type Locale } from '../../../i18n';
  import { track } from '../../../lib/analytics';

  type Algo = 'insertion' | 'bubble' | 'selection' | 'merge' | 'quick';

  let { lang, algo, initial }: { lang: Locale; algo: Algo; initial: number[] } = $props();

  const algos: Record<Algo, { run: SortAlgorithm; code: string[] }> = {
    insertion: { run: insertionSort, code: insertionPseudocode },
    bubble: { run: bubbleSort, code: bubblePseudocode },
    selection: { run: selectionSort, code: selectionPseudocode },
    merge: { run: mergeSort, code: mergePseudocode },
    quick: { run: quickSort, code: quickPseudocode },
  };

  const text = $derived(t(lang));
  const impl = $derived(algos[algo]);
  const preset = $derived(presetsFor(algo));
  const recursive = $derived(algo === 'merge' || algo === 'quick');
  // 全形冒號只用在中文
  const colon = $derived(lang === 'en' ? ': ' : '：');

  let values = $state<number[]>([...initial]);
  let draft = $state(initial.join(', '));
  let error = $state<string | null>(null);
  let pivot = $state<PivotStrategy>('last');

  const steps = $derived(impl.run(values, { pivot }));

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
      track('custom_input', { topic: algo, count: r.values.length });
    } else {
      error = text.input.errors[r.error];
    }
  }

  const chip = 'h-9 border border-hairline px-3 text-[13px] hover:border-ink';
  const pivots: { value: PivotStrategy; label: () => string }[] = [
    { value: 'first', label: () => text.input.pivotFirst },
    { value: 'last', label: () => text.input.pivotLast },
    { value: 'median', label: () => text.input.pivotMedian },
  ];
</script>

<Player {steps} labels={text}>
  {#snippet children(step, index)}
    <div class="grid gap-0 lg:grid-cols-[1fr_340px]">
      <section class="min-w-0 border-hairline px-4 py-6 lg:border-r lg:px-8">
        <form class="mb-6 flex flex-wrap items-end gap-3" onsubmit={apply} novalidate>
          <label class="grid min-w-56 flex-1 gap-1">
            <span class="font-mono text-[11px] uppercase tracking-[0.14em]">{text.input.label}</span>
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
          <button type="button" class={chip} onclick={() => setValues(preset.random())}>
            {text.input.random}
          </button>
          <button type="button" class={chip} onclick={() => setValues(preset.best())}>
            {algo === 'quick' ? text.input.quickBest : text.input.best}
          </button>
          <button type="button" class={chip} onclick={() => setValues(preset.worst())}>
            {algo === 'quick' ? text.input.quickWorst : text.input.worst}
          </button>
        </form>
        {#if error}
          <p id="input-error" class="-mt-3 mb-4 text-[13px]" role="alert">✕ {error}</p>
        {/if}

        {#if algo === 'quick'}
          <!-- 基準值的選法：切換後重新跑一次，回到第一步 -->
          <fieldset class="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2">
            <legend class="sr-only">{text.input.pivotLegend}</legend>
            <span class="font-mono text-[11px] uppercase tracking-[0.14em]" aria-hidden="true">
              {text.input.pivotLegend}
            </span>
            {#each pivots as p}
              <label
                class="inline-flex h-9 cursor-pointer items-center border border-hairline px-3 text-[13px] hover:border-ink has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-paper has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink"
              >
                <input type="radio" class="sr-only" name="pivot" value={p.value} bind:group={pivot} />
                {p.label()}
              </label>
            {/each}
          </fieldset>
          <p class="mb-6 max-w-[65ch] text-[13px] leading-[1.7]">{text.input.quickHint}</p>
        {/if}

        <!-- 圖版舞台：四角套準十字、底下網點 -->
        <div
          class="plate relative border border-hairline px-4 py-6"
          style="background-image: radial-gradient(var(--color-hairline) 1px, transparent 1px); background-size: 16px 16px;"
        >
          <span class="reg tl" aria-hidden="true"></span>
          <span class="reg tr" aria-hidden="true"></span>
          <span class="reg bl" aria-hidden="true"></span>
          <span class="reg br" aria-hidden="true"></span>
          {#if algo === 'merge'}
            <MergeView
              state={step.state}
              leftLabel={text.input.mergeLeft}
              rightLabel={text.input.mergeRight}
              outLabel={text.input.mergeOut}
              ariaLabel={`${text.input.arrayLabel}${colon}${step.state.arr.join(', ')}`}
            />
          {:else}
            <ArrayView
              state={step.state}
              highlight={step.highlight}
              keyLabel={text.input.key}
              minLabel={text.input.min}
              pivotLabel={text.input.pivotTag}
              extra={algo === 'quick'}
              ariaLabel={`${text.input.arrayLabel}${colon}${step.state.arr.join(', ')}`}
            />
          {/if}
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
          class="mt-2 max-w-[65ch] text-[17px] leading-[1.7] {recursive ? 'min-h-[11rem]' : 'min-h-[7.5rem]'}"
          aria-live="polite"
        >
          {explain(lang, step.explain)}
        </p>

        {#if recursive}
          <div class="mt-4">
            <CallStack
              frames={step.state.stack}
              fn={algo === 'quick' ? 'quickSort' : 'mergeSort'}
              label={text.input.callStack}
              empty={text.input.stackEmpty}
            />
          </div>
        {/if}

        <p class="mt-6 font-mono text-[11px] uppercase tracking-[0.14em]">{text.pseudocode}</p>
        <ol class="mt-2 font-mono text-[13px] leading-[1.9]">
          {#each impl.code as line, i}
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
