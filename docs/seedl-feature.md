# SeeDL flagship feature

SeeDL is added above Orion, SysAI, Relay and Vyren in selected work. The existing portfolio identity is retained: the hero, ivory/charcoal/cobalt palette, typography, navigation, about/practice/contact sections and mathematical demonstrations are unchanged. A separate scoped stylesheet supplies only the SeeDL layout, project shortcut and illustration animation. No dependencies were added.

## Verified project information

Checked on 2026-10-24 against the official repository at revision `7d93e7f231e50fc8f9fb1390d333390c9fb73ed4`:

- [SeeDL source](https://github.com/iamaritrasaha/seedl) and its `pyproject.toml` identify version 0.5.0 and a dependency-free Python core, with optional PyTorch, Plotly and Qiskit integrations.
- [PyPI](https://pypi.org/project/seedl/0.5.0/) publishes non-yanked wheel/source distributions for 0.5.0. [GitHub release v0.5.0](https://github.com/iamaritrasaha/seedl/releases/tag/v0.5.0) is a stable published release dated 2026-10-16. These publication records take precedence over the source release-notes document, which still says publication is pending.
- The [official website](https://iamaritrasaha.github.io/seedl/), [documentation](https://iamaritrasaha.github.io/seedl/docs/), [playground](https://iamaritrasaha.github.io/seedl/playground.html), 3D neural viewer and execution-trace demo all returned HTTP 200. Both viewers were opened and inspected.
- Descriptions are limited to implemented scientific visualization and inspection: neurons and signed connections, captured activations, execution graphs, attention routing, gradient diagnostics and quantum-system views. No accuracy, causal-interpretability, employment or performance claim is invented.

## Artwork

The feature uses a crisp inline SVG network, with cobalt signals travelling through successive layers and receiving nodes briefly highlighting. The network stays fixed, avoiding whole-image rotation or floating. Its visible caption identifies it as a concept network, rather than captured model values or a SeeDL screenshot. The linked scientific viewers remain on SeeDL's own website.

The illustration uses the existing theme variables for paper, charcoal and cobalt, so both themes receive appropriate colors without image filters. It replaces a 302 KiB raster with approximately 5 KiB of vector markup. No image request, library, canvas loop or additional JavaScript is required. Metadata is recorded in `assets/seedl/provenance.json`.

The existing scene observer runs motion only while the section is visible and the document is active. The existing motion preference, OS reduced-motion setting and synchronized pause controls stop it. Without JavaScript, the complete network remains visible and static. The source HTML budget increases by 2 KiB to accommodate the vector; overall page transfer is substantially smaller.

## Validation

The source check enforces SeeDL followed by the four preserved featured projects and budgets canonical UTF-8/LF source sizes, avoiding a false failure on Windows CRLF checkouts. Browser coverage checks the new shortcut, vector rendering, forward signal progression, offscreen suspension, destination URLs, native notebook keyboard interaction, accessibility, reduced motion and manual pause. Existing project and no-JavaScript checks remain in place.

Local comparison against `main` confirms identical hero, about, practice, contact and original four project markup, and unchanged shared styles, runtime scripts, theme controller, numerical/model modules, dependencies and lockfile. No change was made to the SeeDL repository. Publication follows the repository review and merge process.
