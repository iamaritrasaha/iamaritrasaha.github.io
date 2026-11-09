# Maintenance record: 5 November 2026

## Baseline and scope

The clean local and remote `main` started at `7dd38970da66fd3a2f2c679691ff47b9e0a19bf3`. GitHub Pages deployment `7571151382`, [run 42011000700](https://github.com/iamaritrasaha/iamaritrasaha.github.io/actions/runs/42011000700), successfully served that commit from the root of `main`. Pages uses its existing legacy build/deployment configuration, HTTPS and `.nojekyll`.

Maintenance uses `codex/portfolio-maintenance`. The approved site design, mathematical engines, trained weights, timing and interactions are preserved. The only requested visual correction removes the Embedded Lab current-page link's additional text underline; the shared navigation pseudo-element still supplies its single underline and focus styling remains intact.

Baseline `npm ci` and lint passed. Static tests/build exposed one Windows CRLF size-budget inconsistency in `welcome-start.js`; the check now applies the existing canonical LF convention to all text budgets without changing any limits. Baseline Edge browser tests passed 93 of 94 scenarios. The native Chromium zoom test assumed a 1280px content viewport, but this Windows window supplied 1264px. It now measures the unzoomed content width and still verifies actual 200%/400% zoom, overflow and working controls.

## Dependency and reference inventory

Before removal, the audit inventoried all 111 tracked files under `concepts/`, `docs/bitbench-review/`, `docs/creative-review/` and `docs/review/`. It checked exact paths/filenames across tracked text, page script/stylesheet references, CSS URLs, ES-module imports, tests, preview/build scripts and directory-level claims in historical reports. The unchanged build copies public pages and `assets/`, not concepts or review evidence. Root-based Pages publishing is unchanged; removal is not presented as a runtime performance improvement.

| Area                               | Decision and evidence                                                                                                                                                                                                                                                                                                                                                        |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `concepts/` (23 files)             | Retain all source, preview/capture tools and nine review outputs. `concepts/README.md` documents their reproduction and source inspiration; `portfolio-motion-review.md` refers to the concept and evidence. The old experiment branch name is historical context, not a required branch.                                                                                    |
| `docs/bitbench-review/` (28 files) | Retain. `portfolio-motion-review.md` links final images, relief and walkthrough media, audits, and explicitly describes the project/concept reference captures.                                                                                                                                                                                                              |
| `docs/creative-review/` (45 files) | Retain comparison sheets, entry frame, walkthrough and raw Lighthouse audit (five files). Archive the 40 individual before/after JPEGs in existing Git history: the sheets visibly include all ten positions, before and after, at both widths. No source, test or document names an individual removed JPEG; the report's general sentence now links the immutable archive. |
| `docs/review/` (15 files)          | Retain. The redesign report cites screenshots, project/state evidence, Lighthouse and the link audit. Practice captures remain historical evidence of the documented heading correction.                                                                                                                                                                                     |
| `assets/`                          | Retain all assets. Earlier CSS layers still contribute active rules. Historical font licenses, project identities, model data/fixtures, training source and attribution remain. The legacy `portfolio-open-graph.png` is intentionally maintained for cached metadata and checked for equality with the current social card.                                                 |

No history, tags, releases, license notices or provenance were removed. The public README already provides a concise personal introduction and links development notes, so it remains unchanged. New generated individual creative-review JPEGs are ignored; curated review sheets and other cited evidence remain tracked.

## Archived individual captures

Removed from the current tree: **40 files, 1,958,460 bytes**. Originals remain at [the immutable baseline archive](https://github.com/iamaritrasaha/iamaritrasaha.github.io/tree/7dd38970da66fd3a2f2c679691ff47b9e0a19bf3/docs/creative-review). Paths below are relative to `docs/creative-review/`.

| File                         | Bytes |
| ---------------------------- | ----: |
| `after-1440-about.jpg`       | 67701 |
| `after-1440-contact.jpg`     | 55355 |
| `after-1440-expertise.jpg`   | 63613 |
| `after-1440-index.jpg`       | 64478 |
| `after-1440-infera.jpg`      | 40145 |
| `after-1440-orion.jpg`       | 65944 |
| `after-1440-pulseshift.jpg`  | 60825 |
| `after-1440-seedl.jpg`       | 75774 |
| `after-1440-top.jpg`         | 90827 |
| `after-1440-work.jpg`        | 63275 |
| `after-390-about.jpg`        | 39742 |
| `after-390-contact.jpg`      | 35954 |
| `after-390-expertise.jpg`    | 34998 |
| `after-390-index.jpg`        | 38307 |
| `after-390-infera.jpg`       | 24608 |
| `after-390-orion.jpg`        | 39552 |
| `after-390-pulseshift.jpg`   | 32362 |
| `after-390-seedl.jpg`        | 33630 |
| `after-390-top.jpg`          | 33880 |
| `after-390-work.jpg`         | 24088 |
| `before-1440-about.jpg`      | 63295 |
| `before-1440-contact.jpg`    | 47775 |
| `before-1440-expertise.jpg`  | 57919 |
| `before-1440-index.jpg`      | 61835 |
| `before-1440-infera.jpg`     | 62775 |
| `before-1440-orion.jpg`      | 64720 |
| `before-1440-pulseshift.jpg` | 63030 |
| `before-1440-seedl.jpg`      | 67704 |
| `before-1440-top.jpg`        | 64516 |
| `before-1440-work.jpg`       | 55175 |
| `before-390-about.jpg`       | 37501 |
| `before-390-contact.jpg`     | 32267 |
| `before-390-expertise.jpg`   | 35585 |
| `before-390-index.jpg`       | 37366 |
| `before-390-infera.jpg`      | 34364 |
| `before-390-orion.jpg`       | 38853 |
| `before-390-pulseshift.jpg`  | 33860 |
| `before-390-seedl.jpg`       | 40869 |
| `before-390-top.jpg`         | 35524 |
| `before-390-work.jpg`        | 38469 |

## Remote branch cleanup

Fetched branches and all PRs before deletion. Each candidate below had **zero commits ahead of `main`**, passed an ancestor check, was unprotected, had no open PR using it as head/base, and had no unfinished workflow run. Deletion used the observed SHA as a ref lease so a concurrent update would reject the deletion. These were the explicitly nominated completed branches; recency alone was not used to infer inactivity.

| Deleted branch                    | Verified head                              |
| --------------------------------- | ------------------------------------------ |
| `feat/bitbench-motion-portfolio`  | `9632b5cbde5babb48d5b7635290934ac6f2d895c` |
| `feat/math-welcome-rpm`           | `c97d374fe906e94006ab3f2f718cd6a0d53153ce` |
| `fix/current-social-preview`      | `2459547e4cee564ad6984054df666d1994a11162` |
| `fix/experience-audit`            | `f8708fe893ac2509bb67d86a993e58cae38466b7` |
| `fix/responsive-quality-audit`    | `f37e2e38a5b25631c5ae5892879341a1e5da2476` |
| `fix/welcome-epochs-rpm-fluidity` | `5e4ce1e2a044d129fe681a0446d10bd2689914fc` |
| `fix/welcome-first-paint`         | `10d82b513d5e955dcbcf084b9997859ee8de1a98` |

Automatic merged-PR branch deletion was enabled and read back successfully. `main` and its history remain intact.

## Refactor and safeguards

- `script.js`: named pipeline-entrance and disclosure mounts; comments explain cancellation and navigation ownership.
- `assets/creative.js`: independent projection, trace and regression mounts; descriptive control names and explicit worked-example points.
- `assets/bitbench.js`: named inference/animation values and separate activation-bar rendering; welcome cleanup contract documented.
- `assets/embedded.js`: named PWM window/scan constants, waveform-path helper and timing/formatting variables; pause/resume and marker updates documented.
- `assets/projection.js`: descriptive geometry/sample names and camera/rounding comments; arithmetic order is unchanged.
- `scripts/check_site.py`: consistent LF source budgets and verification of indirect local module imports.
- `scripts/lint_syntax.mjs`, `package.json`: syntax checks cover all active top-level JavaScript files; formatting includes package and workflow files.
- `.github/workflows/ci.yml`: read-only PR/main CI on Node 22/24/26, plus Chromium/Firefox on Node 24. SHA-pinned actions and failure-only browser artifacts; no deployment step.
- Documentation describes the final cobalt/citron tokens, CSS cascade, both page controllers, 27 unit tests and 94 browser scenarios. Earlier dated audit claims remain historical.

## Verification evidence

Before the underline correction, eight full-page Chromium screenshots of the refactored site were byte-identical to the baseline: homepage and lab, 390/1440px, light/dark. Captures wait for all fonts, including those first exposed during scrolling. DOM text, control values, SVG paths and document geometry also matched exactly. The underline correction is evaluated separately so it is not hidden inside a visual-parity claim.

Browser validation remains emulation, not physical-device, Safari or screen-reader certification. Final CI, merge and deployment results belong to the PR and completion report, rather than being claimed in advance here.

## Maintenance record: 9 November 2026 - Codebase Cleanup & Baseline Inventory

### Baseline and scope

The clean `main` branch started at commit `aa7f590`. The portfolio codebase underwent a comprehensive, evidence-based audit before refactoring. The project is a static site with no runtime framework, no build-step bundling, and zero production dependencies. All visual presentation, scientific/ML simulations, interactions, accessibility, and navigation anchors are strictly preserved.

### Pre-refactoring measured baseline

- Tracked files: 291
- Total tracked bytes: 57,450,118 bytes (56.10 MB)
- Documentation & review media: 142 files, 50.73 MB (90.4% of repository checkout)
- Concepts prototypes: 23 files, 3.14 MB
- Production payload (HTML, CSS, JS, fonts, active SVGs/PNG): ~2.2 MB
- Pre-refactor test status:
  - `npm run lint`: PASS (57 JS syntax checks, Prettier, HTML-validate)
  - `npm test`: PASS (37/37 unit tests)
  - `npm run test:browser`: PASS (162/162 Playwright E2E scenarios across all viewports and themes)
  - `scripts/check_site.py`: PASS (all anchors, links, metadata, and byte budgets verified)
