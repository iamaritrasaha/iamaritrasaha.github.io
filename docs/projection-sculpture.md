# Change one angle

The previous helicoid put every isoparametric curve into a single SVG path. There was no surface or depth buffer: hidden lines remained visible and all intersections received the same emphasis. Correct coordinates alone did not explain the shape.

This change is confined to the homepage's Projection Study. The checkpoint is `934a4935823a5c57462ffdfd871c299510901da1`, published by [Pages run 42275053597](https://github.com/iamaritrasaha/iamaritrasaha.github.io/actions/runs/42275053597). The welcome, binary calligraphy, classifier, project presentations, other pages, shared navigation and Pages configuration are preserved.

## Rendering choice

The drawing uses native Canvas 2D and a small software depth buffer. A 32-by-128 parameter grid produces 8,192 triangles. Each pixel retains the largest camera depth. Smooth interpolated lighting uses the analytic surface normal, and different citron/blue materials distinguish the two oriented sides. Three subtle constant-radius contours are shaded inside the winning triangle; they cannot show through another sheet. No transparency sorting, wireframe overdraw, WebGL context or runtime library is required.

SVG painter ordering was considered, but sorting whole faces by their mean depth would not establish correct visibility at overlapping folds. WebGL would provide hardware depth testing, but this bounded study can use a compact Canvas implementation with the same visibility rule and work without GPU support. The raster is capped at 960 pixels wide, repainted at most 30 times per second, and stops entirely offscreen, in hidden tabs or when motion preferences disable it. The implementation favors clarity over building a general 3D engine.

The screenshot review prompted a second contour implementation: separately drawn lines had dotted occlusion artifacts, so the final renderer computes contour coverage within the surface rasterization. Supersampling smooths the silhouette. The initial 22-degree angle, 12 degrees per active second, surface bounds, pitch and camera rotations are unchanged.

## Mathematics

The parameterization is `S(r, θ) = (r cos θ, r sin θ, 23θ)`, with `r` in `[-140, 140]` drawing units and `θ` in `[-4.1, 4.1]` radians. A view rotation converts the displayed degree value `A` into radians, `α = Aπ/180`, then applies an ordinary rotation about z. The camera basis is:

- `v = yα sin β − z cos β`
- `d = yα cos β + z sin β`

Here `β = 0.48` rad and larger `d` is nearer the viewer. A final plane rotation by `γ = 0.25` rad gives `X = xα cos γ − v sin γ`, `Y = xα sin γ + v cos γ`. Coordinates are uniformly scaled and centered; drawing Y points downward. There is no perspective division. The analytic normal is the normalized cross product `(23 sin θ, −23 cos θ, r)`.

Unit tests independently evaluate these equations over signed radii, twists and viewing angles; verify length preservation and tangent-normal orthogonality; check a complete revolution and unclipped raster bounds; and solve the central camera ray analytically to verify that the nearer of two sheets determines the rendered color. Browser tests compare a manually requested angle's pixels against a fresh render, not just its readout.

## Typography and meaning

The page uses native MathML Core: mathematical italics, upright trigonometric functions, subscripts, a degree-to-radian fraction and aligned transformation rows. The primary equation stays visible; four explanatory steps live in a native `details` disclosure. Overflowing enlarged equations remain keyboard-scrollable.

[MDN MathML](https://developer.mozilla.org/en-US/docs/Web/MathML) and [MathML Core](https://www.w3.org/TR/mathml-core/) support this small semantic notation set. [MDN font guidance](https://developer.mozilla.org/en-US/docs/Web/MathML/Guides/Fonts) recommends a font with an OpenType MATH table. The scoped, 55,344-byte Portfolio Math font is a renamed subset of [STIX Two Math](https://github.com/stipub/stixfonts); its original license and reproducible preparation script are retained. Literata and JetBrains Mono remain the site's primary faces. [KaTeX's browser integration](https://katex.org/docs/browser) was reviewed, but its additional runtime and font stack are unnecessary here. [Canvas performance guidance](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas) informed the bounded raster and reuse of buffers. Research used the Parallel extraction plugin.

The copy links changing views to the interpretation of embeddings and model visualizations, while explicitly identifying this as an illustrative surface rather than a learned embedding. The joke remains a single aside: “Same object. Different angle. If only debugging were this easy.”

## Interaction and fallback

Pause/Resume retains the shared scene lifecycle. Dragging horizontally or pressing Left/Right inspects a view and pauses automatic rotation. Shift changes the keyboard step from 5 to 15 degrees; Home and Reset view return to 22 degrees. Touch scrolling remains vertical. Readout updates are not live announcements. Motion reduction still permits explicit manual inspection.

`assets/helicoid.svg` is an SVG wrapper containing a transparent raster generated by the exact same depth-tested renderer at 22 degrees. It is an honest static fallback, not a separate approximation of the geometry. Equations are always text, never images. Reproduce the image with `npm start` and, in another terminal, `node scripts/render_projection.mjs`. The previous `mesh()` export remains available for historical concept reproducibility.

## Files and validation

- `assets/projection.js`: shared surface, normal and camera mathematics.
- `assets/projection-renderer.js`: bounded depth-tested surface rasterization.
- `assets/projection-motion.js`: scene lifecycle, angle readout and manual inspection.
- `index.html`, `assets/creative.css`: scoped composition, copy, MathML and disclosure.
- `script.js`: only the projection module's cache version changes.
- `assets/helicoid.svg`, `scripts/render_projection.mjs`: reproducible static image.
- `assets/fonts/PortfolioMath.woff2`, `assets/fonts/STIXTwoMath-OFL.txt`, `assets/fonts/README.md`, `scripts/prepare_projection_font.py`: licensed mathematical typography and provenance.
- `scripts/check_science.mjs`, `tests/projection.spec.mjs`, `tests/scientific-studies.spec.mjs`, `tests/creative.spec.mjs`: numerical and behavioral regressions; old path-string assertions now follow the Canvas drawing and intentional disclosure hierarchy.
- `scripts/check_site.py`: retain existing checks, allow 2 KB more homepage source for semantic MathML, and add explicit limits for the renderer, fallback and math font.

Visual review covers desktop at 22 and 52 degrees, mobile, dark theme, the visible equation, expanded derivation and a rotation recording. Existing responsive, accessibility, zoom, welcome and project checks remain enabled. The task artifacts record actual final test results and deployment evidence. Browser emulation does not establish physical-device or assistive-technology compatibility.
