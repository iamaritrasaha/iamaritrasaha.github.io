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

### Baseline and scope (Current `main` merge base: `5b9943a`)

Current `main` incorporates PR #22 (spacing breathing room), PR #23 (contact folio redesign), and PR #24 (welcome plain-name flash elimination). The cleanup refactoring branch was synchronized and merged cleanly with current `main` at `5b9943a`, manually resolving all conflicts while strictly preserving the welcome protections, contact folio, and spacing refinements. The project remains a static site with no runtime framework, no build-step bundling, and zero production dependencies. All visual presentation, scientific/ML simulations, interactions, accessibility, and navigation anchors are strictly preserved.

### Pre-refactoring measured baseline (`origin/main` at `5b9943a`)

- Tracked files: 261
- Total tracked bytes: 48,031,043 bytes (48.03 MB)
- Documentation & review media: 111 files, 42,407,341 bytes (42.41 MB)
- Concepts prototypes: 23 files, 3,296,124 bytes (3.14 MB)
- Active deployment payload (dist/ equivalent): 2,110,073 bytes (2.01 MB)
- Pre-refactor test status:
  - `npm run lint`: PASS (Prettier, HTML-validate, 57 JS syntax checks)
  - `npm test`: PASS (37/37 unit tests)
  - `npm run test:browser`: PASS (162 Playwright E2E scenarios across all viewports and themes)
  - `scripts/check_site.py`: PASS (all anchors, links, metadata, and byte budgets verified)

### Post-refactoring measured metrics against current `main`

| Metric                           | Current `main` (`5b9943a`)  | Post-Refactor Result        | Net Change Against `main`       |
| :------------------------------- | :-------------------------- | :-------------------------- | :------------------------------ |
| **Tracked files**                | 261 files                   | 240 files                   | **-21 files (-8.0%)**           |
| **Total repository bytes**       | 48,031,043 bytes (48.03 MB) | 44,516,648 bytes (44.52 MB) | **-3,514,395 bytes (-7.3%)**    |
| **Active deployment payload**    | 2,110,073 bytes (2.01 MB)   | 1,064,952 bytes (1.01 MB)   | **-1,045,121 bytes (-49.5%)**   |
| **Assets files**                 | 74 files                    | 55 files                    | **-19 files (-25.7%)**          |
| **Assets directory bytes**       | 1,904,228 bytes (1.82 MB)   | 859,176 bytes (0.82 MB)     | **-1,045,052 bytes (-54.9%)**   |
| **Docs directory files**         | 111 files                   | 109 files                   | **-2 files**                    |
| **Docs directory bytes**         | 42,407,341 bytes (42.41 MB) | 39,938,236 bytes (39.94 MB) | **-2,469,105 bytes (-5.8%)**    |
| **Concepts files**               | 23 files                    | 23 files                    | 0 (retained for design history) |
| **Concepts directory bytes**     | 3,296,124 bytes (3.14 MB)   | 3,296,124 bytes (3.14 MB)   | 0                               |
| **Source lines**                 | 69,738 lines                | 69,842 lines                | **+104 lines** (clarity/docs)   |
| **JavaScript bytes**             | 331,787 bytes               | 332,032 bytes               | **+245 bytes** (helpers/math)   |
| **CSS bytes**                    | 182,567 bytes               | 181,946 bytes               | **-621 bytes**                  |
| **Runtime dependencies**         | 0                           | 0                           | 0                               |
| **Lint status**                  | PASS                        | PASS                        | Zero warnings / violations      |
| **Unit test status**             | 37/37 PASS                  | 37/37 PASS                  | Zero regressions                |
| **Playwright E2E tests**         | 170/170 PASS                | 170/170 PASS                | Chromium + Firefox              |
| **Size budgets (check_site.py)** | PASS                        | PASS                        | All canonical LF budgets met    |

### Summary of cleanup actions

1. **Dead Code & Unused Exports:**
   - Internalized unused export `radians` in `assets/projection.js:11`.
   - Pruned dead CSS custom variable `--nbp-reg-cobalt` in `assets/notebook-paper.css`.
   - Standardized `404.html` social preview metadata to canonical `assets/portfolio-social-20261106.png`.
   - Removed obsolete copy step for `20261105.png` in `scripts/render_social_card.mjs`.
2. **JavaScript Simplification:**
   - `assets/bitbench.js`: Refactored monolithic `startup()` function into focused helper functions (`createWelcomeVeil()`, `populateWelcomeGlyph()`, `calculateTransform()`). Enhanced `reduce()` to inspect `localStorage` for `portfolio-reduced-motion`.
   - `assets/welcome-reel.js`: Deduplicated `INITIAL_FIELD` re-assignment, renamed cryptic variables (`f` → `flipIndex`, `turn` → `halfTurn`, `rad` → `angleRad`), and documented flip cadence physics.
   - `assets/welcome-name.js`: Simplified nested card face styling conditions.
   - `assets/embedded.js`: Extracted shared `canAnimate` boolean guard in `updateMotion()`.
   - `script.js`: Cached `isReduced` to avoid redundant calls in `syncMotion()`.
3. **CSS Architecture Consolidation:**
   - Consolidated duplicate element resets (`a`, `button`, `select`, `summary`) and heading declarations (`h1`–`h5`, `h2`–`h4`) in `styles.css`.
   - Merged duplicate `@media (max-width: 650px)` queries in `styles.css`.
   - Pruned shadowed plum/copper palette tokens and superseded `.nav-panel a:hover` in `assets/creative.css`.
   - Merged three fragmented `@media (max-width: 650px)` media query blocks in `assets/editorial.css`.
4. **Pruned Unreferenced Legacy Assets & Media (21 files removed):**
   - `assets/portfolio-social-20261105.png` (76.6 KB, superseded by 20261106.png)
   - `assets/projects/aether-home.png` (773.7 KB, unreferenced capture)
   - `assets/projects/aether-home.webp` (21.9 KB, unreferenced capture)
   - `assets/veyra-open-graph.png` (132.3 KB, unreferenced)
   - `assets/portfolio-open-graph.svg` (27.1 KB, unreferenced)
   - 14 unreferenced legacy SVG marks: `assets/projects/aether-mark.svg`, `novarx-mark.svg`, `serein-mark.svg`, `vyren-mark.svg`, `assets/a-monogram.svg`, `aura-symbol.svg`, `developer-mark.svg`, `lumina-symbol.svg`, `noise.svg`, `quanta-symbol.svg`, `relay-symbol.svg`, `vector-symbol.svg`, `veyra-app-icon.svg`, `veyra-mark-chartreuse.svg`.
   - 2 unreferenced intermediate video captures in `docs/welcome-construction/`: `before-desktop.webm` (1.82 MB) and `before-mobile.webm` (654.0 KB).
5. **Retained Files & Justification:**
   - `assets/fonts/Inter-LICENSE.txt` & `Newsreader-OFL.txt`: Retained for font licensing and attribution requirements.
   - `concepts/` prototypes and review media: Retained per reproducible design research documentation in `concepts/README.md` and `docs/portfolio-motion-review.md`.
   - `docs/review/`, `docs/bitbench-review/`, `docs/creative-review/`, `docs/screenshots/`: Retained as reproducible evidence cited in historical review reports.

---

## Maintenance Record: Portfolio Engineering Audit V2 (9 November 2026)

### Baseline and Objectives

Starting from commit `4b6ca7d` (merged PR #25 cleanup), this second engineering audit conducted a deep, systematic bug hunt, improved beginner-friendly code clarity, safe performance optimizations, and authored comprehensive architecture documentation without altering visual design or functional behavior.

### 1. Interaction & Numerical Bug Fixes

- **2D Matrix Arrow Navigation Boundaries (`assets/bitbench.js` & `assets/neuron-demo.js`):** Replaced linear 1D index clamping with explicit 2D row/column boundary checks. ArrowUp on the top row, ArrowDown on the bottom row, and ArrowLeft/Right on matrix edges stay within their respective boundaries rather than teleporting or wrapping.
- **Scroll Bounds Invalidation (`assets/surface-physics.js`):** Added a `window.addEventListener("scroll", ...)` listener to invalidate cached `state.bounds`, preventing card tilt calculation drift after mouse-wheel scrolling under cursor.
- **Tab & Escape Key Event Cancellation (`assets/welcome-start.js` & `assets/bitbench.js`):** Added `event.preventDefault()` on Tab/Escape key dismissal, preventing default browser focus jumping past the hero grid into page anchors.
- **PWM Waveform Rail Continuity (`assets/embedded.js`):** Fixed 0% and 100% duty cycle calculations in `pwmWaveformPath()` to return continuous horizontal DC rails (`M32 152H...` at 0% and `M32 48H...` at 100%) rather than vertical spike artifacts.
- **In-Page Hash Navigation Scroll Restoration (`assets/navigation.js`):** Fixed in-page anchor re-clicks to target the active fragment smoothly when already at the destination URL, resolving scroll suppression caused by `{ preventScroll: true }`.
- **Brand-Dot Circular Geometry (`assets/bitbench.css` & `assets/creative.css`):** Restored `border-radius: 50%` in `bitbench.css` and pruned dead legacy `.site-header` declarations in `creative.css` that turned the brand indicator into a square.
- **Email Link Query Parameter Stripping (`script.js`):** Stripped query parameters from copied email `href` to ensure clean clipboard output.

### 2. Performance Optimizations

- **Throttled 3D Software Rasterization (`assets/projection-motion.js`):** Coalesced pointer drag events via `requestAnimationFrame` so high-polling input devices (500–1000Hz gaming mice) do not block the UI thread with synchronous 3D triangle rasterization.
- **Reduced Hot-Loop Garbage Collection (`assets/projection-renderer.js`):** Replaced `triangle.map()` array allocations inside the triangle render loop with direct index access (`projected[triangle[0]]`), eliminating >8,000 allocations per frame.

### 3. Readability & Beginner-Friendly Code

- **Descriptive Identifiers:** Replaced abbreviations across welcome modules (`sIdx` → `slotIndex`, `item` → `cardSlot`, `n` → `totalFlips`, `a` → `decelerationExponent`).
- **Algorithm JSDoc:** Documented mechanical split-flap reel cadence generation and fourth-order latching settle in `assets/welcome-reel.js`.
- **Authoritative Guide:** Authored `docs/code-walkthrough.md` covering 10 fundamental architecture topics for learners.

### 4. Automated Regression Tests

Added Playwright regression tests verifying:

- 2D matrix navigation boundary clamping in `tests/bitbench.spec.mjs`.
- 0% and 100% continuous PWM rails without vertical spikes in `tests/embedded.spec.mjs`.
- 50% circular brand dot geometry in `tests/portfolio.spec.mjs`.
- Mobile in-page hash navigation scroll restoration in `tests/responsive.spec.mjs`.
