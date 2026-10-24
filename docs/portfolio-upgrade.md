# Portfolio refinement notes

The portfolio uses an editorial ivory, charcoal and cobalt identity, local fonts, semantic HTML, CSS and progressive JavaScript. SeeDL leads selected work, followed by Orion, SysAI, Relay and Vyren. Project facts, development states, ownership statements and contact details are preserved.

## Design and interaction

Reading text uses a consistent 16px scale. The mobile introduction fills the reading column, and tablet layouts stack where columns become cramped. Project shortcuts provide direct access to featured work. Native engineering disclosures preserve detailed technical context without overwhelming the main stories.

Fragment navigation moves keyboard focus to its destination, including repeated links to the current fragment. Contact supports copying the email address, with success and failure feedback; the entire copy row remains hidden when unavailable. The original email link remains available.

The mathematical study uses a trained digit classifier with browser-side inference and gradients. SeeDL's artwork is a concept illustration; scientific demonstrations are linked separately. Theme and motion preferences persist, OS reduced motion takes precedence, and continuous animation runs only while visible.

## Development and validation

The site has no production dependencies. A loopback-only preview server handles public files and nested 404 routes. Existing Python checks and the static build accept an explicitly configured interpreter or a system installation. Machine-local interpreter configuration and generated build/browser output are ignored by version control.

See [validation](validation.md) for recorded checks and limits, [design decisions](design-decisions.md) for implementation details, and [SeeDL feature notes](seedl-feature.md) for verified project information and artwork metadata. Browser coverage is local emulation, rather than physical-device or screen-reader certification.
