# Developing the portfolio

This is a static portfolio with two public pages: the [homepage](https://iamaritrasaha.github.io/) and [Embedded Systems Lab](https://iamaritrasaha.github.io/embedded/), plus a shared 404 page. HTML, layered CSS and native JavaScript modules provide the current cobalt, citron and paper presentation. There are no production dependencies, remote fonts, analytics or model endpoints.

## Local preview and checks

Use Node.js `^22.22.0 || >=24.8.0` and Python 3 for development, matching `package.json`. CI checks the supported 22, 24 and 26 release lines. The preview itself needs no dependency installation or build:

```bash
npm start
```

Open [localhost:4173](http://localhost:4173) or [the local lab](http://localhost:4173/embedded/). The server binds to loopback, serves public files only, redirects `/embedded` to `/embedded/`, and returns the actual 404 page/status for missing routes.

```bash
npm ci
npm run lint
npm test
npm run build
npx playwright install chromium firefox
npm run test:browser
```

`lint` checks Prettier formatting, all three HTML pages and syntax in every top-level JavaScript module under `assets/`, `scripts/` and `tests/`, plus the root script and Playwright configuration. `npm run format` formats the same authored files, including package/workflow configuration. Static tests check local page links and fragments, controls, image geometry, CSS resources, module imports, social-preview compatibility and source-size budgets. Text budgets normalize CRLF to LF; binary image dimensions and sizes use actual bytes.

Python resolution uses `PYTHON`, an optional ignored `.python-path`, then `python3`, `python` and `py`. `build` runs the static/unit checks and copies public files to `dist/`; it does not publish. Preview it with `npm start -- dist`. The model-training environment is separate and optional; see [digit-model.md](digit-model.md).

## Browser selection and coverage

Playwright starts its own preview on port 4174 with one worker. Microsoft Edge is the local default. To use the installed Playwright browsers in PowerShell:

```powershell
$env:PLAYWRIGHT_CHANNEL = "chromium"
npm run test:browser
$env:PLAYWRIGHT_BROWSER = "firefox"
npm run test:browser
Remove-Item Env:PLAYWRIGHT_BROWSER, Env:PLAYWRIGHT_CHANNEL
```

On a POSIX shell use `PLAYWRIGHT_CHANNEL=chromium npm run test:browser` and `PLAYWRIGHT_BROWSER=firefox npm run test:browser`. CI installs browser system dependencies with `npx playwright install --with-deps` as described in the [Playwright CI guide](https://playwright.dev/docs/ci).

There are 27 unit tests and 99 browser scenarios. Chromium runs all 99; Firefox skips the one test that explicitly uses Chromium's extension API for native browser zoom. Coverage includes:

- Independent neural forward/backward fixtures, all 1,438 derivatives, numerical stability, immutable inference, spring integration, RPM/LED continuity, theme persistence, Ohm's law, PWM timing and UART/I2C/SPI/CAN teaching signals.
- Both pages in light/dark themes, 13 widths from 320 to 2560px, enlarged text and spacing, short landscape, touch targets, keyboard navigation, disclosures and clipboard success/failure.
- Random hero starts without immediate refresh repeats, ordered automatic digit cycling, pauses for visibility/motion/manual work, classifier pixel edits and layer inspection, the projection study and hydrogen radial-state controls, lab circuit/PWM/protocol controls, forced colors and automated axe accessibility checks.
- Welcome timing and grid handoff, delayed/failed modules, focus-safe dismissal, reduced motion, data saving, offscreen/hidden-tab suspension and cross-tab preferences.
- JavaScript-disabled content, missing routes and preview-server path boundaries. Chromium additionally checks actual 200% and 400% browser zoom, calibrated to the native content viewport.

Screenshots and failure traces go to ignored `test-results/`. These checks use browser emulation; they do not establish physical-device, Safari or screen-reader coverage. [Validation history](validation.md) contains dated earlier results, not the current test count. The [maintenance record](maintenance.md) records the cleanup baseline and evidence.

## Module map

| Entry or module                                                                | Responsibility                                                                                                                                                                          |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `index.html`, `embedded/index.html`, `404.html`                                | Public content, semantic controls, metadata and static fallbacks.                                                                                                                       |
| `assets/theme.js`, `assets/navigation.js`                                      | Early theme selection and independent mobile navigation. Navigation stays usable while application modules load.                                                                        |
| `script.js`                                                                    | Homepage scene visibility, shared motion preference, entrances, disclosure transitions, hash focus and email copy. Mounts the notebook visualizations, RPM preview and surface physics. |
| `assets/bitbench.js`                                                           | Editable 8×8 hero input, prediction distribution, hidden-layer inspection and welcome lifecycle.                                                                                        |
| `assets/welcome-start.js`, `assets/welcome-math.js`                            | Synchronous first-paint cover gate and mathematical manuscript construction; `bitbench.js` owns the handoff and dismissal.                                                              |
| `assets/creative.js`, `assets/projection.js`                                   | Separate mounts for helicoid rotation, SeeDL isolation and the QUANTA radial study; pure helicoid-to-SVG geometry.                                                                      |
| `assets/pixel-relief.js`                                                       | Canvas projection of the same editable intensities; idle camera motion never changes inference.                                                                                         |
| `assets/neuron-demo.js`, `assets/neuron-math.js`                               | Notebook classifier interaction, SVG diagram and native MathML explanations.                                                                                                            |
| `assets/neural-network.js`, `assets/digit-model.js`                            | Pure forward/backward arithmetic and fixed exported weights/samples, shared by both classifier views and tests.                                                                         |
| `assets/research-plate.js`, `assets/surface-physics.js`, `assets/pulse-rpm.js` | Illustrated low-rank surface, bounded pointer springs and synthetic six-LED RPM cycle.                                                                                                  |
| `assets/embedded.js`, `assets/electronics-math.js`                             | Lab rendering/events/animation lifecycle and separate pure electrical/protocol calculations.                                                                                            |
| `scripts/`, `tests/`                                                           | Preview/build tools, integrity checks, numerical fixtures, model reproduction and Playwright scenarios.                                                                                 |
| `concepts/`, `docs/*-review/`, `docs/review/`                                  | Historical prototypes and selected evidence; not imported by the current website or copied into `dist/`. Retention decisions are in the maintenance record.                             |

## Styles and behavior

Load order is intentional. `styles.css` supplies foundations; component styles support the neural, research and SeeDL studies; `editorial.css` and `creative.css` retain active layout rules; `bitbench.css` supplies the current final shared palette. The homepage then adds welcome/RPM styles, while the lab adds `embedded.css`. Earlier stylesheet names do not mean the files are obsolete. See [design decisions](design-decisions.md) for current tokens and provenance.

The hero selects a random canonical digit on load and avoids the last displayed digit when session storage is available. After the welcome, it advances through 0–9 every 4.8 seconds with a 700 ms continuous morph of the relief heights/colors and a matching grid color transition. The canvas and grid stay stationary; rapid changes retarget from the current drawing. Only presentation interpolates, while inference uses the complete selected sample. Motion reduction, hidden tabs and an offscreen hero suspend cycling. Editing pixels or inspecting activations holds the sample until Next specimen; manual Next retains the additional challenge example. Automatic updates do not announce through the manual-control live region.

Preserve calculations, event ordering, animation durations and static fallbacks when refactoring. Motion controllers separately manage page-specific lifecycles while sharing the stored `portfolio-reduced-motion` preference; OS reduced motion and data saving take precedence. Theme and motion preferences synchronize across tabs. Bump changed asset query versions in their importing pages/modules to avoid stale caches.

## CI and deployment

`.github/workflows/ci.yml` checks PRs and pushes to `main`, with read-only repository permissions. Three Node jobs run install, lint, static/unit tests and build; two browser jobs run Chromium and Firefox on Node 24. Failure traces are retained for seven days. Pinned action commits make workflow dependencies reviewable.

GitHub Pages remains configured to publish the root of `main` using its existing Pages build/deployment workflow. CI neither deploys nor changes that configuration. Keep `.nojekyll`, `404.html`, `robots.txt`, `sitemap.xml` and `app-ads.txt`. The canonical URL remains `https://iamaritrasaha.github.io/`. A local `dist/` build is an optional static-hosting artifact.

Before merging, require the five CI checks, an up-to-date PR branch and resolved review conversations. No outside approval is required for this individually maintained repository. Force pushes and branch deletion must stay disabled for `main`; merged feature branches can be deleted automatically. Repository administration permission is needed to change these settings; fine-grained API tokens need **Administration: write**, in addition to **Contents: write** for branch operations and **Pull requests: write** for PRs.

## Ownership

© 2026 Aritra Saha. All rights reserved for original portfolio code/content. Third-party fonts, datasets and attributed material retain their own licenses. Preserve font notices, model provenance, source attribution and intentional compatibility assets, including the legacy social-preview PNG.
