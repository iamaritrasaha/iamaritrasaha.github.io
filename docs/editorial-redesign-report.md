# Editorial engineering portfolio redesign

## Result and review

Implemented on `feat/portfolio-editorial-redesign`, starting from clean commit `734d6ab95065a615508fbff314dd50665cf368e0`. No push, merge or production deployment was performed.

The direction is an open engineering notebook: a monumental Literata nameplate, cool paper and forest-green surfaces, technical Mono navigation, a working classifier and project-specific presentations. SeeDL leads, followed by Infera's analysis pipeline and PulseShift's embedded-system study. Orion remains an explicitly private research notebook. Earlier studies and all historical project fragment URLs remain in the document.

To review:

```powershell
git switch feat/portfolio-editorial-redesign
npm ci
npm start
```

Open [the local preview](http://localhost:4173). `npm run build` creates `dist/`; `npm start -- dist` previews that artifact. No production runtime or framework migration is required.

## Before and after

These are actual Edge screenshots, not the generated planning references. The baseline inspector captured the system's dark theme; both final themes are included. The desktop baseline is 1440 × 900 and final desktop is 1440 × 1000; mobile is 390 × 844. Motion is reduced for stable final captures.

| View           | Before                                   | After                                |
| -------------- | ---------------------------------------- | ------------------------------------ |
| Desktop, dark  | [Before](review/before-desktop-dark.jpg) | [After](review/after-1440-dark.png)  |
| Mobile, dark   | [Before](review/before-mobile-dark.jpg)  | [After](review/after-390-dark.png)   |
| Desktop, light |                                          | [After](review/after-1440-light.png) |
| Mobile, light  |                                          | [After](review/after-390-light.png)  |

Project and state captures: [SeeDL](review/seedl.png), [Infera](review/infera.png), [PulseShift](review/pulseshift.png), [mobile navigation](review/mobile-navigation.png), [keyboard-adjusted LED preview](review/led-preview-mobile.png).

Full-page captures at 320, 390, 768, 1024 and 1440px, both theme folds, animation captures and initial reference-site captures are also available locally in the ignored `.taste-skill/` directory. Playwright creates full-page images in `test-results/`.

## File-by-file changes

| File                                         | Change and purpose                                                                                                                                                                                                                                                                            |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `index.html`                                 | Personal nameplate and professional role, concise introduction, new verified Infera and PulseShift features, source links and limitations, ordered project shortcuts, local font preloads and asset revisions. Preserves original studies, disclosures, archive, SEO URLs and model fallback. |
| `404.html`                                   | Matching font preloads, palette metadata and root-relative redesign stylesheet. Nested missing routes still resolve to the error page.                                                                                                                                                        |
| `styles.css`                                 | Replaces the font declarations and shared palette; brings existing artwork into the green system. Existing component structures and responsive fallbacks remain.                                                                                                                              |
| `assets/editorial.css`                       | New scoped composition layer: responsive nameplate, editorial rhythm, project spreads, accessible controls, entrance choreography, reduced-motion and print states.                                                                                                                           |
| `script.js`                                  | Staggered native pipeline entrance with cancellable Web Animations; keyboard-native illustrative LED preview. Existing theme-independent motion preference, visibility, navigation, clipboard and model controls remain.                                                                      |
| `assets/neuron-demo.css`                     | Literata mathematical typography and an earlier single-column breakpoint to keep equations readable at tablet widths.                                                                                                                                                                         |
| `assets/research-plate.css`                  | Retained research surface with mint/green annotations. Geometry and interaction code unchanged.                                                                                                                                                                                               |
| `assets/theme.js`                            | Theme-color metadata now matches the effective green-black or cool-paper surface. Preference behavior unchanged.                                                                                                                                                                              |
| `assets/fonts/Literata-Latin-Variable.woff2` | Official self-hosted variable Latin font, 85,672 bytes.                                                                                                                                                                                                                                       |
| `assets/fonts/Literata-OFL.txt`              | Required official font license.                                                                                                                                                                                                                                                               |
| `assets/fonts/README.md`                     | Font download provenance, axes, sizes and licensing. The existing regular Mono file and its license remain. Four obsolete font binaries were removed after verifying the replacement loads. Historical license notices are preserved.                                                         |
| `scripts/check_site.py`                      | Expected feature inventory now includes both new projects. Adds an explicit 22 KB editorial CSS budget; HTML budget rises from 47 to 56 KB for two full case studies, and script budget from 12 to 14 KB for their interactions. Existing limits and preserved anchor checks remain.          |
| `scripts/check_theme.mjs`                    | Updates expected first-paint metadata colors to the new palette.                                                                                                                                                                                                                              |
| `tests/portfolio.spec.mjs`                   | Two additional browser tests cover source destinations, fragment focus, keyboard LED progression, explicit limitations, no-JS behavior and live motion cancellation.                                                                                                                          |
| `README.md`                                  | Updated typography, project order, palette and review documentation.                                                                                                                                                                                                                          |
| `docs/design-decisions.md`                   | Revised design-system description; retains computation and architecture provenance.                                                                                                                                                                                                           |
| `docs/editorial-redesign-spec.md`            | Pre-implementation direction, safety audit, content argument, source research and verification plan.                                                                                                                                                                                          |
| `docs/editorial-redesign-report.md`          | This review record.                                                                                                                                                                                                                                                                           |
| `docs/review/`                               | Before/after screenshots, project/state evidence, raw Lighthouse report and external link audit. These documentation files are not copied into the deployment artifact.                                                                                                                       |

The trained weights, training metadata, numerical engine, equation renderer, neural interaction implementation, project source artwork, canonical URL, sitemap, robots, advertising file and `.nojekyll` are unchanged.

## Validation

Baseline: dependency installation, lint, integrity checks, 17 numerical/theme/physics tests, build and all 16 existing browser tests passed before implementation.

Final verification:

| Check                   | Result                                                                                                                                                                                             |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm ci`                | Pass; three existing moderate development-tool advisories remain.                                                                                                                                  |
| `npm run lint`          | Pass: Prettier, HTML validation and JavaScript syntax.                                                                                                                                             |
| `npm test`              | Pass: static integrity and all 17 module tests. Includes finite-difference checks of all 1,336 weight, 38 bias and 64 input gradients.                                                             |
| `npm run build`         | Pass; static artifact generated without publishing.                                                                                                                                                |
| `npm run test:browser`  | All 18 Edge tests pass.                                                                                                                                                                            |
| Responsive themes       | 320, 390, 768, 1024 and 1440px, light and dark; no horizontal overflow.                                                                                                                            |
| Accessibility           | Existing axe checks report no violations across the viewport/theme matrix and 404. Keyboard navigation, classifier controls, disclosures, clipboard feedback and reduced motion pass.              |
| Progressive enhancement | No-JS navigation, classifier explanation, artwork, source links and native disclosures survive. LED control is hidden while its static six-pixel illustration remains.                             |
| Runtime motion          | Classifier plays while visible and pauses off screen. User and OS reduced-motion preferences cancel the new pipeline animation.                                                                    |
| Links                   | All 25 unique homepage HTTPS destinations returned HTTP 200 on 4 November 2026. Local targets and historical fragments pass static integrity checks. [Recorded responses](review/link-audit.json). |

The visual iteration fixed a 320px diagnostic-grid overflow and a 768px numeric equation overflow, increased nameplate scale, repaired the legacy Practice heading column, shortened two legacy mobile headings, removed obsolete font preloads, and resolved Lighthouse's accessible-name warning on the SeeDL illustrated link. Theme test color expectations were updated after intentionally changing the theme-color palette. These were implementation-time failures, not pre-existing defects.

## Measured performance

Lighthouse 13.6.0, generated `dist/` artifact on port 4175, headless Microsoft Edge, default mobile emulation and simulated throttling. The final audit used the same authored files as the generated static artifact. These are local lab measurements, not deployed field data or a physical-device result. [Raw report](review/lighthouse-mobile.json).

| Metric                   | Final result |
| ------------------------ | ------------ |
| Performance              | 94           |
| Accessibility            | 100          |
| Best Practices           | 100          |
| SEO                      | 100          |
| First Contentful Paint   | 1.9 s        |
| Largest Contentful Paint | 1.9 s        |
| Total Blocking Time      | 210 ms       |
| Cumulative Layout Shift  | 0.070        |

An earlier local run measured Performance 97 with 110 ms blocking time and CLS 0.073. Normal test variance and concurrent desktop/browser activity affect the scores. Report the final 94, not the best run. Lighthouse still identifies minification, render-blocking styles and unused first-viewport CSS as optimization opportunities. Native mathematical glyphs may fall back to platform fonts outside the Latin subset.

## Visual review and tradeoffs

The generated hero reference supplied the large-name and two-column proportions, while three separate references established SeeDL, Infera and PulseShift compositions. Their graphics and invented labels were not shipped. The actual classifier retains its own dataset, GELU equations, weights and documented held-out examples. No stock photographs, generated project screenshots or fabricated metrics were introduced.

The art-direction draw was **name-as-monument**, seed **1769266725**. Photograph, marquee and pinned-image slots were adapted to real computation and scientific diagrams because the user's brief prioritizes actual engineering work, native scrolling and restrained motion. The requested Mono metadata and engineering rules intentionally override the skill's generic bans on these devices.

Three review passes checked hierarchy, spacing, project composition, theme contrast, mobile line breaks and interactive states. The final subjective assessment is design 7.5, usability 8, creativity 7.5, content 8.5 (weighted 7.75/10, not an independent rating). The strongest signature is the relationship between the nameplate and the inspectable classifier. The older project archive remains intentionally denser and less redesigned than the new featured work.

The optional art-direction inspector’s film capture timed out at `Page.captureScreenshot`. Its subsequent screenshot run identified the Practice heading problem, now corrected. Its raw lint also rejects intentional Mono labels, notebook rules and preserved diagram numbering. The final inspector reports zero failures and seven warnings with explicit brief-specific allowances for Mono, notebook rules, compact technical annotations, diagram numbering, scientific imagery, and closed disclosure descendants. The warnings concern the retained biography emphasis, native control outlines, archive rows, diagram type sizes, absence of unrelated video, the section-heading/metadata gap, and a name-only heuristic despite the visible professional role. These are intentional content and engineering choices; they are not a substitute for the passing repository checks. Playwright screenshots and direct rendered-state checks provide the visual evidence. No cross-browser or physical-phone testing was performed.

The site stays in vanilla HTML/CSS/JavaScript with no new production dependency. A separate editorial stylesheet preserves existing laboratory and archive CSS at the cost of some overlapping selectors. PulseShift's range input changes an explicitly illustrative LED composition; it does not execute embedded firmware or replace any real calculation. Infera's pipeline is a descriptive diagram. Orion's unpublished research claims remain inherited context, not independently reproduced results. No résumé was added because no verified asset or destination exists in the repository.

The three npm advisories affect the existing `html-validate` development dependency chain (`glob` and `minimatch`). npm proposes a major tooling upgrade; this redesign does not apply it. Production has no installed JavaScript runtime dependency.
