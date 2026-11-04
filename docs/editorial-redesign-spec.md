# Editorial redesign specification

## Safety and baseline

Starting commit: `734d6ab95065a615508fbff314dd50665cf368e0`. The initial checkout on `main` was clean. Work is isolated on `feat/portfolio-editorial-redesign`. No merge, push or deployment is authorized. GitHub Pages serves the repository root; the optional build copies public assets to `dist/`. There is no repository Actions deployment workflow.

Before implementation: `npm ci`, lint, static integrity checks, all 17 numerical/theme/physics tests, build and all 16 Edge browser tests passed. npm reported three moderate development dependency advisories. Preserve model weights, metadata, arithmetic, native navigation, disclosures, theme and motion preferences, archive anchors, artwork, clipboard feedback, no-JavaScript content, metadata and deployment files.

## Argument and identity

On this page, Aritra's inspectable computations become an open engineering notebook. The live thing is the trained digit classifier: select a real sample, inspect a neuron, follow its forward calculation and trace its gradient, including a genuine misclassification.

- Identity: Aritra Saha, AI/ML Engineer | Applied AI Developer. Proof: working local computation and direct source links.
- SeeDL: make model internals visible. Proof: scientific viewers, Python SVG core, captured activations and signed connections.
- Infera: turn a CSV into inspectable evidence. Proof: Python analysis, train-only imputation, held-out regression evaluation and report generation.
- PulseShift: connect software with physical signals. Proof: ESP32 firmware and six-pixel LED output, explicitly separated from unqualified motorcycle integration.
- Orion and earlier work: preserve research context and historical engineering breadth without upgrading private findings into independently verified results.
- Practice, biography and contact: explain the engineering approach and provide direct ways to inspect the work or start a conversation.

## Visual system

Direction draw: name-as-monument, seed 1769266725. A single large nameplate, followed by an asymmetric introduction and a generous working laboratory plate. Cool paper `#f0f0eb`, near-black green ink `#202722`, forest green `#245743`. Dark mode uses a green-black ground with pale mint accents. Equal responsive margins, square corners, readable 16px-plus prose. Literata handles editorial headings and reading; JetBrains Mono handles navigation, labels, code and numerical annotations. Self-host one variable Latin Literata WOFF2 and the existing licensed Mono subset. No obsolete font requests.

The generated hero reference establishes the nameplate, two-column introduction and calculation plate geometry. Its invented MNIST label and formulas are not implementation sources: the existing dataset, weights, equations and attribution remain authoritative. Separate SeeDL, Infera and PulseShift references establish feature composition. These are planning images, not shipped screenshots or evidence of project results.

SeeDL uses an open text/diagram spread; Infera uses a dark pipeline plate; PulseShift uses a contrasting embedded-system spread with six discrete LEDs and a static fallback. Existing Orion, SysAI, Relay and Vyren artwork remains available. Archive remains in the document with all original fragment URLs.

User requirements override the skill's generic prohibitions on monospace and diagram rules. The dealt photograph and marquee slots are adapted to actual scientific diagrams and the computational signal sequence: unrelated stock photography, continuously moving words and pinned scrolling would weaken this brief. No WebGL or GSAP dependency is necessary.

## Motion and access

Use CSS and the Web Animations API. Nameplate enters as one legible typographic unit; introduction and figure follow with a short stagger. Project content enters in groups, with bounded diagram transitions. Never hide critical content by default. Cancel running entrance animations when reduced motion is selected. Keep visibility and document-activity gating for continuous motion. No scroll hijacking, artificial loader, or required hover. Controls retain keyboard feedback and native semantics.

## Research and provenance

Reviewed 4 November 2026:

- [Dev Jhawar](https://devjhawar.com/): immediate engineering identity, source-oriented project discovery, tactile controls.
- [Corentin Bernadou](https://www.corentinbernadou.com/) and [his process](https://tympanus.net/codrops/2026/03/05/inside-corentin-bernadous-portfolio-swiss-inspired-layouts-webgl-geometry-and-thoughtful-motion/): typographic hierarchy, disciplined palette and grid. Automated live capture stalled at its loader; the process article supplies context.
- [Arnaud Rocca](https://arnaudrocca.fr/) and [his process](https://tympanus.net/codrops/2026/03/31/arnaud-roccas-portfolio-from-a-gsap-powered-motion-system-to-fluid-webgl/): strong project identities and reusable motion; do not copy its carousel or fluid interaction.
- [ScrollTrigger documentation](https://gsap.com/docs/v3/Plugins/ScrollTrigger/): reviewed capabilities; this native-scrolling composition does not justify the dependency.
- [SeeDL README](https://github.com/iamaritrasaha/seedl), [Infera README](https://github.com/iamaritrasaha/Infera), `infera/ml.py`, `infera/main.py`, [PulseShift README](https://github.com/iamaritrasaha/PulseShift), `src/main.cpp`, `UserConfig.h`: primary content sources. SeeDL README identifies 0.6.0; avoid asserting a live package release from README alone. Infera supports one regression algorithm and in-memory storage. PulseShift is a software prerelease with pending physical qualification. Orion's public repository is unavailable; retain existing explicitly private research content.

No résumé asset or existing résumé destination was found. Do not invent one. Preserve GitHub and contact paths.

## Validation plan

Run all existing commands after implementation. Expand browser coverage to new project links, pipeline semantics and LED controls. Inspect both themes at 320, 390, 768, 1024 and 1440px, navigation, no-JS, reduced motion, disclosure and nested 404 states. Save before/after screenshots. Attempt measured mobile Lighthouse runs; report actual scores and environment limitations. Record external link failures without fabricating replacements.
