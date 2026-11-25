/**
 * 把本機進度套到頁面上。頁面用 data-* 屬性宣告要更新的地方，這支腳本不認得任何頁面：
 *
 * <script type="application/json" data-chapters="科目">[ChapterInfo...]</script>  該科目的章節資料
 * [data-state-for="科目/章節"]     設定 data-state（mastered／learning／ready／blocked），
 *                                  內部的 [data-state-label] 換成狀態文字
 * [data-suggest-for="科目"]        建議下一章；內部的 a[data-suggest-link] 換成那一章（href 依 data-href-base）
 * [data-mastered-of="科目"]        「已掌握 n／N」，n 為 0 時隱藏
 * [data-visit="科目/章節"]         進入這一頁就算開始讀這一章
 * input[data-check="科目/章節"]    章末檢核的單選（name 依項目、value 為 Rating、data-index 為第幾項）
 * [data-done-for="科目/章節"]      這一章全部掌握時才顯示
 * input[data-question="題目 key"]  考題的作答紀錄（value 為 QuestionMark）
 */
import {
  chapterKey,
  chapterStates,
  isMastered,
  parseProgress,
  stateLabels,
  suggestNext,
  type ChapterInfo,
  type Progress,
  type QuestionMark,
  type Rating,
} from './progress';

const KEY = 'step-through:progress';

function load(): Progress {
  try {
    return parseProgress(localStorage.getItem(KEY));
  } catch {
    return parseProgress(null);
  }
}
function save(p: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {}
}

const all = <T extends Element = HTMLElement>(sel: string) => [...document.querySelectorAll<T>(sel)];

const subjects = new Map<string, ChapterInfo[]>(
  all<HTMLScriptElement>('script[data-chapters]').map((el) => [el.dataset.chapters!, JSON.parse(el.textContent ?? '[]')]),
);

function apply(p: Progress) {
  for (const [subject, chapters] of subjects) {
    const states = chapterStates(subject, chapters, p);
    for (const el of all(`[data-state-for^="${subject}/"]`)) {
      const id = el.dataset.stateFor!.slice(subject.length + 1);
      const st = states[id];
      if (!st) continue;
      el.dataset.state = st;
      el.querySelectorAll('[data-state-label]').forEach((l) => (l.textContent = stateLabels[st]));
    }
    const next = suggestNext(chapters, states);
    for (const el of all(`[data-state-for^="${subject}/"]`)) {
      if (next && el.dataset.stateFor === chapterKey(subject, next.id)) el.dataset.suggested = '';
      else delete el.dataset.suggested;
    }
    for (const el of all(`[data-suggest-for="${subject}"]`)) {
      const a = el.querySelector<HTMLAnchorElement>('a[data-suggest-link]');
      el.hidden = !next;
      if (!next || !a) continue;
      const titles: Record<string, string> = JSON.parse(el.dataset.titles ?? '{}');
      a.href = `${el.dataset.hrefBase}${next.id}/`;
      a.textContent = `${String(next.no).padStart(2, '0')} ${titles[next.id] ?? ''}`;
    }
    for (const el of all(`[data-mastered-of="${subject}"]`)) {
      const n = chapters.filter((c) => states[c.id] === 'mastered').length;
      el.hidden = n === 0;
      el.textContent = `${stateLabels.mastered} ${n} / ${chapters.length}`;
    }
    for (const c of chapters) {
      const done = isMastered(p.chapters[chapterKey(subject, c.id)], c.checks);
      for (const el of all(`[data-done-for="${chapterKey(subject, c.id)}"]`)) el.hidden = !done;
    }
  }
}

let progress = load();

// 進入章節頁或單元頁＝開始讀這一章
for (const el of all('[data-visit]')) {
  const k = el.dataset.visit!;
  if (!progress.chapters[k]?.visited) {
    progress.chapters[k] = { ...progress.chapters[k], visited: true };
    save(progress);
  }
}

// 還原已存的選擇
for (const input of all<HTMLInputElement>('input[data-check]')) {
  input.checked = progress.chapters[input.dataset.check!]?.checks?.[input.dataset.index!] === input.value;
}
for (const input of all<HTMLInputElement>('input[data-question]')) {
  input.checked = progress.questions[input.dataset.question!] === input.value;
}

document.addEventListener('change', (e) => {
  const input = e.target as HTMLInputElement;
  if (input.dataset.check) {
    const k = input.dataset.check;
    const ch = (progress.chapters[k] ??= {});
    ch.checks = { ...ch.checks, [input.dataset.index!]: input.value as Rating };
  } else if (input.dataset.question) {
    progress.questions[input.dataset.question] = input.value as QuestionMark;
  } else return;
  save(progress);
  apply(progress);
});

// 其他分頁更新進度時同步
window.addEventListener('storage', (e) => {
  if (e.key !== KEY) return;
  progress = load();
  apply(progress);
});

apply(progress);
