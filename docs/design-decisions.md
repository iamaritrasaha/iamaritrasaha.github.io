# Design and engineering decisions

## Direction: an engineer's fieldnotes

The portfolio presents a personal body of work through editorial typography, a calculated neural-network visualization and varied project spreads. A ruled cobalt masthead, pale paper, blue ink and citron details establish the current visual language. Content sits in the page grid rather than repeated floating cards. There is no full-page ambient animation or glass layer.

The first screen introduces Aritra through a personal nameplate, a clear professional direction and an editable 8×8 digit workbench with real predictions, hidden-layer activations and a pixel relief. The detailed neural study remains in the notebook; its forward pass, loss and backward pass connect the animation to mathematics. SeeDL, Infera and PulseShift lead the public work. Orion retains its private research spread; SysAI changes the rhythm with a deep-green diagnostic composition, and Relay/Vyren preserve their offset artwork. Smaller work lives in a compact ruled index. Practice, personal context and contact complete the page without repeating the project layout.

## Small design system

- **Typography:** Literata for editorial display and reading, JetBrains Mono for navigation, technical labels and metadata. A variable Latin Literata WOFF2 supports automatic optical sizing and weights 400 to 600. The regular Mono subset is retained. Both licenses and source notes live in `assets/fonts/`.
- **Color:** final shared tokens in `assets/bitbench.css` use paper `#f4f4ec`, surface `#fffef4`, ink `#192352`, accent `#243ca4`, cobalt `#20369b` and citron `#e4f489`. Dark mode uses paper `#131c41`, surface `#1d2852`, ink `#f8f8e9`, cobalt `#1a2e89` and citron as the accent. Earlier token definitions are overridden by this stylesheet. Color identifies emphasis without carrying meaning alone.
- **Grid and spacing:** a capped 1440px composition with responsive gutters. Text columns, side notes and offset artwork provide asymmetry. Thin rules establish section boundaries. Project layouts change at tablet and phone sizes rather than preserving a squeezed desktop grid.
- **Surfaces:** mostly open page content, with contained illustrations and one deliberately contrasting SysAI section. Fine borders provide structure; blur and floating glass surfaces are absent.
- **Details:** consistent arrow links, visible focus rings, custom selection colors, reserved illustration dimensions and native disclosure controls. The wordmark is typographic.

## Motion and progressive enhancement

`script.js` owns visibility and motion preference. IntersectionObserver adds `.scene-active` only to visible artwork; hidden documents pause it. Entrances play once with a small sibling stagger. Content is visible without JavaScript, and reveals do not create a permanent hidden state. Scrolling remains native.

`assets/neuron-demo.js` presents a trained 64 → 16 → 12 → 10 digit classifier. The input is an actual normalized 8×8 handwritten digit from a held-out split. All 1,336 weights participate in the browser's forward and backward passes; the diagram draws the strongest two weights per receiving unit to stay legible. This selection is labelled, and opacity reflects the calculated signal rather than random firing. The user can select a first-layer neuron directly, switch images and examine an actual misclassification. The first layer uses two columns of eight units with non-overlapping 26 px native button targets. A single Tab stop and arrow-key navigation provide keyboard access without adding sixteen stops; the equation and selected ring stay in sync. Responsive SVG coordinates preserve circle shape and target alignment at phone widths.

`assets/neural-network.js` separates deterministic arithmetic from presentation. It computes GELU activations, stable softmax, cross-entropy and analytic gradients using the trained parameters from `assets/digit-model.js`. Parameters do not change while browsing. The model was trained offline using Adam; a displayed gradient is not a live training update. Reproducible training, the local held-out split, the independent fixtures and data attribution are documented in [digit-model.md](digit-model.md). This is a model built for the portfolio study, not an Orion benchmark or a past production claim. Manual controls remain available with motion reduced. GELU uses the tanh approximation documented by [PyTorch](https://docs.pytorch.org/docs/2.14/generated/torch.nn.GELU.html), with its matching analytic derivative.

`assets/research-plate.js` builds 93 SVG paths once inside Orion's engineering notebook. Two native buttons switch between base geometry and a separable update, ΔW(u,v) = a(u)b(v). Opacity and a small translation join the states. A slow group transform and a single moving contour create restrained ongoing motion. It has no Canvas, filters or JavaScript frame loop. The caption explicitly identifies the surface as an illustration rather than experimental data.

Bounded spring response applies only to Relay and Vyren artwork on fine pointers. Its time-based integration stops at rest. Native `details` receive a cancellable 340ms Web Animations transition; reduced motion uses their immediate native behavior. The finite height transition is a deliberate layout cost, not a continuously running effect. SVG dash motion likewise paints a small set of strokes rather than pretending every animation is compositor-only.

The synchronized hero-caption and footer controls save a local motion preference. OS reduced motion and data saving take precedence, and `?motion=reduce` provides a testable override. CSS disables continuous motion and transitions under reduced motion. Implementation guidance: [animation rendering costs](https://web.dev/articles/animations-guide) and [reduced-motion preferences](https://web.dev/articles/prefers-reduced-motion).

## Architecture and preserved functionality

The static HTML/CSS/ES-module stack remains sufficient. There are no production dependencies, remote model calls, analytics, server routes or request endpoints. The small classifier runs locally with native JavaScript. The homepage, Embedded Systems Lab and 404 share a synchronous theme controller that applies System, Light or Dark before the styles render. System follows live OS changes; explicit choices persist locally. Theme-color follows the effective appearance.

Native anchors, email/GitHub links, mobile navigation and project disclosures remain usable. Hash links can open a containing disclosure. Font files and project assets are local. The optional build copies static assets into `dist/`; it does not deploy them. Run the lint, tests and build commands in the [development notes](development.md), then record browser evidence and remaining limitations in `validation.md`.

### Page-specific modules and CSS order

`assets/navigation.js` initializes the shared menu before the application modules load. `script.js` controls the homepage scenes and notebook enhancements. `assets/creative.js` separately mounts helicoid rotation, SeeDL isolation and the illustrative regression controls. `assets/bitbench.js` manages the editable hero, using the same fixed model as the notebook, and coordinates the welcome cover prepared by `welcome-start.js` and populated by `welcome-math.js`. The relief only projects input intensities; it never trains or edits the model on idle.

The Embedded Systems Lab has its own `assets/embedded.js` controller for circuit controls, PWM, protocol panels, resize handling and visibility-gated scans. Pure calculations live in `assets/electronics-math.js`. PWM time is measured in seconds over a 2 ms window, while its visual scan takes four seconds. The 100 ms frame-delta cap and retained phase prevent jumps when animation resumes. Input and resize updates still place the marker correctly when paused.

Styles are layered in source order: `styles.css`, page component styles, `editorial.css`, `creative.css`, then `bitbench.css` for the current shared colors/composition. The homepage adds welcome and RPM styles; the lab adds `embedded.css`. The older layers still contain active layout, accessibility and responsive rules. Consolidating them is outside maintenance scope because the cascade is part of the approved presentation.

The welcome is a finite mathematical manuscript followed by the grid handoff, not an ambient backdrop. First/return durations, key dismissal, loading timeout, direct-fragment bypass and reduced-motion/data-saving behavior remain explicit in the welcome modules. The [module map and test coverage](development.md) are the starting point for development.

## Content provenance and ownership

The inherited static project, content and assets were inspected before replacement. Existing project documentation supplies the claims:

- **Orion:** README and current-state research notes; the model-adaptation finding remains a limited small-model result. No final base model or public source is claimed.
- **SysAI:** engine documentation distinguishes diagnostic evidence and explanations from executing model output. Experience records add context rather than retraining the model.
- **Relay:** documented Rust/Flutter boundaries and compatible continuity/transfer protocols. Its LocalSend origin and upstream notices remain explicit.
- **Vyren:** telemetry, attribution uncertainty and narrow privilege boundaries. It remains a private developer preview, with enquiries through email.
- **Aether:** Kotlin/Compose/TDLib work and closed testing, with runtime validation still acknowledged. It stays in the compact index.
- **Other work:** existing summaries, links and truthful development states. Foresight Labs context is retained, while Veyra remains independently created and owned by Aritra.

Project descriptions preserve their documented development state and distinguish experiments from production results.

## Mathematical copy refinement

The accepted palette, type system, navigation and project compositions stay in place. Copy uses direct first-person statements about the work and current learning, with a few brief mathematical or engineering asides. Project facts and development states remain unchanged.

Equations appear where they explain the engineering: the [standard LoRA update](https://arxiv.org/abs/2106.09685) beside Orion, a payload/link-capacity lower bound in Relay's notes, and an observed-byte accounting identity beside Vyren. The transfer bound is not a measured throughput claim; the accounting identity distinguishes attributed and unknown bytes from the same observation scope. No Bayesian engine or other undocumented project mechanism is implied.

## Neural notation and diagram refinement

The neural study renders formulas and worked values with native MathML in `assets/neuron-math.js`. Fractions, roots, summation limits, indexed variables, transposes and scientific notation use mathematical elements rather than Unicode approximations or HTML superscripts. Long identities are split into deliberate rows, including a named intermediate for GELU. The numerical engine, model weights and interaction contract are unchanged. [MathML fraction markup](https://developer.mozilla.org/en-US/docs/Web/MathML/Reference/Element/mfrac) documents the native rendering used here.

Subtle layer guides group the sixteen first-layer units without implying an extra computational layer. Selected connections include both the incoming displayed weights and outgoing displayed weights. The existing native neuron buttons, keyboard behavior, motion preferences and connection-selection disclosure remain intact. All styling is scoped to the neural study.

## Historical note: October 2026 readability and navigation refinement

The existing visual identity and working illustrations remain the foundation. Main reading text now uses 16px across stories, disclosures, the project index and personal context. The hero keeps its editorial title but gives the supporting copy a full mobile column, a clear work action and the real GitHub link. Tablet composition stacks the hero, SysAI diagnostic section and Relay/Vyren projects. Four direct project links reduce the effort of exploring the long featured section.

Ordinary navigation/action controls have at least 44px height. Fragment navigation moves keyboard focus to the destination while preserving native history and scrolling; the sticky masthead has explicit scroll clearance. The email-copy enhancement announces success or failure and retains the original email link. Archive hover no longer moves text columns. Native reduced-motion behavior covers the added control feedback.

Development remains dependency-free at runtime. A small Node preview server handles actual 404 routes and public-file boundaries; an interpreter resolver keeps the existing Python integrity/build scripts portable on Windows. Browser and accessibility checks remain development-only dependencies. The formatter accepts platform-native line endings to avoid reformatting unrelated files on Windows.
