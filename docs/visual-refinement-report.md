# Visual Refinement Report — Engineering Notebook Grid, Color Balance & Hero Hierarchy

## Overview

This report documents the visual design corrections implemented in branch `design/visible-graph-paper-hero-refinement` for the portfolio `iamaritrasaha.github.io`.

The goal of this update is to realize **Concept B: an annotated engineering notebook with small graph-paper squares**, achieve a recognizable **60% paper / 30% cobalt / 10% citron** compositional balance, and elevate the homepage hero into a compelling AI/ML technical showcase without disturbing any model calculations, interactive classifier logic, or Cipher Reel welcome mechanics.

---

## 1. Why the Previous Grid Was Not Visible (PR #20 Root Cause)

In PR #20, `assets/notebook-paper.css` attempted to apply the grid using the CSS `:where()` pseudo-class:

```css
:where(
  body,
  .site-header,
  .practice-section,
  .about-section,
  .contact-section,
  .lab-code-section,
  .lab-protocol-figure,
  .lab-outro
) {
  background-image: linear-gradient(...);
}
```

### The Cascade Failure:

1. **Zero Specificity (`0-0-0`)**: By CSS specification, `:where(...)` has a specificity of exactly `(0, 0, 0)`.
2. **Shorthand Overrides**: Existing stylesheets (`bitbench.css`, `embedded.css`, `explorations.css`, and `styles.css`) define background colors on these exact elements using class or element selectors with `background: <color>` shorthand (specificity `(0, 1, 0)` or `(0, 0, 1)`):
   - `body { background: var(--bg); }`
   - `.bench-hero { background: var(--blue); }`
   - `.bench-panel { background: var(--deep); }`
3. **Reset of `background-image`**: The CSS `background` shorthand resets all constituent background properties not explicitly declared—most notably resetting `background-image` to `none`.
4. **Computed Style Outcome**: Because any selector with specificity $\ge 1$ beats `:where()`, the browsers computed `background-image: none` on `.bench-hero`, `body`, and all targeted containers across the site on `main`.

---

## 2. How the CSS Cascade Was Corrected

Rather than introducing indiscriminate `!important` declarations, the stylesheet structure was restructured to respect standard CSS cascade semantics:

1. **Direct Class & Element Selectors**: All `:where(...)` wrappers were replaced with direct selectors (`body`, `.bench-hero`, `.bench-panel`, `#welcome-paint`, etc.). These have normal specificity (`0-1-0` for classes, `0-0-1` for elements).
2. **Load Order Precedence**: `assets/notebook-paper.css` is linked after `styles.css` and `bitbench.css` in all HTML entry points (`index.html`, `embedded/index.html`, `explorations/index.html`, and `404.html`). With matching specificity, standard cascade source order gives precedence to `notebook-paper.css`.
3. **Property Separation**: `notebook-paper.css` sets only `background-image` and `background-size`, allowing the underlying stylesheets to provide the base `background-color`.
4. **Two-Level Engineering Grid**:
   - **Fine grid**: 22px × 22px squares (`--nbp-fine` / `--nbp-fine-cobalt`).
   - **Major construction lines**: 110px × 110px squares (`--nbp-major` / `--nbp-major-cobalt`).
5. **Calibrated Subtle Opacity**:
   - Paper surfaces: 3% fine, 5% major (subtle drafting ink on warm paper).
   - Cobalt surfaces: 3.5% fine, 6% major (pale blue-white coordinate lines on deep blue).
   - Dark mode: 2.6% fine / 4.4% major on paper; 2.8% fine / 4.8% major on cobalt.
6. **Continuous Grid Across Surfaces**:
   - Applied uniformly across the welcome screen (`#welcome-paint`), transitional chapter dividers (`#chapter-paint`, `.chapter-paper::before`, `.bb-entry::before`), homepage hero (`.bench-hero`, `.bench-panel`), project folios, lab benches, and supporting pages.
   - Removed aggressive gradient masks (`mask-image: none`) so grid lines maintain identical 22px/110px dimensions and continuous visibility throughout the user journey.
7. **Drafting Details**:
   - Single precision registration cross (`+`) rendered on `.selected-work > .section-bar::after`.
   - Subtle hairline coordinate borders on `.bench-panel` and `.bench-links`.

---

## 3. Hero Composition and Copy Refinements

The homepage hero was upgraded from a bare prompt into a structured technical introduction:

### Copy Enhancements

| Element         | Previous Copy                                                       | Refined Copy                                                                                                               |
| :-------------- | :------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------- |
| **Eyebrow**     | _(None)_                                                            | `Aritra Saha / AI & ML Engineer`                                                                                           |
| **Headline**    | `Change one pixel.`                                                 | `Machine learning you can inspect.`                                                                                        |
| **Description** | `Edit a handwritten digit. Watch a trained neural network respond.` | `Change a handwritten digit, follow its prediction, and inspect the hidden-layer activations of a trained neural network.` |

### Compositional & Structural Refinement

- **Semantic Spans**: Headline wrapped in semantic spans (`<span>Machine learning</span> <span>you can inspect.</span>`) with fluid typography clamping:
  ```css
  .bench-copy h1 {
    font-size: clamp(1.625rem, 0.6rem + 2.85vw, 4rem);
    letter-spacing: -0.055em;
    line-height: 1.08;
    margin: 10px 0 14px;
  }
  ```
  This guarantees that the title occupies $\le 2$ lines across all viewports (320px, 390px, 768px, 1024px, 1440px), satisfying strict regression test contracts (`tests/portfolio.spec.mjs:35`).
- **Interactive Classifier Untouched**: The 8×8 digit editor, feed-forward inference calculations, weight arrays, GELU activations, confidence distribution bars, and 3D pixel relief visualization remain 100% intact and functional.

---

## 4. Implementation of the 60/30/10 Color Balance

The visual weight was audited and tuned to create an instantly recognizable hierarchy:

- **60% Dominant Ground (Warm Paper `#F4F4EC` / Dark Slate)**:
  - Covers overall page body, practice/about/writing sections, reading areas, lab documentation, and code benches.
  - Subtly patterned with 22px/110px graph paper lines in diluted cobalt ink (`rgb(23 40 120 / 3%–5%)`).
- **30% Secondary Technical Structure (Cobalt `--blue` `#1E3A8A` & `--deep` `#0F172A`)**:
  - Anchors high-density technical modules: the interactive model bench, SeeDL/SysAI/PulseShift project folios, and lab experiment headers.
  - Features the continuous pale coordinate grid (`rgb(220 232 255 / 3.5%–6%)`).
- **10% Intentional Citron Accent (`--lime` `#E4F489`)**:
  - Reserved exclusively for interactive landmarks:
    - Hero eyebrow badge (`.bench-eyebrow`)
    - Model prediction focal points and live status chips
    - Technical links hover highlights (`.bench-links a:hover`)
    - Contact folio callout banner
  - Citron never overpowers the technical content, preserving high-contrast accessibility (WCAG AA compliant).

---

## 5. Visual Evidence & Computed Style Verification

Computed styles were verified across both viewports and themes using automated browser evaluation:

### Computed `background-image` Validation

| Selector         | `main` Branch Computed Style | Feature Branch Computed Style           | Status       |
| :--------------- | :--------------------------- | :-------------------------------------- | :----------- |
| `body`           | `none`                       | `4-layer linear-gradient (110px, 22px)` | **Verified** |
| `.bench-hero`    | `none`                       | `4-layer linear-gradient (110px, 22px)` | **Verified** |
| `.bench-panel`   | `none`                       | `4-layer linear-gradient (110px, 22px)` | **Verified** |
| `#welcome-paint` | `none`                       | `4-layer linear-gradient (110px, 22px)` | **Verified** |
| `.case-seedl`    | `none`                       | `4-layer linear-gradient (110px, 22px)` | **Verified** |
| `.lab-hero`      | `none`                       | `4-layer linear-gradient (110px, 22px)` | **Verified** |

### Screenshots Captured

Screenshots are archived in `docs/screenshots/before/` and `docs/screenshots/after/`:

- **Desktop (1440px)**:
  - Homepage Hero (Light & Dark): [after/desktop-1440-light-hero.png](screenshots/after/desktop-1440-light-hero.png), [after/desktop-1440-dark-hero.png](screenshots/after/desktop-1440-dark-hero.png)
  - Selected Work (Light & Dark): [after/desktop-1440-light-selected-work.png](screenshots/after/desktop-1440-light-selected-work.png), [after/desktop-1440-dark-selected-work.png](screenshots/after/desktop-1440-dark-selected-work.png)
  - Embedded Lab: [after/desktop-1440-light-embedded.png](screenshots/after/desktop-1440-light-embedded.png), [after/desktop-1440-dark-embedded.png](screenshots/after/desktop-1440-dark-embedded.png)
  - Explorations: [after/desktop-1440-light-explorations.png](screenshots/after/desktop-1440-light-explorations.png), [after/desktop-1440-dark-explorations.png](screenshots/after/desktop-1440-dark-explorations.png)
  - Full Homepage: [after/desktop-1440-light-homepage-full.png](screenshots/after/desktop-1440-light-homepage-full.png), [after/desktop-1440-dark-homepage-full.png](screenshots/after/desktop-1440-dark-homepage-full.png)
- **Mobile (390px)**:
  - Homepage Hero (Light & Dark): [after/mobile-390-light-hero.png](screenshots/after/mobile-390-light-hero.png), [after/mobile-390-dark-hero.png](screenshots/after/mobile-390-dark-hero.png)
  - Selected Work: [after/mobile-390-light-selected-work.png](screenshots/after/mobile-390-light-selected-work.png), [after/mobile-390-dark-selected-work.png](screenshots/after/mobile-390-dark-selected-work.png)
  - Embedded Lab & Explorations: [after/mobile-390-light-embedded.png](screenshots/after/mobile-390-light-embedded.png), [after/mobile-390-light-explorations.png](screenshots/after/mobile-390-light-explorations.png)
  - 404 page: [after/mobile-390-light-404.png](screenshots/after/mobile-390-light-404.png)

---

## 6. Regression & Verification Results

All unit, asset budget, code quality, and end-to-end browser test suites pass:

1. **`npm run lint`**:
   - `prettier --check`: 100% compliant across all HTML, CSS, JS, and MD files.
   - `html-validate`: 0 errors across 4 entry points.
   - `lint_syntax.mjs`: PASS across 57 source and test files.
2. **`npm test`**:
   - `scripts/check_site.py`: All 4 pages, internal anchors, CSS asset budgets, and AI/ML model integrity checks passed.
   - Unit tests: 37/37 passing (ML forward/backward scalar fixtures, GELU gradients, finite differences, animation bounds, theme synchronization).
3. **`npm run build`**:
   - Static artifact built cleanly into `dist/` with zero server runtime required.
4. **`npm run test:browser`**:
   - Full Playwright test suite: **162 / 162 tests passed** (6.0m run duration).
   - Verifies hero line clamping ($\le 2$ lines), keyboard navigation, theme persistence, responsive wrapping, and interactive model responsiveness.
