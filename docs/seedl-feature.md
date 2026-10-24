# SeeDL flagship feature

SeeDL is added above Orion, SysAI, Relay and Vyren in selected work. The existing portfolio identity is retained: the hero, ivory/charcoal/cobalt palette, typography, navigation, about/practice/contact sections and mathematical demonstrations are unchanged. A separate scoped stylesheet supplies only the SeeDL layout, project shortcut and illustration animation. No dependencies were added.

## Verified project information

Checked on 2026-10-24 against the official repository at revision `7d93e7f231e50fc8f9fb1390d333390c9fb73ed4`:

- [SeeDL source](https://github.com/iamaritrasaha/seedl) and its `pyproject.toml` identify version 0.5.0 and a dependency-free Python core, with optional PyTorch, Plotly and Qiskit integrations.
- [PyPI](https://pypi.org/project/seedl/0.5.0/) publishes non-yanked wheel/source distributions for 0.5.0. [GitHub release v0.5.0](https://github.com/iamaritrasaha/seedl/releases/tag/v0.5.0) is a stable published release dated 2026-10-16. These publication records take precedence over the source release-notes document, which still says publication is pending.
- The [official website](https://iamaritrasaha.github.io/seedl/), [documentation](https://iamaritrasaha.github.io/seedl/docs/), [playground](https://iamaritrasaha.github.io/seedl/playground.html), 3D neural viewer and execution-trace demo all returned HTTP 200. Both viewers were opened in Playwright during research.
- Descriptions are limited to implemented scientific visualization and inspection: neurons and signed connections, captured activations, execution graphs, attention routing, gradient diagnostics and quantum-system views. No accuracy, causal-interpretability, employment or performance claim is invented.

## Generated artwork

The feature uses `assets/seedl/observatory-illustration.webp`, an AI-generated concept illustration, rather than a SeeDL screenshot or numerical result. The visible caption and alt text identify that distinction. The generated image is transparent, 1200 × 850, approximately 302 KiB and lazy-loaded below the hero. Research screenshots, design studies and unused exports are not included in the repository.

Art direction: spatial neural layers of charcoal and ivory ceramic neurons, fine cobalt connections and an inspection ribbon; warm ivory `#f4efe7`, charcoal `#29282b`, cobalt `#354dc5`; no labels, numbers, measurements, UI or screenshots. The built-in image-generation tool produced the image; WebP compression prepares it for the site. Generation provenance and the asset checksum are recorded in `assets/seedl/provenance.json`.

The illustration drifts and turns slightly using CSS transforms. The existing scene observer runs it only while visible and while the document is active. The existing motion preference, OS reduced-motion setting and synchronized pause controls stop it. It stays a static illustration without JavaScript. The full 3D/scientific viewers open on SeeDL's own website, keeping Plotly, remote requests and embedded application controls out of the portfolio runtime.

## Validation

The source check enforces SeeDL followed by the four preserved featured projects and budgets canonical UTF-8/LF source sizes, avoiding a false failure on Windows CRLF checkouts. Browser coverage checks the new shortcut, illustration loading, destination URLs, native notebook keyboard interaction, accessibility, reduced motion and manual pause. Existing project and no-JavaScript checks remain in place.

Local comparison against `main` confirms identical hero, about, practice, contact and original four project markup, and unchanged shared styles, runtime scripts, theme controller, numerical/model modules, dependencies and lockfile. No change was made to the SeeDL repository. The feature branch is for review only; no merge or deployment is authorized.
