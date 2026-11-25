import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const topics = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/topics' }),
  schema: z.object({
    topic: z.string(),
    lang: z.enum(['zh-TW']),
    /** 對應的視覺化元件 */
    kind: z.enum(['sorting', 'tree']),
    algo: z.enum(['insertion', 'bubble', 'selection', 'merge', 'quick', 'avl']),
    title: z.string(),
    /** 英文原文，首次出現時附上利於搜尋 */
    titleEn: z.string(),
    description: z.string(),
    example: z.array(z.number()),
    complexity: z.object({
      best: z.string(),
      average: z.string(),
      worst: z.string(),
      space: z.string(),
      /** 排序才有「穩定」的概念；其他主題省略這一列 */
      stable: z.boolean().optional(),
    }),
    faq: z.array(z.object({ q: z.string(), a: z.string() })),
  }),
});

/**
 * 考題（一題一檔）：src/content/questions/<科目>/<章節>/<編號>.mdx。
 * 內文是題目，詳解寫在 <Solution> 裡（章節頁會把它收合起來）。
 */
const questions = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/questions' }),
  schema: z.object({
    subject: z.string(),
    chapter: z.string(),
    /** 章內的排列順序 */
    order: z.number(),
    /** 考古題出處；省略＝自編題 */
    source: z
      .object({ school: z.string(), year: z.number(), dept: z.string(), no: z.string() })
      .optional(),
    kind: z.enum(['choice', 'fill', 'calc', 'proof', 'essay']),
    difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    /** 相關的單元（topic） */
    units: z.array(z.string()).optional(),
  }),
});

export const collections = { topics, questions };
