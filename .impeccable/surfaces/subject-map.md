---
version: 1
slug: "subject-map"
primary_target: "subject-map"
related_targets: ["home-page", "chapter-page"]
---

# Surface brief: subject map (/zh-TW/<subject>/)

Scope: one page per subject; first is 資料結構 (11 chapters). Mode: Navigate (the map) with a Read fallback (the text list).

Audience/job: exam takers planning and tracking study. Task: see the whole subject at once, understand which chapters depend on which, see own progress, pick the next chapter. Constraints: a real directed acyclic graph of chapter prerequisites (not a list, not a decorative world map); layout computed at build time and emitted as static SVG; progress applied from localStorage with minimal JS; keyboard-navigable; an equivalent text list for screen readers; no colour-only state; prerequisites advise, never lock.

## Direction contract

THESIS: The subject as one registered plate: a prerequisite diagram printed on dot-matrix stock. Layers read top to bottom; a layer is "can be read in parallel". Refuses skill-tree game aesthetics (locks, stars, XP, glowing paths) and the dense flowchart-tool look.
OWN-WORLD: DESIGN.md unchanged. Nodes are square-cornered boxes with mono chapter numbers; edges are 1px ink orthogonal polylines with small filled arrowheads. Five learning states each carry a drawn mark (filled, half-filled, hollow ink, hollow hairline, dashed); mastered also takes the periwinkle fill; selected inverts to filled ink.
STORY: The visitor sees the whole subject in one glance, sees where they stand, and is told one next chapter to open.
FIRST VIEWPORT: 56px top bar (wordmark, subject name, projection toggle). A mono stats line (chapters, interactive units, questions, mastered) and one sentence "建議下一章：XX →". The map stage fills the content width; a 340px node-detail column on lg (selected chapter's units, prerequisites, dependents, primary action "進入章節"). Below the stage: the layered text list.
FORM: Plate Section, second signature plate. Selection highlights the transitive prerequisites and dependents (2px edges) and drops everything else to hairline.

Adaptations: below md the map becomes a vertical topological column with parallel-layer brackets; projection mode thickens hairlines to 2px as elsewhere. Risk to watch: with 20+ chapters in later subjects the graph may get wide; keep node size fixed and let the stage scroll horizontally inside its frame rather than shrinking text.
