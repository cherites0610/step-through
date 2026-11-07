---
version: 1
slug: "topic-page"
primary_target: "topic-page"
related_targets: []
---

# Surface brief: topic page (visualizer shell)

Scope: every topic page (sorting x5, AVL insert). Mode: Operate (the visualizer); the explanatory content below it is Read, inheriting the same world.

Audience/job: Taiwanese CS students self-studying and teachers projecting. Task: enter data, step forward/back, understand why each step happens. Constraints: zh-TW, SVG stage, Tailwind, 50KB JS budget, projector-legible, no colour-only state.

## Direction contract

THESIS: A calm printed plate, not a dashboard. Near-white stock, hairlines, and one quiet periwinkle; only the data and the active element carry visual weight. Refuses the neon/dark AI-tool look, the cartoon look, and the dense grey VisuAlgo look.
OWN-WORLD: Ground #F5F4F6 drifting to #FAF6F5 / #EEF3EF at edges; ink #16181A (never pure black); seal/selection #DCDDF3; hairlines #C9C7C4 1px; no shadows, gradients, or glow. One grotesque (Noto Sans TC, 400/500) for UI and prose, display 400 at -0.02em; tabular mono (JetBrains Mono) for numbers, indices, pseudocode, and 11px uppercase tracked labels. Registration crosshairs mark the stage corners; a dot matrix fills the stage ground. State uses marks as well as colour: active = filled ink, done = periwinkle fill, hover/focus = outline plus mark.
STORY: The visitor sees the algorithm as one plate they can touch, grasps the current step in one sentence, and types their own data to try again.
FIRST VIEWPORT: Standard shell (56px top bar of topics, 220px chapter rail, 340px right column). Centre: plate title (44px display) over the stage framed by corner crosshairs; array/tree on dot matrix; below, a three-cell hairline stats row (比較, 位移, 已排序). Right column: step counter label, one-sentence explanation at 17px, pseudocode with the live line tinted periwinkle. Bottom 72px bar: reset, back, play (filled ink, the only filled control), next, timeline, step count, speed. Primary action is play.
FORM: design annual plate section (challenger, catalogId design-annual-s-plate-section), seed:a0b44c9cd8ac4720. Signature move: the stage as a registered plate — crosshair corners and dot matrix — while the active element inverts to filled ink.

Adaptations: a projection mode raises type scale and contrast (ink on #FFFFFF, hairlines to 2px); mobile moves controls to a fixed bottom bar; reduced motion stops all transitions except step changes. Risk to watch: reads cold; counter with warmth in the edge-drift grounds and a visible invitation to type your own data.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
