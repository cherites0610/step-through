---
version: 1
slug: "chapter-page"
primary_target: "chapter-page"
related_targets: ["subject-map", "topic-page"]
---

# Surface brief: chapter page (/zh-TW/<subject>/<chapter>/)

Scope: every chapter of every subject. Mode: Read (concepts), then Practise (questions, checklist).

Audience/job: an exam taker in one study session. Task: read the exam-relevant concepts, open the interactive units, work through past and original exam questions, then self-assess. Constraints: static HTML; MDX content for SEO; questions show their source (school, year, department, number) or "自編"; answers collapse behind native details; progress (question marks, checklist ratings) stored locally; no gamification.

## Direction contract

THESIS: A chapter of a well-set study book, printed in the Plate Section world: one reading column, hairline-separated sections, no cards. Refuses cram-school handout clutter (boxed tips, coloured callouts, mascots).
OWN-WORLD: DESIGN.md unchanged. Section order is fixed: 觀念說明 → 互動單元 → 考題練習 → 章末自我檢核, each opened by a 28px headline and separated by a 1px ink rule. Question headers use the mono label style; difficulty is three drawn 6px squares.
STORY: The visitor knows where this chapter sits in the subject (rail and mini-map), learns it, practises it, and leaves with an honest self-rating that updates the map.
FIRST VIEWPORT: 56px top bar (wordmark, "科目 · 章節編號" label, chapter title, projection toggle). Left 220px rail of all chapters in the subject with state marks. Centre: chapter title (44px display), one-paragraph summary of what the exam asks about this chapter, then 觀念說明. Right 340px (lg): mini-map of direct prerequisites and dependents, checklist progress; sticky.
FORM: reading plate; the only stage-like elements are the small static data figures inside questions.
