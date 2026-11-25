/**
 * 學習進度：只存在本機（localStorage），不需要帳號。
 * 這裡是純函式（狀態怎麼算），讀寫 localStorage 與更新畫面在 progress-dom.ts。
 */

/** 章末檢核的自評：還不熟／大致會／已掌握 */
export type Rating = 'unsure' | 'partial' | 'mastered';
/** 考題的作答紀錄：答對／答錯／要再看 */
export type QuestionMark = 'right' | 'wrong' | 'review';

export type ChapterProgress = { visited?: boolean; checks?: Record<string, Rating> };
export type Progress = {
  v: 1;
  /** key 是「科目/章節」 */
  chapters: Record<string, ChapterProgress>;
  /** key 是「科目/章節/題號」 */
  questions: Record<string, QuestionMark>;
};

/**
 * 章節的學習狀態（地圖、章節欄共用）：
 * mastered 已掌握：章末檢核每一項都自評為已掌握
 * learning 學習中：讀過或開始自評，但還沒全部掌握
 * ready    可以開始：先修都已掌握（或沒有先修）
 * blocked  建議先讀先修：還有先修沒掌握；仍然可以點進去
 */
export type ChapterState = 'mastered' | 'learning' | 'ready' | 'blocked';

/** 狀態的文字（螢幕閱讀器與圖例用） */
export const stateLabels: Record<ChapterState, string> = {
  mastered: '已掌握',
  learning: '學習中',
  ready: '可以開始',
  blocked: '建議先讀先修',
};

export type ChapterInfo = { id: string; no: number; prereqs: string[]; checks: number };

export const emptyProgress = (): Progress => ({ v: 1, chapters: {}, questions: {} });

export const chapterKey = (subject: string, chapter: string) => `${subject}/${chapter}`;

export function isMastered(p: ChapterProgress | undefined, checks: number) {
  if (!p?.checks || checks === 0) return false;
  for (let i = 0; i < checks; i++) if (p.checks[i] !== 'mastered') return false;
  return true;
}

export function chapterStates(subject: string, chapters: ChapterInfo[], progress: Progress) {
  const mastered = new Set(
    chapters.filter((c) => isMastered(progress.chapters[chapterKey(subject, c.id)], c.checks)).map((c) => c.id),
  );
  const states: Record<string, ChapterState> = {};
  for (const c of chapters) {
    const p = progress.chapters[chapterKey(subject, c.id)];
    if (mastered.has(c.id)) states[c.id] = 'mastered';
    else if (p?.visited || Object.keys(p?.checks ?? {}).length > 0) states[c.id] = 'learning';
    else if (c.prereqs.every((id) => mastered.has(id))) states[c.id] = 'ready';
    else states[c.id] = 'blocked';
  }
  return states;
}

/** 建議下一章：「可以開始」中編號最小的；沒有就接著讀「學習中」編號最小的；全部掌握時為 undefined */
export function suggestNext(chapters: ChapterInfo[], states: Record<string, ChapterState>) {
  const sorted = [...chapters].sort((a, b) => a.no - b.no);
  return sorted.find((c) => states[c.id] === 'ready') ?? sorted.find((c) => states[c.id] === 'learning');
}

/** 不完整或舊版的資料一律當成空的，避免壞資料讓頁面出錯 */
export function parseProgress(raw: string | null): Progress {
  try {
    const p = JSON.parse(raw ?? '');
    if (p && p.v === 1 && typeof p.chapters === 'object' && typeof p.questions === 'object') return p;
  } catch {}
  return emptyProgress();
}
