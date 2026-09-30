# Aritra Saha | portfolio

An editorial portfolio of independent work in machine learning, local AI, Android and Linux systems. Project stories, calculated neural-network visualizations and an ivory, charcoal and cobalt palette carry the presentation. Built with semantic HTML, CSS and progressive vanilla JavaScript. No production dependencies, external font requests, analytics or model API endpoints.

## Run locally

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

Open [localhost:4173](http://localhost:4173). The site works directly from the repository; no installation or build is required for a preview.

## Development

Optional checks require Node.js 22+ and Python 3:

```bash
npm ci
npm run lint
npm test
npm run build
```

Lint checks formatting, HTML and JavaScript syntax. Tests cover static site integrity, neural-network arithmetic, spring behavior and theme preferences. The build runs tests and copies deployable files into `dist/`. Use `npm run format` to format authored source and documentation. Recorded browser checks and their limits belong in [docs/validation.md](docs/validation.md).

## Structure

| File                                | Responsibility                                                                                                                       |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `index.html`                        | Content, project spreads, native engineering disclosures, navigation and metadata. Core content remains readable without JavaScript. |
| `styles.css`                        | Local fonts, visual tokens, page compositions, responsive layouts, print and accessibility rules.                                    |
| `script.js`                         | Navigation, one-time entrances, disclosure transitions, visible-scene motion and user motion preferences.                            |
| `assets/research-plate.js` / `.css` | Original SVG weight-space study inside Orion's engineering notebook, with Base weights / Low-rank update controls.                   |
| `assets/neuron-demo.js` / `.css`    | Trained 64 → 16 → 12 → 10 digit recognizer with real image inputs, calculated inference and backpropagation.                         |
| `assets/neural-network.js`          | Pure forward/backward mathematics shared by the visualization and numerical tests.                                                   |
| `assets/digit-model.js`             | Exported learned weights, small held-out image examples and training metadata.                                                       |
| `assets/surface-physics.js`         | Bounded fine-pointer spring response for Relay and Vyren artwork.                                                                    |
| `assets/theme.js`                   | First-paint theme selection, live OS preference and saved manual overrides.                                                          |
| `assets/fonts/`                     | Local Newsreader, Inter and JetBrains Mono fonts with licenses.                                                                      |
| `assets/projects/`                  | Preserved project identities and source artwork.                                                                                     |
| `404.html`                          | Matching error page with root-relative assets for nested missing URLs.                                                               |
| `scripts/`                          | Static integrity checks, module tests and optional artifact build.                                                                   |

[Design decisions](docs/design-decisions.md) documents the visual system, component structure, content provenance and motion architecture.

## Editing content and appearance

Selected work uses distinct compositions: Orion's research spread, SysAI's midnight-blue diagnostic section, and the offset Relay/Vyren pair. Preserve each project's problem, personal engineering contribution, implementation choices and current state. Keep smaller projects in the compact index and Aether outside the main features. The hero is a real small digit classifier trained for this interactive study. Its held-out result is a demo evaluation, not an Orion result. The weight-space surface remains an illustration. See [model provenance and reproduction](docs/digit-model.md) for the training configuration, split, source attribution and numerical checks. Training is optional and uses a separate Python environment; serving the exported model requires no Python ML packages.

Change shared colors and fonts in the tokens at the start of `styles.css`. Newsreader normal and italic are local static weight-400, optical-size-48 subsets, about 52 KB combined, licensed under SIL OFL. Update visible copy and social metadata together. Increment changed asset `?v=` references in both HTML pages to avoid stale browser caches.

The native theme selector defaults to System and follows live OS changes. Light and Dark save an explicit local override; System clears it. The hero-caption and footer motion controls remember a separate preference. OS reduced motion and data saving take precedence; `?motion=reduce` previews the reduced experience.

Scene animation runs only while its artwork is visible and the document is active. Section entrances run once. Native details retain keyboard behavior and receive a short transition when motion is allowed. Touch scrolling remains native, and every disclosure and illustration control remains usable with motion reduced.

## Deployment

Publish the repository root or generated `dist/` to static hosting. Keep `404.html`, `robots.txt`, `sitemap.xml` and `app-ads.txt`. The canonical URL is `https://iamaritrasaha.github.io/`; update canonical/social metadata and the sitemap if the domain changes. No server runtime or API key is required. GitHub Pages publishes the repository root automatically when `main` is pushed. The `.nojekyll` marker keeps the site on the plain static publishing path. Building locally writes `dist/` without publishing.
