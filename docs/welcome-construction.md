# Binary calligraphy welcome

Baseline: `da1e6b4e141b4c860e8e7f288b0ce3bfcdf5c54f` (latest main when work began). Revised on `codex/sequential-glyph-welcome`, PR #16.

The complete, kerned **Aritra Saha** string reserves the original Literata layout. After a bounded font load, Canvas rasterizes that same string at its measured DOM baseline. Alpha sampling partitions its actual ink into bounded fragments; every nonzero pixel, including antialiased serifs, belongs to exactly one fragment. Each binary destination is snapped onto ink. DOM ranges preserve proportional advances, kerning and the word space.

Letter-specific pen guides order those measured fragments: A's left diagonal, right diagonal, crossbar, then terminal details; bowls and shoulders follow their curves. Cubic trajectories turn into the local stroke direction. A quiet field of three waiting bits per future letter establishes the composition. Only one letter constructs at a time. The bits gather into a recognizable silhouette, then contract while their own raster fragments expand from those same positions and join into continuous ink. There is no SVG mask, clipping reveal, horizontal wipe or opacity crossfade. Completed ink is cached on an offscreen canvas.

The visible canvas and native title share the same geometry. After a 240 ms hold on the assembled wordmark, the temporary canvas is removed and the reserved native text resumes rendering. Browser screenshots verify unchanged bounds; Canvas/DOM edge antialiasing differs slightly (mean maximum-channel difference below 3/255 in the 390/1440px comparison), without a visible position or size change. Only the existing `identity-resolve` animation controls the title's exit.

Timing after font preparation: 180 ms anticipation, 420 ms for A, 260 ms for each remaining letter, 70 ms word separation, 240 ms final hold: **3,250 ms** total. Font preparation is capped at 300 ms. The original **5,600/4,600 ms** welcome, manuscript, epoch and pixel-grid handoff timelines are unchanged.

One decorative canvas exists in the DOM, with at most 180 active bits plus the small waiting field. Targets and raster fragments are prepared once, with no frame-by-frame layout reads. Completion or cancellation cancels frames, clears the timeout, disconnects the observer and listener, and removes temporary nodes. Resize shows responsive native text. Failed/slow fonts use a stable serif fallback; Canvas/readback failures reveal readable text. Below a 40px title size, the normal wordmark is the compact fallback. One stable accessible name remains throughout.

## Visual review and iteration

The first PR experiment used a bottom-up sampling order and SVG openings. It was rejected; its recordings are retained for comparison: [before desktop](welcome-construction/before-desktop.webm), [before mobile](welcome-construction/before-mobile.webm).

The second version replaced that mechanism with pen-guided trajectories and physical ink fragments. Inspection found clipped anticipation bits and serif terminals arriving too early. The final revision adds drawing overscan and schedules those terminal details after the structural strokes. The reviewed frames show a partial diagonal A, a complete binary A, a resolved A before r, the word-space pause, curved S construction, completed name and unchanged classifier handoff.

Normal-speed Playwright recordings, without clock manipulation:

- [Desktop 1440px, first visit](welcome-construction/desktop-first.webm) and [returning visit](welcome-construction/desktop-returning.webm)
- [Mobile 390px, first visit](welcome-construction/mobile-first.webm) and [returning visit](welcome-construction/mobile-returning.webm)
- [Frames decoded from the actual desktop recording](welcome-construction/video-frames.png)
- Controlled intermediate captures: [desktop](welcome-construction/desktop-sequence.png), [mobile](welcome-construction/mobile-sequence.png)

The crops enlarge the bits for inspection. [Recorded geometry](welcome-construction/recording.json) is identical before/after on all four runs: desktop 685.984 × 129.594 CSS px; mobile 229.813 × 42.906 CSS px, with unchanged x/y coordinates and no page errors. Reproduce with `npm start`, then `node scripts/record-welcome.mjs [URL] [output-directory]`.

## Verification

Deterministic browser tests inspect actual binary draw positions against raster alpha for all ten letters, exclusive sequencing, fragment growth, native dimensions, accessibility and cleanup. Unit tests verify stroke ordering, curved endpoints and lossless raster coverage. Lifecycle cases cover Escape, Tab, hidden tabs, live/manual motion, data saving, navigation, resize, late/failed fonts, Canvas/readback failure and missing animation support. Existing manuscript, classifier, responsive, no-JavaScript and three-page coverage remains intact.

Local lint, static integrity, 30 unit tests and build pass. The full Windows browser suite and Linux Chromium/Firefox CI are run for the final revision. The pre-existing Windows live-media-query test failure was independently reproduced against baseline welcome assets; its assertions are unchanged. Local Firefox has a window-resize timeout in the existing suite; initial-viewport visual checks and the no-resize lifecycle cases supplement full Linux Firefox CI.

## Sources and implementation choice

- [FreeType outline conventions](https://freetype.org/freetype2/docs/glyphs/glyphs-6.html) and [OpenType glyph contours](https://learn.microsoft.com/en-us/typography/opentype/spec/glyf) distinguish true outlines from rectangular text bounds. This implementation samples the browser's rasterized font, preserving its hinting and antialiasing without a font parser or dependency.
- [HTML Canvas text preparation](https://html.spec.whatwg.org/multipage/canvas.html#text-preparation-algorithm), [fillText](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillText), [getImageData](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData) and [FontFaceSet.load](https://developer.mozilla.org/en-US/docs/Web/API/FontFaceSet/load) inform font loading, measurement and raster sampling.
- [CMU kinetic typography work](https://www.cs.cmu.edu/~johnny/kt/) informs explicit per-letter temporal choreography; no external animation engine is used.
