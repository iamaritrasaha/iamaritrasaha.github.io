# Validation record

## Documentation cleanup

The project documentation now focuses on the portfolio, its implementation and verification. Professional AI/ML descriptions and scientific project facts are retained. Site copy contains no em-dash punctuation. An optional ignored interpreter-path file keeps local checks working without a machine-specific fallback in source. Lint, the production build, all 17 numerical/physics/theme tests, all 16 browser scenarios and the dependency audit passed after these changes. No runtime dependencies or portfolio layouts changed.

## SeeDL flagship addition

Validated on 2026-10-24 from merged PR #5, for the SeeDL flagship addition. The change adds SeeDL first in selected work while retaining the existing design. Its artwork uses the ivory/charcoal/cobalt palette and is explicitly captioned as a concept illustration. No SeeDL screenshot or exported application is shipped.

- Lint/HTML validation and the production build pass. All 17 existing numerical, physics and theme tests pass.
- All 16 browser scenarios pass, including the five-width/two-theme matrix and a new SeeDL check covering image loading, project destinations, notebook keyboard access, expanded-content accessibility scanning, visible animation, reduced motion and manual pause. Automated WCAG A/AA scans report zero violations in the tested states.
- Desktop, tablet and mobile captures were inspected in light and dark themes. The existing scene controller pauses the new illustration when it leaves the viewport; the existing OS/user motion preferences and synchronized pause controls stop it.
- Source comparison against `main` confirms identical hero, about, practice, contact and original project markup. Shared CSS, JavaScript, theme/model modules, dependencies and lockfile are unchanged. The static size check now normalizes Windows CRLF before applying the existing source budgets.
- SeeDL's repository, PyPI package, live website, documentation, playground and direct 3D/trace demonstration URLs returned HTTP 200. PyPI and the stable GitHub release confirm published version 0.5.0 despite a stale pending-publication line in the source notes.
- npm audit reports zero vulnerabilities. The illustration's checksum and production/source HTML/CSS/JavaScript equality were verified. Temporary captures and discarded design studies remain outside the repository. No SeeDL repository changes, merge or deployment were performed.

See [SeeDL feature notes](seedl-feature.md) for research sources and artwork provenance. Browser coverage remains Edge/Chromium emulation; physical-device, screen-reader and other-engine validation were not performed.

## October 2026 portfolio upgrade

Validation on 2026-10-24 for the readability and navigation refinements. The September records below are historical; this section describes the current upgrade.

- `npm run lint`: passes formatting, HTML validation and JavaScript syntax checks. The formatter now accepts platform-native line endings; restored unchanged assets do not need unrelated formatting changes.
- `npm test`: static integrity checks and all 17 existing neural-network, spring and theme tests pass. The shipped model, learned weights and mathematical modules are unchanged.
- `npm run build`: passes and produces `dist/`. The output was served separately at localhost:4175 and opened through a browser.
- `npm run test:browser`: 15 browser scenarios pass. The matrix covers 320, 390, 768, 1024 and 1440 CSS pixels in light and dark appearances, all five neural stages, document/equation overflow, automated accessibility checks, reduced motion and failed resources. The targeted narrow-phone/navigation tests were repeated after the last title-size and scroll-clearance refinement.
- All ten viewport/theme combinations returned zero accessibility violations for WCAG 2 A/AA, 2.1 AA and 2.2 AA tags. The nested 404 page also passed. These automated results are not an accessibility certification.
- Keyboard tests cover skip navigation, mobile menu Tab order, Escape focus return, section focus after activation, repeated navigation to the same fragment, project shortcuts and neuron Home/End selection. Normal-motion tests cover classifier controls, disclosures, model-miss feedback, research-plate controls, and persisted motion preferences.
- Clipboard tests verify the actual copied email and a blocked-write recovery message. The mailto remains correct. A separate no-JavaScript context retains navigation, project content, native disclosures and the classifier fallback.
- Preview-server tests cover nested 404 status/content, blocked `.git` access, encoded traversal and HTTP method handling. The initial traversal failure was fixed and the regression check passes.
- Source and production previews were inspected with a browser at desktop, tablet and phone dimensions. Baseline/updated screenshots are retained outside the repository as local review artifacts; current test screenshots are regenerated in ignored `test-results/`. Machine-specific artifact locations are omitted from committed documentation.
- Browser checks found no page errors or failed runtime resource requests. All 12 authored HTTPS destinations returned HTTP 200 to a HEAD request during this run; this checks availability, not the full behavior of those external sites.
- One unthrottled localhost sample at 1440px, with reduced motion, reported CLS 0.00839, LCP/FCP 88ms, one long task, 17 resources and approximately 268KB transferred. All runtime resource requests were local. This single environment-dependent sample is not a field-performance or mobile-network claim.
- `npm audit` reports zero vulnerabilities across production and development dependencies after updating transitive `fast-uri` to 3.1.9. No production dependencies were added. There is no TypeScript task in this HTML/CSS/JavaScript project.

### Pre-publication review

Reviewed the complete change set against `main`, including newly added tooling and tests. Removed four machine-specific absolute paths from the reports. Fixed an empty contact row when JavaScript or the Clipboard API is unavailable; the browser checks now assert that the whole copy-control container stays hidden in both cases. Existing portfolio claims, project states, contact details, trained weights and mathematical modules remain unchanged.

Re-ran lint, the production build (including all 17 existing tests), all 15 browser scenarios and the full dependency audit after these fixes. All passed; accessibility checks reported zero violations in the tested matrix and npm reported zero vulnerabilities. Browser and accessibility checks remain development-only dependencies. Generated build output, browser screenshots/traces, caches and dependencies are excluded from version control. GitHub Pages was confirmed to publish the root of `main`; publishing the feature branch and opening its pull request does not change that source. No merge or deployment is part of this review.

## September 2026 record

Local validation on 2026-09-30 for the trained digit classifier, direct neuron controls and mathematical copy refinement. The accepted ivory/charcoal/cobalt design and project composition are retained. This record replaces the earlier 15-neuron demonstration results.

## Content and layout

- Featured projects remain Orion, SysAI, Relay and Vyren; Aether stays in the compact project index. Existing project claims, anchors, contact links and repository links are retained.
- Added contextual equations for Orion's LoRA update, Relay's transfer-time lower bound and Vyren's observed-byte accounting. Copy uses direct first-person explanations and restrained mathematical humor, without new achievements or project metrics.
- Inspected the desktop study, Orion's equation placement, phone-sized Relay disclosure and Vyren copy, plus both themes.
- Measured all five neural stages at 320, 390, 768, 1024, 1440 and approximately 1720 CSS pixels (1721 reported at the final width). No horizontal document or equation overflow occurred. The study height stayed identical across all five stages at each width after reserving caption space.
- Removed the neuron dropdown. The first layer uses two columns of eight selectable units. All sixteen native button targets measured 26 × 26 CSS pixels with no overlaps, including the narrow-phone layout. Responsive SVG coordinates keep pixels, circles and hit targets aligned.

## Real model and mathematical verification

- The shipped model is a trained 64 → 16 → 12 → 10 GELU classifier: 1,336 weights and 38 biases. Every inference and derivative uses all connections. The diagram explicitly labels its 76 strongest displayed connections.
- Independently reproduced 348 correct predictions out of 360 held-out images (96.7%) using the exported parameters. The 1,437 training images and 360 test images have no overlap in the local stratified split. This is not the official UCI split or a claim of real-world handwriting accuracy.
- Verified that the eleven included examples match normalized held-out dataset pixels. The additional mistake is a real 9 classified as 4, not a scripted prediction. Repeating training with the recorded configuration reproduced the export.
- Seven neural tests cover independent Python scalar forward/backward fixtures, GELU derivatives, numerical stability, input validation and immutability. All 1,438 weight, bias and input derivatives agree with central finite differences on the misclassified example.
- Browser checks confirmed that selecting neuron 16 changes its displayed weighted sum or gradient, including during reduced motion. The equations use approximate equality for rounded displays and scientific notation for tiny nonzero values. Project phase correctly identifies pre-activation values.
- Data attribution, license, split limits and fixed-weight behavior are visible in the study. Full provenance and reproduction instructions are in [digit-model.md](digit-model.md).

## Interaction and accessibility

- Direct click selection, ArrowDown, Home and End were exercised. Focus follows selection and only the selected neuron is in the Tab sequence. Selection from a whole-network stage opens its relevant calculation. No neuron selector remains.
- Backward signals changed dash offset from 8.54 to 28.83 in a 500 ms sample. Local pause stopped all study animations; global pause and OS reduced motion produced zero running animations. Manual input, stages and neuron selection remained usable.
- The native model-provenance disclosure and project disclosures remain usable. Mobile Menu followed by Tab focuses Work; Escape closes the menu and returns focus to Menu.
- Desktop light/dark and 320 px phone light/dark automated accessibility scans returned zero automated violations and 29 passing groups with WCAG 2 A/AA, 2.1 AA and 2.2 AA tags. The phone checks included reduced motion, direct neuron selection and the actual misclassified sample. These are automated checks, not an accessibility certification.

## Performance and limits

- One localhost desktop sample reported cumulative layout shift of 0.01054 and no buffered long tasks. No failed resource requests, remote runtime resources or console warnings were observed in the inspected runtime.
- The model asset is 21,110 bytes. The numerical engine is 2,707 bytes. Rendering uses native SVG/CSS with visibility-gated timers, a resize observer and no production library dependencies. No model API, remote font or ML runtime is required.
- No field Core Web Vitals, physical-device frame rate, battery use or production network claim is made. The browser checks use emulated dimensions rather than physical phone hardware.

## Repeatable checks

```text
npm run lint   # formatting, HTML validation and ES-module syntax
npm test       # static integrity plus 17 numerical, physics and theme tests
npm run build  # repeats tests and writes dist/
```

All commands passed. Static checks cover IDs, preserved anchors, ordered featured projects, links, controls, image dimensions, CSS assets, source-size budgets and em dashes. There is no TypeScript task in this static HTML/CSS/JavaScript project. Six spring tests and four theme tests accompany the seven neural tests.

Browser checks restore the normal viewport and system appearance after review.

## Equation typesetting refinement

- Validated all 880 combinations of eleven samples, sixteen selected units and five stages as well-formed mathematical markup, including MathML operand counts and numeric tokens. No non-finite or undefined display values occurred.
- Inspected the rendered softmax fraction and backward derivative, as well as summation, square-root and indexed-variable layouts. Checked all five stages at 320 and 390 CSS pixels and desktop width, with additional intermediate-width checks. Equations fit their containers without horizontal document overflow in those checks.
- Rechecked selection of neuron 16, Home-key navigation, local animation pause and manual interaction under OS reduced motion. Pause and reduced motion stopped the study animations. Desktop dark and narrow-phone light accessibility scans returned zero automated violations.
- The existing seventeen numerical, physics and theme tests, lint and production build pass. Model parameters and inference/backpropagation code are unchanged. No additional runtime dependencies or remote requests were introduced.

## SeeDL signal animation

- Replaced the rocking raster with a fixed SVG network. Cobalt signals move through three successive connection groups; receiving nodes highlight in sequence. Both themes use the existing palette variables.
- Formatting, HTML validation, module syntax, all 17 unit tests, the production build and dependency audit pass. The audit reports zero known vulnerabilities.
- All 16 browser scenarios pass across 320, 390, 768, 1024 and 1440 CSS pixels in both themes. Automated accessibility scans report zero violations. The SeeDL scenario checks forward signal movement, a fixed diagram, offscreen suspension, OS reduced motion, manual pause, project destinations and keyboard disclosure interaction. The no-JavaScript scenario confirms a visible static network.
- Inspected rendered desktop and mobile previews in both themes and captured comparison screenshots outside the repository. The inspected browser reports zero console errors or warnings. No screenshot, recording or local environment file is included in the change.
- Removed the 302 KiB raster asset. The inline vector needs no additional runtime dependency, request or JavaScript. Other sections, scientific demonstrations and factual project descriptions remain unchanged.
