import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const topics = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/topics' }),
  schema: z.object({
    topic: z.string(),
    lang: z.enum(['zh-TW', 'en']),
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

export const collections = { topics };
