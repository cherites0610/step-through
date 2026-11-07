<script lang="ts">
  import Player from '../../player/Player.svelte';
  import ArrayView from './ArrayView.svelte';
  import { bubbleSort, bubblePseudocode } from '../../../core/sorting/bubble';
  import { insertionSort, insertionPseudocode } from '../../../core/sorting/insertion';
  import { selectionSort, selectionPseudocode } from '../../../core/sorting/selection';
  import { parseInput, presets } from '../../../core/sorting/input';
  import type { SortAlgorithm } from '../../../core/sorting/types';
  import { explain, t, type Locale } from '../../../i18n';

  type Algo = 'insertion' | 'bubble' | 'selection';

  let { lang, algo, initial }: { lang: Locale; algo: Algo; initial: number[] } = $props();

  const algos: Record<Algo, { run: SortAlgorithm; code: string[] }> = {
    insertion: { run: insertionSort, code: insertionPseudocode },
    bubble: { run: bubbleSort, code: bubblePseudocode },
    selection: { run: selectionSort, code: selectionPseudocode },
  };

  const text = $derived(t(lang));
  const impl = $derived(algos[algo]);

  let values = $state<number[]>([...initial]);
  let draft = $state(initial.join(', '));
  let error = $state<string | null>(null);

  const steps = $derived(impl.run(values));

  function setValues(v: number[]) {
    values = v;
    draft = v.join(', ');
    error = null;
  }

  function apply(e: SubmitEvent) {
    e.preventDefault();
    const r = parseInput(draft);
    if (r.ok) setValues(r.values);
    else error = text.input.errors[r.error];
  }

  const chip =
    'h-9 border border-hairline px-3 text-[13px] hover:border-ink';
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
          <button type="button" class={chip} onclick={() => setValues(presets.random())}>
            {text.input.random}
          </button>
          <button type="button" class={chip} onclick={() => setValues(presets.best())}>
            {text.input.best}
          </button>
          <button type="button" class={chip} onclick={() => setValues(presets.worst())}>
            {text.input.worst}
          </button>
        </form>
        {#if error}
          <p id="input-error" class="-mt-3 mb-4 text-[13px]" role="alert">✕ {error}</p>
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
          <ArrayView
            state={step.state}
            highlight={step.highlight}
            keyLabel={text.input.key}
            minLabel={text.input.min}
            ariaLabel={`${text.input.arrayLabel}：${step.state.arr.join(', ')}`}
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
        <p class="mt-2 min-h-[7.5rem] max-w-[65ch] text-[17px] leading-[1.7]" aria-live="polite">
          {explain(lang, step.explain)}
        </p>

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
