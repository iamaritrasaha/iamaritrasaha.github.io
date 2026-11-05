# Responsive refinement audit

Baseline: `2459547e4cee564ad6984054df666d1994a11162`, verified against production on 5 November 2026. No open pull requests. Recovery checkpoint recorded before editing.

## Standards checklist

- Use relative text sizes and bounded fluid scales. Combine viewport and relative units; respect user font preferences and comfortable line lengths. [web.dev typography](https://web.dev/learn/design/typography), [MDN clamp](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/clamp).
- Let content determine layout changes, using flexible Grid/Flexbox tracks and component queries where their available space matters. Do not equate device names with universal breakpoints. [Responsive design basics](https://web.dev/articles/responsive-web-design-basics), [MDN container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries).
- Check 200% text resizing and 320 CSS-pixel reflow, equivalent to a 1280px viewport at 400% zoom. Test short landscape screens and avoid rigid text heights. [WCAG 1.4.4](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html), [WCAG 1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [MDN viewport units](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/length).
- Apply user text spacing: line height 1.5, paragraph spacing 2em, letter spacing .12em, word spacing .16em. Check clipping and overlap, not just document width. [WCAG 1.4.12](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html).
- Check contrast (4.5:1 normal text, 3:1 large text), visible keyboard focus, accessible names and touch targets. AA target minimum is 24 by 24 CSS pixels or an applicable spacing/other exception; 44px remains a useful larger control target. [WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [WCAG 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).
- Prefer transform/opacity for motion. Inspect expensive rendering, visibility suspension, reduced motion, and data saving before removing creative effects. [Animation performance](https://web.dev/articles/animations-guide).
- Record lab results separately from field data. Good Core Web Vitals targets at the field 75th percentile are LCP ≤2.5s, INP ≤200ms and CLS ≤0.1. A Lighthouse navigation score does not measure field INP. [Web Vitals](https://web.dev/articles/vitals).

## Baseline findings

Confirmed: the unwanted welcome note is generated in JavaScript and has dedicated CSS. Fixed pixel font sizes prevent default-font enlargement across much of the page. At 320px, WCAG text-spacing overrides overflow the classifier heading and practice section. Ordinary layout passes the requested width sweep before changes. Additional findings and verification will be recorded after the rendered component audit.

## Confirmed defects and targeted changes

- Removed the unwanted `.manuscript-note` element and its dedicated rules. No substitute text was added. Equations and durations remain unchanged.
- Fixed-pixel reading and control text did not follow browser font preferences. Converted text sizes to rem while retaining the existing default scale; raised selected 8–11px HTML labels to 12px. Diagram coordinates remain independent of prose layout.
- Text-spacing overrides overflowed the 320px classifier header and practice layout. Flexible tracks, wrapping controls and zero minimum widths now accommodate those overrides.
- Enlarged text clipped the Relay illustration and exposed archive, diagnostic-step, contact and long-heading overflow. The Relay frame now has a text-relative minimum height. Those components now wrap according to available content space. The classifier uses a container query to arrange its output when its own width becomes constrained.
- Welcome height-only queries incorrectly treated short portrait screens like landscape. Portrait equations now use the upper and lower margins, while short landscape and highly zoomed viewports keep the identity separate from the formulas.
- Generic welcome `.math-label` and `.math-caption` selectors also affected project annotations. Renamed the decorative classes to keep the welcome styles local.
- The asynchronously revealed hero relief produced a large layout shift. Reserved its space, plus the mobile menu space, before modules initialize. No artificial loading delay was added.
- Enlarged MathML now has keyboard-focusable local scroll regions, retaining complete equations. Firefox requires slightly more formula width at 320px; reduced the classifier's inner padding there instead of reducing formula type.
- Cobalt header controls now have a citron focus outline with visible contrast.
- The expanded mobile navigation could cause a further layout shift while the main module loaded. Its existing behavior now initializes from a small independent script immediately after the header, before the main content is parsed, preserving the no-JavaScript navigation. A test holds all application modules pending and verifies that navigation still works.

The existing numerical model, inference/gradient routines, RPM timing, scene visibility observers, reduced-motion handling, early welcome guard, project content and publishing configuration were preserved. Existing animation loops already stop through visibility and motion controls, so no speculative loop rewrite was made.

## Browser reproduction

```sh
npm ci
npm run lint
npm test
npm run build
PLAYWRIGHT_CHANNEL=chromium npm run test:browser
PLAYWRIGHT_BROWSER=firefox npm run test:browser
```

The viewport sweep covers 320, 360, 375, 390, 430, 600, 768, 1024, 1280, 1366, 1440, 1920 and 2560 CSS pixels, both themes, 200% root-font enlargement, WCAG text spacing, expanded disclosures and touch controls. Welcome checks sample both equation phases and detect collision with the identity, not merely page overflow. Existing tests retain numerical, keyboard, no-JavaScript, data-saving, visibility and first-paint checks.

A temporary Chromium extension used the actual `chrome.tabs.setZoom(..., 4)` API in a 1280px window. Measured results: 320 CSS-pixel viewport, device pixel ratio 4, document width 320px. This is browser emulation, not physical-device testing. Firefox's clipboard test uses a controlled clipboard adapter because its automation API does not accept Chromium clipboard permission names; native clipboard behavior remains covered in Chromium.

WebKit binaries downloaded successfully but cannot launch without system libraries (GTK 4, Graphene, HarfBuzz ICU, Manette, Hyphen and GLES). The container cannot install those system dependencies with its available privileges. No WebKit pass is claimed.

## Local Lighthouse results

Lighthouse navigation runs with its mobile simulated throttling and desktop preset, against the uncompressed local static server. These are laboratory results, not field percentiles or a WCAG conformance certification.

| Version  | Profile | Performance | Accessibility | Best Practices | SEO |   LCP |   CLS |  TBT |
| -------- | ------- | ----------: | ------------: | -------------: | --: | ----: | ----: | ---: |
| before   | mobile  |          79 |           100 |            100 | 100 | 3.01s |  0.26 | 24ms |
| before   | desktop |          99 |           100 |            100 | 100 | 0.78s |  0.05 |  0ms |
| homepage | mobile  |          86 |           100 |            100 | 100 | 3.77s | 0.002 | 83ms |
| homepage | desktop |         100 |           100 |            100 | 100 | 0.78s | 0.005 |  0ms |
| lab      | mobile  |          98 |           100 |            100 | 100 | 1.96s |     0 |  0ms |
| lab      | desktop |         100 |           100 |            100 | 100 | 0.45s | 0.003 |  0ms |

Homepage mobile performance improved from 79 to 86, and CLS fell from 0.260 to 0.002. The local homepage 90+ performance and 2.5s LCP targets were not fully met. The lab meets the mobile targets in this run. The local server does not compress text assets; production measurements must be evaluated separately. No field INP data is available. TBT is a separate laboratory diagnostic, not a substitute for INP.

An unthrottled local interaction sample recorded a maximum Event Timing duration of 40ms, a maximum handler processing time of 3.2ms and two startup long tasks (85ms and 70ms). The RPM readout updated 119 times over 2 seconds and stopped when offscreen. This sample is laboratory evidence, not field INP or a sustained device frame-rate guarantee.

Optional future work includes consolidating/minifying legacy stylesheet layers after a separate visual baseline review. It was not necessary to fix the confirmed reflow defects, and broad stylesheet removal would add risk to this refinement.

A pre-existing intermittent Chromium motion-preference test was isolated to trace instrumentation: three of five traced runs missed the MediaQueryList change callback even though the existing query reported the new value; five untraced runs passed. The live preference test retains all assertions and disables trace recording only in its own test file. No polling loop or speculative application workaround was introduced. Failure screenshots remain enabled.

Final browser validation: 85 Chromium tests passed; Firefox passed 84 with one intentional skip for the Chromium-only native zoom API. Both pages passed their requested width, font enlargement, spacing, theme, keyboard and motion checks. The new lab also caught and fixed narrow enlarged equation wrapping and Firefox’s default range-input margin overflow before publication. Numerical/static tests: 26 passed. Automated accessibility checks found no violations in the exercised states. These checks supplement, rather than constitute, a full manual WCAG conformance assessment.

See [Embedded Systems Lab implementation](embedded-lab.md) for the new route, teaching models, source qualifications and maintenance notes.
