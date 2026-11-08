# Visual Refinement Report — Portfolio Visual Breathing Room & Editorial Spacing

## Overview

This report documents the architecture-safe visual spacing and layout refinement implemented in branch `design/portfolio-visual-breathing-room` for `iamaritrasaha.github.io`.

The objective was to improve the visual spaciousness, reading comfort, editorial rhythm, and portfolio presentation without altering the website's underlying architecture, interactive classifier, ML inference weights, or Cipher Reel welcome mechanics.

The refined presentation realizes a **spacious, editorial AI/ML engineering portfolio with subtle graph-paper textures and authentic technical illustrations**, retaining the **60% paper / 30% cobalt / 10% citron** compositional balance.

---

## 1. Confirmed Baseline Spacing Problems

Before this refinement, an automated DOM layout audit across 1440px, 1024px, 768px, 390px, and 320px identified genuine cramping and visual density issues:

| Area / Component                 | Baseline Measurement                        | Problem Description                                                                                                                                                                      |
| :------------------------------- | :------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Homepage Hero Exterior**       | `padding-bottom: 20px`                      | The bottom of `.bench-hero` was abruptly clipped against the next section; `.bench-links` had only 16px top margin, creating severe vertical compression against the section transition. |
| **Hero Mobile Relief Gap**       | `gap: 6px`                                  | On mobile devices ($\le 700\text{px}$), the 3D relief canvas sat only 6px below the headline, crowding the typographic hierarchy.                                                        |
| **Interactive Classifier Panel** | `padding: 16px 12px`, `gap: 18px`           | On mobile/tablet, controls, 8×8 grid, and layer notes were packed tightly, making the classifier feel like a congested widget rather than an elevated scientific instrument.             |
| **Selected Work Entrance**       | `padding-top: 0`                            | `.selected-work` directly abutted preceding transitions without visual pause; `.project-jump` shortcuts crowded the flagship container.                                                  |
| **Flagship SeeDL**               | `padding: 24px 20px`, `margin-bottom: 38px` | SeeDL's story copy lacked reading measure constraint (ran full width), and its transition into QUANTA felt sudden.                                                                       |
| **QUANTA Hydrogen Study**        | `margin-top: 12px` on `.case-details`       | The technical disclosure sat immediately against the research text; body copy lacked clear ink contrast on warm paper surfaces.                                                          |
| **Orion LLM Adaptation**         | `padding-bottom: 0`, no divider             | Orion ended abruptly without visual boundary before SysAI, blending two distinct research domains together.                                                                              |
| **SysAI Terminal Console**       | `padding-top: 6px`                          | Diagnostic console lacked framing on desktop/tablet, and on mobile required strict reflow protection when enlarged text (200% zoom) is active.                                           |
| **Chapter Transitions**          | Inconsistent margins (24px–48px)            | Major chapter breaks across Laboratory, Helicoid Geometry, and Contact sections lacked unified vertical cadence.                                                                         |

---

## 2. Responsive Spacing System Tokens

A deliberate, consolidated spacing scale was introduced into `:root` in `assets/notebook-paper.css`:

```css
:root {
  /* Responsive editorial spacing scale */
  --space-tight: clamp(6px, 1vw, 12px);
  --space-moderate: clamp(14px, 1.8vw, 22px);
  --space-generous: clamp(28px, 3.5vw, 48px);
  --space-chapter: clamp(56px, 7vw, 96px);
}
```

### Hierarchy Rules Applied:

- **Tight (`--space-tight`)**: Spacing between metadata labels, eyebrows, and immediate headings.
- **Moderate (`--space-moderate`)**: Spacing between related paragraphs, action link rows, and technical captions.
- **Generous (`--space-generous`)**: Spacing between distinct project components, diagrams, and summary disclosures.
- **Chapter (`--space-chapter`)**: Large visual transitions between major homepage chapters and research folios.

---

## 3. Section-by-Section Architectural Refinements

All adjustments were applied in `assets/notebook-paper.css`, the last stylesheet in cascade load order, avoiding `!important` flags and preserving all existing DOM elements and IDs.

### A. Homepage Hero & Interactive Classifier

- **Exterior Framing**: Increased `.bench-hero` vertical padding to `clamp(32px, 4vw, 56px) 0 clamp(44px, 5.5vw, 72px)`, giving generous top and bottom breathing room.
- **Headline Rhythm**: Increased bottom margin to `clamp(16px, 1.8vw, 22px)` while retaining strict `clamp(1.625rem, 0.6rem + 2.85vw, 4rem)` fluid font sizing so `h1` stays $\le 2$ lines across all viewports.
- **Lead Text Measure**: Set `max-width: 44ch` with `line-height: 1.62` for comfortable reading flow.
- **Mobile Relief Gap**: Relaxed `.bench-heading:has(.pixel-relief)` gap to `clamp(16px, 3.5vw, 26px)`.
- **Instrument Elevation**: Elevated `.bench-panel` with `padding: clamp(24px, 3.2vw, 46px)`, `margin-top: clamp(28px, 3.8vw, 52px)`, and balanced internal gap `clamp(24px, 3.8vw, 64px)`.
- **Supporting Links Strip**: Expanded `.bench-links` spacing to `margin-top: clamp(22px, 3vw, 38px)` and `gap: 10px clamp(20px, 3.5vw, 40px)`.

### B. Flagship SeeDL

- **Container Presence**: Upgraded `.case-seedl` padding to `clamp(36px, 4.5vw, 64px) clamp(22px, 3.2vw, 52px)` with subtle hairline border `1px solid rgb(220 232 255 / 12%)`.
- **Typographic Measure**: Added `max-width: 56ch` and `line-height: 1.75` on story paragraphs.
- **Chapter Exit**: Expanded bottom margin to `clamp(64px, 7.5vw, 108px)` for clear focal transition to QUANTA.

### C. QUANTA Scientific Computing Folio

- **Heading Rhythm**: Added `margin-bottom: clamp(12px, 1.8vw, 22px)` to `.feature-heading`.
- **Study Enclosure**: Framed `.quanta-study` with `padding: clamp(18px, 2.5vw, 32px)` and hairline cobalt border.
- **Text Readability**: Explicitly ensured `color: var(--ink)` on story copy over paper ground, with `56ch` measure.
- **Action & Disclosure Separation**: Expanded `.case-details` margin to `clamp(24px, 3vw, 38px)`.

### D. Orion LLM Adaptation Research

- **Chapter Transition**: Added `border-bottom: 1px solid var(--line)`, `padding-bottom: clamp(52px, 6vw, 88px)`, and `margin-bottom: clamp(52px, 6vw, 88px)` to distinctly separate Orion from SysAI.
- **Balanced Note Cards**: Standardized padding on `.math-note` (`clamp(14px, 2vw, 22px)`) and `.research-note` (`clamp(20px, 2.5vw, 30px)`).

### E. SysAI Local Machine Systems

- **Console Container**: Structured `.case-sysai` padding as `clamp(48px, 6vw, 84px) 0 clamp(40px, 5.5vw, 72px)`.
- **Instrument Study**: Styled `.diagnostic-study` on desktop with `padding: clamp(20px, 2.8vw, 36px)` and coordinate border; on mobile ($\le 600\text{px}$), stripped side padding to prevent horizontal text constriction.
- **Reflow Protection**: Added `overflow-wrap: break-word` to `.command-line` ensuring 200% zoom reflow tests pass cleanly at 320px viewport width.

### F. Major Chapter Transitions

- Normalized vertical spacing across `.laboratory` (`margin-block: clamp(64px, 7.5vw, 108px)`), `.geometry` (`margin-block: clamp(64px, 7.5vw, 108px)`), and `.contact-section` (`padding: clamp(48px, 6vw, 88px) 0`).

---

## 4. Quantitative Spacing Audit: Before vs. After

| Measurement Point               | Viewport | Baseline (`main`)  | Refined (`design`) | Change                                |
| :------------------------------ | :------- | :----------------- | :----------------- | :------------------------------------ |
| **Hero Padding Bottom**         | 1440px   | 20.0px             | 72.0px             | +260% (eliminates abrupt clip)        |
| **Hero Padding Bottom**         | 768px    | 20.0px             | 55.4px             | +177% (clean breathing room)          |
| **Hero Padding Bottom**         | 390px    | 20.0px             | 44.0px             | +120% (comfortable mobile frame)      |
| **Hero Links Top Margin**       | 1440px   | 16.0px             | 38.0px             | +137% (distinct instrument strip)     |
| **Classifier Panel Top Margin** | 1440px   | 22.0px             | 52.0px             | +136% (featured instrument stance)    |
| **Classifier Internal Gap**     | 1440px   | 32.0px             | 64.0px             | +100% (uncluttered controls)          |
| **SeeDL Chapter Separation**    | 1440px   | 38.0px             | 108.0px            | +184% (distinct project chapter)      |
| **QUANTA Details Top Margin**   | 1440px   | 12.0px             | 38.0px             | +216% (comfortable disclosure rhythm) |
| **Orion Separation to SysAI**   | 1440px   | 28.0px (no border) | 88.0px + 1px rule  | Structured chapter boundary           |
| **Laboratory Block Margin**     | 1440px   | 42.0px             | 108.0px            | +157% (editorial rhythm)              |

---

## 5. Visual Artifacts & Viewport Verification

Screenshots were captured across all 10 standard configurations (light & dark across 1440px, 1024px, 768px, 390px, and 320px) and archived in `docs/screenshots/`:

- **Baseline Screenshots**: `docs/screenshots/before/`
- **Refined Screenshots**: `docs/screenshots/after/`

Key comparisons:

- Desktop Hero (1440px): `after/desktop-1440-light-hero.png` & `after/desktop-1440-dark-hero.png`
- Desktop Selected Work (1440px): `after/desktop-1440-light-selected-work.png` & `after/desktop-1440-dark-selected-work.png`
- Full Homepage (1440px): `after/desktop-1440-light-homepage-full.png` & `after/desktop-1440-dark-homepage-full.png`
- Mobile Hero (390px): `after/mobile-390-light-hero.png` & `after/mobile-390-dark-hero.png`
- Mobile Selected Work (390px): `after/mobile-390-light-selected-work.png` & `after/mobile-390-dark-selected-work.png`
- Mobile Reflow (320px): `after/mobile-320-light-hero.png` & `after/mobile-320-dark-hero.png`

---

## 6. Architecture & Non-Negotiable Constraints Verification

- [x] **No Framework Migration**: Plain HTML5, CSS3, and native ES modules maintained throughout.
- [x] **No New Dependencies**: Zero changes to `package.json` runtime dependencies.
- [x] **No Backend**: Remains completely static and GitHub Pages compatible.
- [x] **Zero ML Logic Changes**: All 1,336 neural network weights, 38 biases, GELU activations, and digit inference arrays are unchanged.
- [x] **All DOM IDs Preserved**: `#digit-canvas`, `#predicted-digit`, `#confidence-score`, `#distribution`, `#layer-note`, `#welcome-reel`, `#theme-select`, `#seedl`, `#quanta`, `#orion`, `#sysai` intact.
- [x] **Accessibility (WCAG AA) & Reduced Motion**: Preserved all `prefers-reduced-motion` and `forced-colors` rules.
- [x] **Typography & Visual Identity**: Literata, JetBrains Mono, warm paper ground, cobalt surfaces, citron accents, and 22px/110px drafting grid lines preserved.

---

## 7. Verification Test Results

```
npm test            -> PASS (37/37 unit tests, check_site.py passed)
npm run lint        -> PASS (Prettier check, html-validate, lint_syntax.mjs)
npm run build       -> PASS (Static build to dist/, 0 server dependencies)
npm run test:browser -> PASS (162 / 162 Playwright tests passed, 5.8m)
```
