# Validation record

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
- Desktop light/dark and 320 px phone light/dark axe-core scans returned zero automated violations and 29 passing groups with WCAG 2 A/AA, 2.1 AA and 2.2 AA tags. The phone checks included reduced motion, direct neuron selection and the actual misclassified sample. These are automated checks, not an accessibility certification.

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
