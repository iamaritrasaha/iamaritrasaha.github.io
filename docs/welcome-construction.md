# Cipher Reel welcome

Baseline: `feat/cipher-reel-welcome`.

The complete, kerned **Aritra Saha** string reserves the original Literata layout. After a bounded font load, DOM Text Ranges measure each character's exact subpixel bounds and advance width. A lightweight, transform-only 3D axial decoder overlay (`.name-reel`) is mounted over those positions. Each letter flips independently around its local horizontal axis, cycling through a restrained alphabet of programming-inspired symbols before decelerating smoothly into the authoritative Literata letterform.

## Choreography and mechanical cadence

The animation unfolds across five choreographed phases:

1. **Phase A: Restrained field initialization (0–240 ms):** An aligned, stable field of code symbols (`0 1 A F 7 X # / { }`) occupies the exact character positions of the wordmark.
2. **Phase B: Independent axial rotation (240 ms+):** Each character begins rotating around its horizontal axis (`rotateX`) with realistic perspective (`perspective: 720px`). Dynamic lighting attenuates face opacity as facets turn edge-on to the camera.
3. **Phase C: Sequential decoding and deceleration (1,250–3,100 ms):** Letters settle progressively from left to right. Flip intervals steadily stretch from ~40–65 ms flutters up to ~150–180 ms clacks.
   - **Aritra:** Settles progressively: A (1,250 ms), r (1,430 ms), i (1,610 ms), t (1,790 ms), r (1,970 ms), a (2,150 ms).
   - **Inter-word pause (2,150–2,470 ms):** A natural 320 ms pause holds "Aritra" stationary while "Saha" continues its clacking cadence.
   - **Saha:** Settles progressively: S (2,470 ms), a (2,680 ms), h (2,890 ms), a (3,100 ms).
4. **Phase D: Typographic resolution and baseline lock:** The final flip of each card decelerates through a smooth quartic curve (`easeOutQuart`) with a subtle mechanical settle, landing with the front face flat at exactly `rotateX(0deg)`. The typographic baseline of the intermediate JetBrains Mono glyphs is synchronized dynamically with Literata's measured baseline (`--reel-baseline-offset`), eliminating baseline jumps and vertical misalignments. The rotation axis (`transform-origin: 50% 56% 0`) matches the true optical midline of the glyphs.
5. **Phase E: Completion and handoff (3,100–3,500 ms):** The completed name is held clearly until 3,500 ms. At completion, the overlay is removed and the native `.name-visual` resumes rendering with 0.0000px layout shift. The existing mathematical welcome manuscript and 8×8 pixel-grid handoff continue uninterrupted through the 4,600/5,600 ms lifecycle.

## Accessible representation

Screen readers receive only the stable, accessible `<span class="sr-only">Aritra Saha</span>`. All decorative cards and overlays are marked `aria-hidden="true"`. Reduced-motion preferences, data-saving mode, manual pause, and tab/escape dismissals instantly reveal or bypass the welcome screen without animated transitions or focus hijacking.

## Visual review and recordings

Normal-speed Playwright recordings, without clock manipulation:

- [Desktop 1440px, first visit](welcome-construction/desktop-first.webm) and [returning visit](welcome-construction/desktop-returning.webm)
- [Mobile 390px, first visit](welcome-construction/mobile-first.webm) and [returning visit](welcome-construction/mobile-returning.webm)
- [Frames decoded from the actual desktop recording](welcome-construction/video-frames.png)
- Controlled intermediate captures: [desktop](welcome-construction/desktop-sequence.png), [mobile](welcome-construction/mobile-sequence.png)

[Recorded geometry](welcome-construction/recording.json) confirms 0.000px deviation before, during, and after the animation on all runs: desktop 685.984 × 129.594 CSS px; mobile 229.813 × 42.906 CSS px, with unchanged x/y coordinates and zero page errors.
