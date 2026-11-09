# Codebase Walkthrough & Architecture Guide

A beginner-friendly, comprehensive guide to the architecture, algorithms, and engineering patterns powering [iamaritrasaha.github.io](https://iamaritrasaha.github.io).

---

## 1. Architecture Overview

### Zero-Framework, Native Web Standards

The portfolio is built entirely with standard web platform APIs:

- **Semantic HTML5:** Native document structure (`<header>`, `<main>`, `<article>`, `<section>`, `<details>`, `<footer>`).
- **Modern CSS3:** Scoped modular stylesheets, CSS Custom Properties (variables), CSS Grid, and Flexbox with zero preprocessors.
- **Native ES Modules:** Native JavaScript modules loaded via `<script type="module">` directly in modern browsers without webpack, Vite, Rollup, or Babel.
- **Static GitHub Pages Hosting:** Zero server-side compute. All interactive demonstrations (machine learning inference, 3D graphics, spring physics) run client-side on the user's CPU and GPU.

### Page Topology & Entry Points

The website consists of four static HTML pages:

1. `index.html`: The primary homepage containing the Cipher Reel welcome cover, Bitbench 8x8 digit classifier, case studies, and engineering philosophy.
2. `embedded/index.html`: The Embedded Lab interactive electronics and signal analysis workshop.
3. `explorations/index.html`: An archive of systems research, creative experiments, and exploratory projects.
4. `404.html`: A custom styled fallback page preserving site typography and theme palette.

```
                    ┌─────────────────────────┐
                    │       index.html        │
                    │   (Home & Bitbench)     │
                    └───────────┬─────────────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          ▼                     ▼                     ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  embedded/       │  │  explorations/   │  │    404.html      │
│  (Hardware Lab)  │  │  (Experiments)   │  │ (Error Fallback) │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

---

## 2. Styling Architecture

### CSS Cascade & Layering

Stylesheets are organized in a strict load order where later sheets refine earlier defaults without requiring high specificity or `!important`:

1. `styles.css`: Base typography, layout grid, CSS custom properties, and reset defaults.
2. `assets/editorial.css`: Warm editorial grid, fluid responsive typography, and magazine-style typographic treatments.
3. `assets/creative.css`: Creative experiments, trace diagrams, and specialized SVG visual styling.
4. `assets/bitbench.css`: The cobalt-and-citron visual system, terminal styling, and hero interactive elements.
5. `assets/notebook-paper.css`: Subtle blueprint grid and graph-paper backgrounds.

### Color Tokens & System Themes

Themes are driven by CSS custom properties attached to the `<html>` root element. When `data-theme="dark"` or `data-theme="light"` is set, variable definitions instantly cascade across all elements:

```css
:root {
  --blue: #1a2e89;
  --deep: #142369;
  --lime: #dff058;
  --paper: #f4f4ec;
  --ink: #111424;
}

[data-theme="dark"] {
  --paper: #0b1126;
  --ink: #f2f4fc;
  --blue: #233aa8;
}
```

The active theme is controlled by `assets/theme.js`, which detects system color preferences via `window.matchMedia("(prefers-color-scheme: dark)")` and persists user choices in `localStorage`.

---

## 3. Neural Network Classifier (`assets/neural-network.js`)

### Architecture

The hero section features a genuine, trained neural network running real-time inference on an 8x8 handwritten digit grid ($64$ inputs):

- **Input Layer:** 64 inputs (normalized pixel intensities from $0.0$ to $1.0$).
- **Hidden Layer 1:** 16 neurons with GELU activation.
- **Hidden Layer 2:** 12 neurons with GELU activation.
- **Output Layer:** 10 neurons producing classification logits for digits $0$ through $9$.

```
[64 Inputs (8x8)]
       │
       ▼  (Weights: 64x16, Biases: 16)
[Hidden Layer 1 (16 GELU Units)]
       │
       ▼  (Weights: 16x12, Biases: 12)
[Hidden Layer 2 (12 GELU Units)]
       │
       ▼  (Weights: 12x10, Biases: 10)
[10 Output Logits] ──▶ Softmax ──▶ Predicted Class (0-9)
```

### Forward Pass & GELU Activation

The Gaussian Error Linear Unit (GELU) provides smooth nonlinear gating:

$$\text{GELU}(x) \approx 0.5x \cdot \left(1 + \tanh\left(\sqrt{\frac{2}{\pi}} \left(x + 0.044715 x^3\right)\right)\right)$$

In JavaScript (`assets/neural-network.js`):

```javascript
export function gelu(x) {
  if (Math.abs(x) > 10) return x > 0 ? x : 0;
  return (
    0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x ** 3)))
  );
}
```

### Numerically Stable Softmax

To prevent floating-point overflow during exponentiation, the maximum logit is subtracted before computing `Math.exp()`:

```javascript
const maximum = Math.max(...logits);
const exps = logits.map((value) => Math.exp(value - maximum));
const total = exps.reduce((sum, value) => sum + value, 0);
const probabilities = exps.map((value) => value / total);
```

### Exact Gradient Computation

The module computes analytical backpropagation gradients against the cross-entropy loss, enabling live gradient inspection for all 1,336 weights and 38 biases.

---

## 4. Welcome Sequence & Cipher Reel

### Eliminating First-Paint Flash

To prevent plain text from flashing before custom webfonts load, the site uses a zero-flash sequence:

1. `index.html` renders `#welcome-paint`, a high-contrast neutral cover matching the initial background.
2. `assets/welcome-start.js` runs synchronously in `<head>` to inspect motion preferences and session state. If eligible, it claims pending state before the first frame paints.
3. `assets/bitbench.js` mounts the split-flap reel into the veil, retaining `#welcome-paint` until DOM elements are fully constructed.
4. When the veil is attached, `#welcome-paint` is removed in the exact same synchronous DOM operation, preventing plain-text flashes before the animated reel mounts.

### Mechanical Split-Flap Reel Physics

The Cipher Reel (`assets/welcome-reel.js`) simulates mechanical airport departure boards:

- Each letter spins independently on an individual cadence.
- Flip intervals decelerate monotonically from rapid flutters (~40ms) to pronounced mechanical clacks (~180ms).
- Every letter executes an even number of half-turns ($k \times 180^\circ$) so the front face always halts squarely at $0^\circ$.
- Latching physics uses a fourth-order ease-out combined with a decaying sine overshoot:

```javascript
export function latchProgress(progress) {
  const t = clamp(progress);
  const quart = 1 - Math.pow(1 - t, 4);
  const overshoot = Math.sin(t * Math.PI) * (1 - t) * 0.008;
  return t >= 1 ? 1 : quart + overshoot;
}
```

---

## 5. Embedded Lab (`assets/embedded.js`)

The Embedded Lab simulates hardware instruments and electrical circuits entirely inside the browser:

### Circuit Calculation

Calculates Ohm's law and Joule's law using standard double-precision arithmetic:
$$I = \frac{V}{R}, \quad P = V \cdot I = I^2 R = \frac{V^2}{R}$$

### PWM Waveform Generation

Pulse Width Modulation (PWM) computes exact high and low intervals:
$$\text{period} = \frac{1}{\text{frequency}}, \quad \text{onTime} = \text{period} \times \frac{\text{duty}}{100}$$

Edge cases at 0% and 100% duty cycles are protected against vertical spike artifacts, producing flat continuous DC voltage rails:

```javascript
function pwmWaveformPath(period, onTime, timeToX) {
  const endX = timeToX(PWM_WINDOW_SECONDS);
  if (onTime <= 0) return `M32 152H${endX}`;
  if (onTime >= period) return `M32 48H${endX}`;
  // Iteratively construct alternating high and low rectangular pulses...
}
```

### Communication Protocols

- **UART (8N1):** Idle HIGH (1), Start bit (0), 8 data bits LSB-first, Stop bit (1).
- **I2C:** Start condition (SDA falls while SCL is HIGH), 8 bits MSB-first, ACK bit (0), Stop condition.
- **SPI Mode 0:** Clock idle LOW (CPOL=0), sampled on rising edge (CPHA=0).
- **CAN Differential:** Models typical ISO 11898-2 differential signaling waveforms.

---

## 6. 3D Projection Sculpture (`assets/projection-*.js`)

### Software Rasterizer

The helicoid projection sculpture runs a software 3D renderer written from scratch without WebGL or Three.js dependencies:

1. **Camera Equations:** Coordinates are transformed via 3D rotation matrices:
   $$R = R_{\text{roll}} \times R_{\text{tilt}} \times R_{\text{yaw}}$$
2. **Depth Buffer:** A `Float32Array` depth buffer records camera Z coordinates per pixel, ensuring nearer triangle facets cleanly occlude background geometry.
3. **Barycentric Interpolation:** Constant-radius contours are interpolated across winning triangle pixels to draw smooth geometric contour lines.
4. **Frame Rate & Drag Coalescing:** The software rasterizer targets approximately 30 rendered FPS (`now - painted >= 1000 / 30`) to balance smooth motion with low CPU utilization. Pointer drag updates are coalesced via `requestAnimationFrame` and immediately flushed on pointer release (`pointerup`/`pointercancel`), preventing dropped frames while ensuring exact final drag coordinates.

---

## 7. Surface Physics (`assets/surface-physics.js`)

Card hover tilt effects use a physically accurate damped harmonic oscillator:

$$m \frac{d^2 x}{dt^2} + c \frac{dx}{dt} + k (x - x_{\text{target}}) = 0$$

- **Stiffness ($k$):** $160$
- **Damping ($c$):** $24$
- **Mass ($m$):** $1.0$ (unit mass)
- **Damping Ratio ($\zeta$):** $\frac{c}{2\sqrt{km}} = \frac{24}{2\sqrt{160}} \approx 0.949$

A damping ratio of $0.949$ delivers responsive physical tracking with minimal overshoot, settling smoothly when the pointer departs.

---

## 8. State Management & Synchronization

State is managed through declarative browser APIs and synchronized across tabs:

- **Theme Sync:** Cross-tab theme changes broadcast via `window.addEventListener("storage")`.
- **Motion Preferences:** Evaluated centrally in `reduce()`, respecting `localStorage["portfolio-reduced-motion"]`, `data-motion` attributes, `prefers-reduced-motion` media queries, and `navigator.connection.saveData`.
- **Page Transitions:** View transitions gracefully degrade to instant swaps when reduced motion is requested.

---

## 9. Testing Strategy

The repository maintains an automated multi-layer test suite:

- **Mathematical Unit Tests (`scripts/check_*.mjs`):** Run via `node --test` with zero external test runner dependencies. Tests numerical precision, gradient accuracy, and physical laws.
- **Site Sanity & Budgets (`scripts/check_site.py`):** Enforces canonical UTF-8/LF source code byte limits, link integrity, and social metadata.
- **Playwright End-to-End Suite (`tests/*.spec.mjs`):** Tests responsive reflows across 13 viewport widths (320px to 2560px), keyboard navigation, WCAG AA contrast (via axe-core), and cross-browser parity across Chromium and Firefox in CI.

---

## 10. Development & Contribution Guide

### Local Development

```bash
# Recommended local development server (http://127.0.0.1:4174)
npm start
```

### Running Tests

```bash
# Run linting (Prettier, HTML-Validate, Syntax check)
npm run lint

# Run unit tests and site size checks
npm test

# Run Playwright browser tests
npm run test:browser
```

### Code Size Budgets

Every critical module enforces a strict byte budget in `scripts/check_site.py` to prevent bloat. When adding features or refactoring, always verify budgets with `npm test` before committing.
