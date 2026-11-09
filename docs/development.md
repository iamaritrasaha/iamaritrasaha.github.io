# Developing the portfolio

This is a static portfolio with three public pages: the [homepage](https://iamaritrasaha.github.io/), [Embedded Systems Lab](https://iamaritrasaha.github.io/embedded/), and [Systems & Research Explorations](https://iamaritrasaha.github.io/explorations/), plus a shared 404 page. HTML, layered CSS and native JavaScript modules provide the current cobalt, citron and paper presentation. There are no production dependencies, remote fonts, analytics or model endpoints.

## Architecture Walkthrough

For a comprehensive, beginner-friendly walkthrough of the website's architecture, styling cascade, machine-learning classifier, split-flap reel physics, 3D projection rasterizer, and embedded simulations, refer to:

- [Codebase Walkthrough & Architecture Guide](./code-walkthrough.md)

## Project architecture map

```
iamaritrasaha.github.io/
├── index.html                  # Homepage (featured AI/ML, interactive classifier, SeeDL, Orion)
├── 404.html                    # Error page with matching theme and navigation
├── embedded/
│   └── index.html              # Embedded Systems Lab (PulseShift, circuits, PWM, protocols)
├── explorations/
│   └── index.html              # Systems & Research Explorations (historical archive, Vyren)
├── styles.css                  # Foundational reset, design tokens, typography, grid layouts
├── script.js                   # Homepage orchestration: scene mounts, motion sync, hash focus
├── assets/
│   ├── theme.js                # Early theme initialization (<head>) and cross-tab storage sync
│   ├── navigation.js           # Responsive mobile navigation drawer and focus trapping
│   ├── notebook-paper.css      # Engineering notebook graph-paper background grids
│   ├── editorial.css           # Editorial typography and magazine layouts
│   ├── creative.css            # Studio presentation styles and featured work cards
│   ├── bitbench.css            # Cobalt/citron matrix tokens and workbench component styling
│   ├── bitbench.js             # Hero 8×8 classifier matrix, sample cycling, welcome handoff
│   ├── welcome-start.js        # Synchronous first-paint cover gate (flash protection & fallback)
│   ├── welcome-name.js         # 3D split-flap glyph card assembly and responsive text layout
│   ├── welcome-reel.js         # Physics-based reel cadence, deceleration math, symbol reveals
│   ├── welcome-math.js         # Mathematical manuscript equations and fallback paths
│   ├── digit-model.js          # Pre-trained 64→16→12→10 MLP weights and test specimens
│   ├── neural-network.js       # Pure forward/backward math (GELU, softmax, stable cross-entropy)
│   ├── neuron-demo.js          # Interactive classifier canvas, layer activations, probe controls
│   ├── neuron-math.js          # Native MathML equation markup and numerical explanations
│   ├── pixel-relief.js         # 3D isometric canvas relief projection of pixel intensities
│   ├── projection.js           # Pure 3D helicoid geometry, rotation matrix, orthographic camera
│   ├── projection-renderer.js  # Depth-sorted polygon rasterization for helicoid surface
│   ├── surface-physics.js      # Continuous critically-damped pointer spring physics
│   ├── electronics-math.js     # Pure electrical math (Ohm's law) and protocol waveforms
│   ├── embedded.js             # Embedded Lab instrument controllers and oscilloscope renderer
│   └── pulse-rpm.js            # Simulated RPM waveform and synchronized shift-light LEDs
├── scripts/                    # Test fixtures, site integrity checks, build tools
└── tests/                      # Playwright E2E and visual regression test suites
```

## Entry points and responsibilities

| Page / Route     | Entry File                | Primary Script           | Core Responsibilities                                                                                              |
| ---------------- | ------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `/` (Homepage)   | `index.html`              | `script.js`              | Hero 8×8 digit classifier, Cipher Reel welcome, SeeDL inspection, QUANTA radial orbital study, Orion case study.   |
| `/embedded/`     | `embedded/index.html`     | `assets/embedded.js`     | Interactive laboratory: resistor power dissipation, PWM duty-cycle generator, and oscilloscope protocol waveforms. |
| `/explorations/` | `explorations/index.html` | `assets/explorations.js` | Chronological research index, Vyren systems study, architectural explorations, and legacy fragment redirection.    |
| `/404.html`      | `404.html`                | `assets/theme.js`        | Standalone fallback page maintaining consistent branding, theme switching, and navigation back to index.           |

## CSS organization and load order

Stylesheets are loaded in strict cascade order:

1. **Foundations (`styles.css`):** Core reset, CSS custom properties (color tokens, font variables, elevation), typography hierarchy, base element rules, and fluid responsive grid primitives.
2. **Notebook Grid (`assets/notebook-paper.css`):** Engineering graph-paper background pattern, ruled margin lines, and paper texture emulation.
3. **Component Studies:**
   - `assets/editorial.css`: Editorial typography, multi-column case studies, and callout layouts.
   - `assets/creative.css`: Studio cards, projection viewer frames, and project showcase layouts.
   - `assets/bitbench.css`: The current cobalt (`#002b49`) and citron (`#d4e157`) design tokens, editable matrix styles, specimen controls, and classification bars.
4. **Feature & Page Specifics:**
   - Homepage: `assets/welcome-math.css` (Cipher Reel cover), `assets/seedl-feature.css`, `assets/quanta-feature.css`, `assets/neuron-demo.css`.
   - Embedded Lab: `assets/embedded.css` (oscilloscope canvas, circuit schematics, protocol controls).
   - Explorations: `assets/explorations.css`, `assets/architecture.css`.

## Machine learning and scientific computing architecture

All scientific and machine learning demonstrations execute client-side with zero remote inference dependencies:

- **Model Checkpoint (`assets/digit-model.js`):** Contains fixed, trained float weights for a 4-layer fully-connected network (64 inputs → 16 hidden → 12 hidden → 10 outputs) trained on 8×8 handwritten digits, alongside reference specimen arrays (digits 0–9 plus challenge 751).
- **Inference Engine (`assets/neural-network.js`):** Pure functional forward pass implementation with numerical safeguards:
  - GELU activation function with analytical derivative: $\text{GELU}(x) = x \cdot \Phi(x)$.
  - Numerically stable softmax using log-sum-exp subtraction ($\max(z_i)$ shift) to eliminate float overflow.
  - Cross-entropy loss and gradient backpropagation for real-time loss visualization.
- **Classifier Visualization (`assets/neuron-demo.js`, `assets/neuron-math.js`):** Renders hidden-layer activation bars, dynamic confidence scores, and formula explanations in native MathML.
- **Embedded Electronics Math (`assets/electronics-math.js`):** Pure calculations for Ohm's law ($V = IR, P = VI = I^2 R = V^2 / R$), PWM pulse on-time/period, and teaching waveforms for UART 8N1, I2C, SPI mode 0, and differential CAN bus signals.
- **Physical Projections (`assets/projection.js`, `assets/surface-physics.js`):** True 3D rotation matrices, orthographic camera projection, analytical hydrogen radial wavefunctions, and critically-damped spring physics ($\omega_0, \zeta$).

## Welcome animation initialization (Cipher Reel)

The welcome screen uses a multi-stage progressive reveal engineered to prevent unstyled flash and support full accessibility:

1. **First-Paint Flash Protection (`assets/welcome-start.js`):** Executes synchronously in `<head>`. Immediately creates a plain-name cover veil over the page. If JavaScript fails, fonts are delayed, or data-saver is active, the plain name remains cleanly readable and dismissible.
2. **Glyph & Reel Construction (`assets/welcome-name.js`, `assets/welcome-reel.js`):** Assembles 3D split-flap cards for "Aritra Saha". A physics-based cadence decelerates monotonically over an even number of half-turns ($k \times 180^\circ$) so each card lands squarely at $0^\circ$ revealing the final letter.
3. **Handoff to Workbench (`assets/bitbench.js`):** When the animation finishes or the user presses Escape / taps Dismiss, `bitbench.js` cleanly transitions the veil away, restores focus, and hands off execution to the interactive 8×8 digit workbench.
4. **Safeguards:** Bypassed automatically when `prefers-reduced-motion` is active, when `localStorage` has `portfolio-reduced-motion`, or on return visits within the same session.

## Local preview and testing

Requirements: Node.js `^22.22.0 || >=24.8.0` and Python 3.

```bash
# Install development dependencies
npm ci

# Start local preview server (serves on http://localhost:4173)
npm start

# Run linters (Prettier formatting, HTML-validate, JS syntax check)
npm run lint

# Auto-format codebase
npm run format

# Run static integrity checks and unit tests (Python check_site.py + node test suite)
npm test

# Build production distribution into dist/
npm run build

# Run end-to-end and visual regression browser tests (Playwright)
npm run test:browser
```

To run Playwright on a specific browser in PowerShell:

```powershell
$env:PLAYWRIGHT_CHANNEL = "chromium"; npm run test:browser
$env:PLAYWRIGHT_BROWSER = "firefox"; npm run test:browser
Remove-Item Env:PLAYWRIGHT_BROWSER, Env:PLAYWRIGHT_CHANNEL
```

### Test suite composition

- **37 Unit Tests (`scripts/check_*.mjs`):** Test resistor power conservation, PWM duty/frequency, UART/I2C/SPI/CAN protocol frames, 64→16→12→10 neural network inference, GELU derivatives, all 1,438 gradient checks against finite differences, numerical stability under underflow, spring settlement, RPM continuity, helicoid projection, hydrogen wavefunctions, 3D camera lengths, and Cipher Reel deceleration cadence.
- **Static Integrity Checks (`scripts/check_site.py`):** Enforces HTML structure, meta tags, social card dimensions (1200×630 PNG), preserved URL fragment anchors, and strict canonical source size budgets (UTF-8 canonical LF).
- **170 Playwright E2E Tests:** Covers all viewports (320px–2560px), light/dark themes, 200%/400% zoom, keyboard navigation, touch interactions, contact folio, welcome flash protection, classifier manipulation, and welcome dismissal paths across Chromium and Firefox.

## How to add a new portfolio project

1. **Add Project Markup:**
   - For a primary featured study: Add an `<article id="your-project-id" class="case-study">` in `index.html` under the `<section id="work">` region. Include a descriptive heading, metadata pills, project description, and links.
   - For an archive exploration: Add an `<article id="your-project-id" class="archive-item">` in `explorations/index.html`.
2. **Preserve Anchors in CI Integrity Checks:**
   - If the project is featured on the homepage, add `'your-project-id'` to `homepage.featured_cases` or the preserved anchors list in `scripts/check_site.py:119-125`.
   - If added to Explorations, add `'your-project-id'` to the explorations list in `scripts/check_site.py:117-118`.
3. **Prepare Responsive Visual Assets:**
   - Place optimized assets in `assets/projects/` using modern formats: responsive WebP with PNG fallback.
   - Use standard `<picture>` elements with `width` and `height` attributes to avoid Cumulative Layout Shift (CLS).
4. **Style the Component:**
   - Add scoped styles into `assets/creative.css` or create a scoped stylesheet (e.g. `assets/your-project.css`) and link it in the HTML.
   - Verify size budgets: if adding a new stylesheet or modifying existing files, check the limits in `scripts/check_site.py:126-145`.
5. **Verify:**
   - Run `npm test` to confirm all anchor, geometry, and size-budget assertions pass.
   - Run `npm run lint` to format code.
   - Run `npm run test:browser` to verify responsive reflow, theme compatibility, and accessibility.

## Ownership

© 2026 Aritra Saha. All rights reserved for original portfolio code/content. Third-party fonts, datasets and attributed material retain their own licenses. Preserve font notices, model provenance, source attribution and intentional compatibility assets, including the legacy social-preview PNG.
