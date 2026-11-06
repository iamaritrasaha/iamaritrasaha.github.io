# QUANTA and the projection study

The homepage keeps SeeDL first, followed by QUANTA, Orion and SysAI. Its professional title, colors, typography and surrounding composition are unchanged. QUANTA's scientific computing complements the AI/ML work; it is not presented as a model-training product. Infera's former feature, regression widget and unused selectors are removed. `#infera` and `#infera-title` expose an in-progress notice and development-source link. Historical audit reports remain intact.

## Scientific sources and scope

Reviewed QUANTA's deployed observatory and Hydrogen, Gold and Oganesson views, plus the README, orbital implementation, screening implementation and model notes at [aad2c37f1da23eaaab2da34e0d8656f42a208789](https://github.com/iamaritrasaha/quanta/tree/aad2c37f1da23eaaab2da34e0d8656f42a208789):

- [Model notes](https://github.com/iamaritrasaha/quanta/blob/aad2c37f1da23eaaab2da34e0d8656f42a208789/docs/science/orbital-models.md)
- [Radial and angular functions](https://github.com/iamaritrasaha/quanta/blob/aad2c37f1da23eaaab2da34e0d8656f42a208789/src/physics/orbitals.ts)
- [Screening calculations](https://github.com/iamaritrasaha/quanta/blob/aad2c37f1da23eaaab2da34e0d8656f42a208789/src/physics/slater.ts)
- [Live observatory](https://iamaritrasaha.github.io/quanta/)

The copy distinguishes ideal analytical hydrogen, effective-charge approximations for many-electron atoms, empirical levels where available and theoretical superheavy states. It does not imply exact many-electron solutions for all 118 elements or measured spectra where none are available. The Explorations entry remains discoverable, with shorter copy pointing to the full homepage case study and separate application.

The original portfolio illustration uses normalized radial probability, `P(r) = r² |Rₙₗ(r)|²`. With `ρ = r/a₀`, the selectable curves are `a₀P₁ₛ = 4ρ² exp(−2ρ)` and `a₀P₂ₛ = ρ²(2−ρ)² exp(−ρ)/8`. Unit tests integrate each to one and verify the 1s peak, 2s node and outer peak. The separate ideal hydrogen ladder follows `Eₙ ≈ −13.6/n² eV`; its 3→2 annotation gives approximately 1.89 eV and 656 nm. Fine structure and transition intensities are not inferred. Probability is not drawn as a classical trajectory. No QUANTA runtime or dependency is embedded.

## Automatic projection

The existing helicoid mesh now rotates at 12 degrees per active second from its original 22-degree view. The panel shows the actual surface parameterization, z-axis rotation, camera tilt, orthographic equations, constants and parameter ranges. The angle readout updates with the geometry. The drawing is sampled at up to 30 frames per second; no layout measurement occurs in the loop.

A local Pause rotation button and the existing global motion preference control the same animation. Offscreen panels, hidden tabs, reduced motion, data saving and page exit stop scheduling frames. Resuming preserves phase instead of advancing through paused time. Without JavaScript, the original static helicoid and full equations remain visible. Browser tests check changing geometry, local keyboard pause, phase continuity, offscreen/hidden cancellation, global pause and data saving. An independent calculation checks the mesh against the printed equations.

## Visual evidence

- QUANTA: [desktop](portfolio-refinement/quanta-desktop.png), [mobile](portfolio-refinement/quanta-mobile.png)
- Projection: [desktop](portfolio-refinement/projection-desktop.png), [mobile](portfolio-refinement/projection-mobile.png)
- Automatic rotation recordings: [1440px](portfolio-refinement/projection-desktop.webm), [390px](portfolio-refinement/projection-mobile.webm)
- The separately reviewed welcome change has [before/after recordings and intermediate construction frames](welcome-construction.md).

Reviewed both QUANTA themes at 1440px and 390px. The plots, state buttons, case-study disclosure and external links fit the established layout; the small-screen caption spells out the scientific meaning beneath the illustration. Projection equations reflow into one column on mobile. Tests retain SeeDL isolation, classifier calculations, keyboard navigation, responsive text enlargement, no-JavaScript content and all three section entrances.

The final audit also refreshes the shared social-preview artwork and keeps the evaluation shortcut attached to the classifier, rather than implying that QUANTA trains ML models. The live-motion regression test now establishes running browser animations before changing the system preference; its existing reduced-state and zero-running-animation assertions remain intact. This strengthened precondition removes the previously observed Chromium emulation race.
