/**
 * 章節撰寫守則（docs/content-guide.md）裡可以自動檢查的規則。
 * 直接讀 MDX 原始檔，不需要建置。
 */
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { subjects } from './data/subjects';

const root = path.resolve(__dirname, '..');
const chaptersDir = path.join(root, 'src/content/chapters');
const questionsDir = path.join(root, 'src/content/questions');
const registry = fs.readFileSync(path.join(root, 'src/components/content/index.ts'), 'utf8');

const walk = (dir: string): string[] =>
  fs.existsSync(dir)
    ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]))
    : [];

/** frontmatter（只取單行的 key: value）與內文 */
function parse(file: string) {
  const src = fs.readFileSync(file, 'utf8');
  const m = src.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`${file}：缺少 frontmatter`);
  const fm = Object.fromEntries(
    m[1]
      .split('\n')
      .map((l) => l.match(/^(\w+):\s*(.*)$/))
      .filter((x): x is RegExpMatchArray => !!x)
      .map((x) => [x[1], x[2].trim()]),
  );
  return { fm, body: m[2] };
}

/** 去掉 ``` 程式碼區塊與行內 `code`，只留正文 */
const prose = (body: string) => body.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');

/** 相鄰兩行都是 (A)／(a) 這類選項：Markdown 會把它們合併成一段 */
function mergedOptionLines(body: string) {
  const lines = prose(body).split('\n');
  const opt = /^\s*\(([A-Ea-e])\)/;
  return lines.flatMap((l, i) => (i > 0 && opt.test(l) && opt.test(lines[i - 1]) ? [lines[i - 1].trim().slice(0, 30)] : []));
}

const chapterOf = (subjectId: string, chapterId: string) =>
  subjects.find((s) => s.id === subjectId)?.chapters.find((c) => c.id === chapterId);

const conceptFiles = walk(chaptersDir).filter((f) => f.endsWith('.mdx'));

describe('觀念說明（src/content/chapters）', () => {
  it('至少有一篇（第 1 章是範本）', () => {
    expect(conceptFiles.length).toBeGreaterThan(0);
  });

  for (const file of conceptFiles) {
    const rel = path.relative(chaptersDir, file);
    const [subjectId, name] = rel.split(path.sep);
    const chapterId = name.replace(/\.mdx$/, '');
    const { fm, body } = parse(file);
    const chapter = chapterOf(subjectId, chapterId);

    describe(rel, () => {
      it('對應到 subjects.ts 的章節，frontmatter 一致且有 summary', () => {
        expect(chapter, `${subjectId}/${chapterId} 不在 subjects.ts`).toBeDefined();
        expect(fm.subject).toBe(subjectId);
        expect(fm.chapter).toBe(chapterId);
        expect(fm.summary?.length ?? 0).toBeGreaterThan(10);
      });

      it('沒有互動單元頁的單元，都有同名的 ### 段落，順序與單元一致；不用 ## 標題', () => {
        const h3 = [...body.matchAll(/^### (.+)$/gm)].map((m) => m[1].trim());
        const expected = chapter!.units.filter((u) => !u.topic).map((u) => u.title);
        expect(h3.filter((h) => expected.includes(h))).toEqual(expected);
        for (const h of h3) expect([...chapter!.units.map((u) => u.title), '常見陷阱', '專有名詞'], `多出的 ### 段落：${h}`).toContain(h);
        expect(body.match(/^## /m), '觀念說明不用 ## 標題').toBeNull();
      });

      it('最後一段是「專有名詞」表；正文用粗體加英文引入的名詞都收在表裡', () => {
        const h3 = [...body.matchAll(/^### (.+)$/gm)].map((m) => m[1].trim());
        expect(h3.at(-1), '最後一個 ### 要是「專有名詞」').toBe('專有名詞');
        if (h3.includes('常見陷阱')) expect(h3.at(-2), '「常見陷阱」緊接在「專有名詞」之前').toBe('常見陷阱');

        const [main, glossary] = body.split(/^### 專有名詞$/m);
        const rows = glossary
          .split('\n')
          .filter((l) => l.startsWith('|'))
          .map((l) => l.slice(1, -1).split(' | ').map((c) => c.trim()));
        expect(rows[0], '表頭是「名詞 | 英文 | 說明」').toEqual(['名詞', '英文', '說明']);
        const terms = rows.slice(2);
        expect(terms.length).toBeGreaterThanOrEqual(5);
        for (const r of terms) {
          expect(r.length, r.join(' | ')).toBe(3);
          for (const c of r) expect(c.length, r.join(' | ')).toBeGreaterThan(0);
        }

        const names = terms.map((r) => r[0]);
        for (const [, term] of prose(main).matchAll(/\*\*([^*]+)\*\*（[A-Za-z]/g))
          expect(names.some((n) => n.includes(term)), `「${term}」沒有收進專有名詞表`).toBe(true);
      });

      it('章末檢核 4～6 條，都以「能」開頭', () => {
        const list = chapter!.checklist ?? [];
        expect(list.length).toBeGreaterThanOrEqual(4);
        expect(list.length).toBeLessThanOrEqual(6);
        for (const item of list) expect(item.startsWith('能'), item).toBe(true);
      });

      it('圖號是「章-序號」且從 1 連續；用到的圖都已登記', () => {
        const nos = [...body.matchAll(/<Figure no="(\d+)-(\d+)"/g)].map((m) => [Number(m[1]), Number(m[2])]);
        for (const [ch] of nos) expect(ch, '圖號的章要等於章節編號').toBe(chapter!.no);
        expect(nos.map(([, k]) => k)).toEqual(nos.map((_, i) => i + 1));
        for (const [, tag] of body.matchAll(/<([A-Z]\w+)/g)) expect(registry, `${tag} 沒有在 src/components/content/index.ts 登記`).toContain(tag);
      });

      it('不用 $…$ 寫公式（改用 <M t="..." />）；選項不擠在相鄰兩行', () => {
        expect(prose(body).includes('$'), '正文裡有 $').toBe(false);
        expect(mergedOptionLines(body)).toEqual([]);
      });
    });
  }
});

describe('考題（src/content/questions）', () => {
  const byChapter = new Map<string, string[]>();
  for (const f of walk(questionsDir).filter((f) => f.endsWith('.mdx'))) {
    const key = path.relative(questionsDir, path.dirname(f));
    byChapter.set(key, [...(byChapter.get(key) ?? []), f]);
  }

  for (const [key, files] of byChapter) {
    const [subjectId, chapterId] = key.split(path.sep);
    const hasConcept = fs.existsSync(path.join(chaptersDir, subjectId, `${chapterId}.mdx`));

    describe(key, () => {
      it('order 從 1 連續，檔名是兩位數的 order', () => {
        const orders = files.map((f) => [Number(parse(f).fm.order), path.basename(f, '.mdx')] as const).sort((a, b) => a[0] - b[0]);
        expect(orders.map(([o]) => o)).toEqual(orders.map((_, i) => i + 1));
        for (const [o, name] of orders) expect(name).toBe(String(o).padStart(2, '0'));
      });

      it('每題都有詳解；不用 $…$；選項不擠在相鄰兩行', () => {
        for (const f of files) {
          const { fm, body } = parse(f);
          expect(fm.subject).toBe(subjectId);
          expect(fm.chapter).toBe(chapterId);
          expect(body, `${path.basename(f)} 缺少 <Solution>`).toMatch(/<Solution>[\s\S]+<\/Solution>/);
          expect(prose(body).includes('$'), `${path.basename(f)} 正文裡有 $`).toBe(false);
          expect(mergedOptionLines(body), path.basename(f)).toEqual([]);
        }
      });

      if (hasConcept) {
        it('寫好觀念說明的章節有 8～12 題', () => {
          expect(files.length).toBeGreaterThanOrEqual(8);
          expect(files.length).toBeLessThanOrEqual(12);
        });
      }
    });
  }
});
