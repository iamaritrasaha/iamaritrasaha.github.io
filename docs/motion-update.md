# Mathematical welcome and automatic RPM preview

This update preserves the published portfolio's cobalt/citron design, fonts, hero, classifier calculations, project destinations, and Pages configuration.

## Welcome

`assets/bitbench.js` retains the same 64-pixel identity and grid-to-classifier handoff. The surrounding manuscript lives in `assets/welcome-math.js` and `.css`: circuit traces draw once; Ohm's law leads through P = VI, P = (IR)I, and P = I²R; Kirchhoff's current balance sits opposite the logit, softmax, cross-entropy, and output-gradient relationships. Fractions, subscripts, and superscripts use HTML with the existing Literata and JetBrains Mono fonts. These are illustrative identities, not a training process.

A first visit lasts about 5.6 seconds; repeat visits in the same tab last about 4.6 seconds so the mathematical composition remains readable. Anchored navigation bypasses the intro. The visible skip button is removed. Escape and Tab still dismiss it, with focus continuing into the actual classifier. Mathematical decorations are hidden from assistive technology. Reduced motion, data saving, and the saved motion preference bypass the intro; hiding the tab dismisses it. Storage is optional. A late layout measurement keeps the final grid aligned after fonts and the hero settle.

Desktop shows four deliberately placed equation groups. Mobile retains the power derivation and logit/probability pair; short viewports simplify further. The name remains central. The three-part INTRO EPOCH line is restored as a presentation sequence, with no loading percentages or claims of model training. A second manuscript leaf introduces the fundamental theorem of calculus, a local Taylor expansion, graph curvature with a tangent drawing, and hand-drawn ESP32 pins, wiring, resistor, and LED doodles. Mobile uses a small peripheral board drawing and fewer simultaneous equations.

## PulseShift

`assets/pulse-rpm.js` samples a deterministic 12-second curve by elapsed active time. RPM rises smoothly from 1,200 to 7,600 over five seconds, briefly holds, decelerates over 5.3 seconds, and rests before repeating. The six illustrative LED thresholds are 2,000, 3,000, 4,000, 5,000, 6,000, and 7,000 RPM. The approaching-shift state begins at 6,000; the shift indication begins at 7,300. These values are browser simulation settings, not verified motorcycle thresholds or firmware behavior.

`index.html` replaces the range input with a large RPM readout, the required simulation label, and static explanatory text. `assets/pulse-rpm.css` provides LED packaging, glow, and distinct normal, approach, and shift states. There is no flashing strobe or manual adjustment. The existing firmware qualification disclosures remain unchanged.

`script.js` connects the preview to the existing viewport, visibility, and motion system. No frame is scheduled while offscreen or hidden. Resuming retains the previous active time. DOM rendering follows visible display frames and unchanged readouts are not rewritten. This removes the previous 20–30 Hz throttle jitter. LED emitter opacity follows a smooth 600-RPM shoulder before each threshold; a separate pink emitter layer blends into the shift indication, avoiding abrupt gradient replacement. Fully lit LED counts and the number still come from the same RPM sample. Reduced motion and data saving show 4,250 RPM and three lit LEDs. The same meaningful state exists in source HTML without JavaScript. Dynamic readings are hidden from screen readers in favor of a static explanation, so RPM changes do not cause announcements.

## Documentation and verification

The personal README replaces the old technical introduction; its useful setup, maintenance, structure, provenance, and deployment information is preserved in [development.md](development.md). Obsolete slider and epoch styles are removed from the existing stylesheets. HTML asset versions are updated in the homepage and 404 page.

`tests/motion.spec.mjs` checks mathematical notation, staged derivation, exact grid handoff, mobile composition, keyboard dismissal, RPM/LED agreement, a complete acceleration/deceleration cycle, viewport/tab suspension, smooth resumption, reduced motion, and data saving. Existing browser tests retain their classifier, navigation, theme, accessibility, project, and fallback assertions; only assertions for the removed slider/button are replaced with the requested behavior. `scripts/check_rpm.mjs` verifies bounds, smoothness, periodicity, thresholds, and refresh-rate independence. Existing byte budgets remain, with additional limits for the new scoped motion assets.

Validation uses Chromium emulation at five widths and both themes. It is not physical-device or motorcycle validation. Before/after desktop/mobile screenshots, startup recordings, a complete PulseShift cycle recording, and measured DOM-update counts accompany the task's completion report.

## First-paint ordering

`assets/welcome-start.js` runs synchronously in the homepage head, before content can paint. A small, aria-hidden branded cover is present in the source HTML, with critical display styling in the head. It covers the first frame while the existing model and welcome modules load. The controller appends the existing welcome dialog before removing that cover in the same JavaScript task, preserving the pixel-grid handoff and all equation choreography. The page keeps its layout behind the cover so geometry measurements remain accurate.

Reduced motion, data saving, saved motion preferences, and ordinary fragment navigation bypass the cover. Escape, Tab, a motion-preference change, a hidden tab, or navigation away can cancel a pending welcome. If modules fail or take more than four seconds, the cover is released and a late intro is suppressed. If the early script itself is blocked, the hidden source cover stays hidden and the normal classifier can still initialize. Without JavaScript, the source page remains readable. A timed-out intro is not recorded as a completed welcome in session storage.

`tests/welcome-paint.spec.mjs` reproduces delayed and stalled model loading, samples the actual element in front of the homepage before the welcome, and checks finite fallback, pending keyboard cancellation, motion changes, and failed scripts. Existing animation, mathematics, RPM, navigation, theme, and no-JavaScript tests remain in place.
