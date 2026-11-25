---
version: 2
slug: "home-page"
primary_target: "home-page"
related_targets: ["subject-map"]
---

# Surface brief: home page — pick a subject (/zh-TW/; the only locale)

Scope: the site root per locale. Mode: Persuade (landing), code-led build inside the established Plate Section world; no new identity.

Audience/job: Taiwanese students preparing for CS/IM graduate-school entrance exams (資工所、資管所) first; transfer and civil-service exam takers and teachers second. Action: pick a subject and open its map (primary), or go straight to the first live subject (資料結構). Proof: a real excerpt of the data-structures map (chapters 5 → 6 → 8), rendered statically. Constraints: static HTML first viewport, no framework JS (progress counts via a few lines of vanilla JS from localStorage, hidden when empty), Taiwanese terminology, no card grids, no eyebrow above headings, drawn SVG marks not glyphs.

Structure: SUBJECT CATALOGUE. Subjects grouped by exam track (資工所 / 資管所) as hairline columns; each subject is a row marked live or coming soon, with "已掌握 n / N" at the row end when the visitor has progress.

## Direction contract

THESIS: The home page is the contents plate of an exam-prep annual: the visitor reads which subjects exist and picks one. Refuses hero-plus-feature-cards, cram-school banner ads, and gamified "start your journey" looks.
OWN-WORLD: unchanged from DESIGN.md (paper #F5F4F6 with edge drift, ink #16181A, hairline #C9C7C4, periwinkle #DCDDF3 only for live rows on hover and mastered nodes in the specimen). Live subject = filled square mark; coming soon = dashed square mark plus the words.
STORY: In one viewport the visitor reads that this turns an exam subject into a map they can work through chapter by chapter, sees a real piece of that map, and sees which subjects are ready.
FIRST VIEWPORT: 56px top bar (wordmark, projection toggle). Left: display line, one lead sentence, primary action "從資料結構開始", secondary "看所有科目". Right: the registered specimen plate showing three real map nodes and their prerequisite edges. Subject catalogue begins right under the fold line.
FORM: course-contents plate; signature move is the specimen plate built from the real map data.
