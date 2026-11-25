/**
 * 內容索引：哪些單元有互動頁、哪些章節有觀念說明、各章有幾題。
 * 地圖、章節頁、章節欄都用同一個規則判斷「這一章有沒有內容」。
 */
import { getCollection } from 'astro:content';
import type { Chapter, Subject } from '../data/subjects';

export type ContentIndex = {
  /** 已上線的主題（有單元頁） */
  live: Set<string>;
  /** 有觀念說明的章節（科目/章節） */
  concepts: Set<string>;
  /** 各章的題數（科目/章節 → 題數） */
  questions: Map<string, number>;
};

export async function contentIndex(lang: string): Promise<ContentIndex> {
  const questions = new Map<string, number>();
  for (const q of await getCollection('questions')) {
    const k = `${q.data.subject}/${q.data.chapter}`;
    questions.set(k, (questions.get(k) ?? 0) + 1);
  }
  return {
    live: new Set((await getCollection('topics')).filter((e) => e.data.lang === lang).map((e) => e.data.topic)),
    concepts: new Set((await getCollection('chapters')).map((e) => `${e.data.subject}/${e.data.chapter}`)),
    questions,
  };
}

export function chapterContent(idx: ContentIndex, s: Subject, c: Chapter) {
  const k = `${s.id}/${c.id}`;
  const liveUnits = c.units.filter((u) => u.topic && idx.live.has(u.topic)).length;
  const concept = idx.concepts.has(k);
  const questions = idx.questions.get(k) ?? 0;
  return { liveUnits, concept, questions, any: concept || questions > 0 || liveUnits > 0 };
}
