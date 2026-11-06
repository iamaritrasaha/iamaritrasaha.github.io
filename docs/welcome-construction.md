# Sequential binary welcome

Baseline: `da1e6b4e141b4c860e8e7f288b0ce3bfcdf5c54f` (latest `main` when work began).
Branch: `codex/sequential-glyph-welcome`.

The homepage now assembles each letter of **Aritra Saha** from moving binary symbols. An offscreen Canvas renders the complete, kerned Literata string using the computed font and a measured DOM baseline. Alpha sampling produces bounded stroke targets, snapped onto actual ink pixels. DOM ranges preserve each character's real position and the natural word space.

Each letter accumulates bits from bottom to top, holds its binary silhouette, then contracts the symbols into expanding mask openings at those same positions. The SVG mask reveals the original native text. The text is never replaced, translated, scaled, or given artificial character widths. Completed letters stay visible. Only `identity-resolve` controls the title's existing exit; the obsolete ASCII-string animations are removed.

The construction takes 3,210 ms after font preparation: an 80 ms opening, 440 ms for A, 290 ms for each remaining letter, and an 80 ms word-space pause. Font preparation is capped at 350 ms. The existing 5,600/4,600 ms welcome timelines, mathematical manuscript and pixel-grid handoff are unchanged.

One decorative Canvas and at most 180 mask circles exist at a time. Glyph targets are prepared once; frames perform no layout reads. Completion and dismissal cancel the frame, clear the font timeout, disconnect the resize observer, remove the resize listener and delete both temporary surfaces. Resize falls back to responsive native text. Font failure/timeout selects a stable readable fallback for the remainder of the welcome. Canvas/readback failure also reveals the native title. One stable accessible text node remains throughout.

## Visual evidence

Normal-speed Playwright recordings, with no clock manipulation:

- [Desktop, first visit](welcome-construction/desktop-first.webm)
- [Desktop, returning visit](welcome-construction/desktop-returning.webm)
- [Mobile, first visit](welcome-construction/mobile-first.webm)
- [Mobile, returning visit](welcome-construction/mobile-returning.webm)

[Frames decoded from the real-time desktop video](welcome-construction/video-frames.png) show accumulating A strokes, its binary silhouette, subsequent letters, the word space, S and the final title. The video includes navigation/loading time before construction starts.

Controlled intermediate browser captures supplement those recordings:

- [Desktop construction and handoff](welcome-construction/desktop-sequence.png)
- [Mobile construction and handoff](welcome-construction/mobile-sequence.png)

The detail crops enlarge the bits for inspection. Full-frame handoff images retain the surrounding manuscript and classifier. [Recorded geometry](welcome-construction/recording.json) is identical before/after construction on all four runs: desktop 685.984 × 129.594 CSS px and mobile 229.813 × 42.906 CSS px, with unchanged x/y coordinates. No page errors occurred in those recordings.

Reproduce with `npm start`, then `node scripts/record-welcome.mjs`. Optional arguments select the URL and output directory; `PLAYWRIGHT_CHANNEL=chromium` selects bundled Chromium instead of the local Windows Edge channel.

## Verification

The new browser tests replace the two obsolete ASCII-decode assertions with stronger desktop/mobile checks of actual Canvas output, all ten letters, sampled ink, exclusive sequencing, native dimensions, accessibility and cleanup. Additional cases cover Escape, Tab, visibility, manual/system motion changes, data saving, navigation, resize, late/failed fonts, Canvas/readback failure and missing animation capability. Existing manuscript, handoff, responsive, no-JavaScript and three-page regression coverage remains intact.

Local `npm ci`, `npm run lint`, `npm test` (27 tests) and `npm run build` pass. The full Windows Chromium run passes 153/154 browser tests, including all 19 construction cases. The remaining existing live-media-preference test also fails when the three welcome assets are served from the unchanged baseline SHA; the media-query change is not delivered in that local scenario. Its assertions and timeout remain unchanged.

Local Firefox can construct the welcome at desktop and mobile sizes and passes the 16 lifecycle/fallback tests that do not resize its window. The full Windows Firefox run encountered `page.setViewportSize` timeouts before navigation in existing Explorations tests. The unchanged Linux Firefox CI suite is the full cross-browser release gate.

## API references

- [Canvas fillText](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillText) and [getImageData](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData) provide the raster glyph silhouette and alpha samples.
- [FontFaceSet.load](https://developer.mozilla.org/en-US/docs/Web/API/FontFaceSet/load) loads the specific font used for the name, bounded here by an independent timeout.
- [TextMetrics](https://developer.mozilla.org/en-US/docs/Web/API/TextMetrics) describes Canvas metrics; DOM ranges and a baseline probe are used here to retain the final HTML text's exact layout instead of assuming fixed advances.
