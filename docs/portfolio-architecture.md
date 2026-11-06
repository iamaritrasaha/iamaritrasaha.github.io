# Portfolio architecture

The homepage presents Aritra Saha as an AI/ML Engineer and Applied AI Developer. This change reorganizes content within the existing static portfolio, preserving its palette, fonts, welcome, classifier, mathematical studies and Embedded Lab instruments.

## Routes and ownership

| Route            | Content                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------ |
| `/`              | SeeDL, Infera, Orion, SysAI, classifier, learning, two editorial gateways, About and Contact           |
| `/embedded/`     | Circuit fundamentals, PWM/GPIO, protocols, embedded C/C++, PulseShift and planned hardware/IoT studies |
| `/explorations/` | VECTOR, QUANTA, Arthrekha, Vyren, Aether, Orbis, Serein and compact earlier work                       |

Vyren is the substantive systems feature. Its application source is private; the [public developer-preview channel](https://github.com/iamaritrasaha/vyren-preview) provides context and releases. Veyra remains a distinct, private experimental Android project. Relay is historical, with its original repository and upstream attribution preserved. No other repositories are modified.

## Content verification

Reviewed current repository README files and source metadata on 6 November 2026. Primary public references:

- [SeeDL](https://github.com/iamaritrasaha/seedl), [Infera](https://github.com/iamaritrasaha/infera), [SysAI](https://github.com/iamaritrasaha/sysai) and [PulseShift](https://github.com/iamaritrasaha/PulseShift).
- [VECTOR](https://github.com/iamaritrasaha/vector): SGP4 propagation is distinct from aircraft observations and spacecraft telemetry.
- [QUANTA](https://github.com/iamaritrasaha/quanta): analytical hydrogen densities, schematic models for other elements and reference spectra where available.
- [Arthrekha](https://github.com/iamaritrasaha/arthrekha): annual Budget Estimates and cumulative provisional actuals retain their reporting scope.
- [Aether](https://github.com/iamaritrasaha/aether), [Orbis](https://github.com/iamaritrasaha/orbis), [Serein](https://github.com/iamaritrasaha/serein) and [Foresight Labs](https://github.com/iamaritrasaha/foresight-labs).

Private-project source and status were checked through the authenticated account. No private code or model artifacts are copied into the portfolio. Lumina survives only as a historical bookmark entry because its current development and release status could not be independently verified. Foresight is described as a private alpha candidate with physical-device acceptance pending. No new research outcome or deployment claim is introduced.

## Illustration boundaries

New original SVGs illustrate coordinates, hydrogen probability, budget analysis and software systems. The projected orbit is a circular-coordinate teaching sketch, not SGP4 execution. The hydrogen 1s radial plot follows `P(r) = 4r²/a₀³ exp(−2r/a₀)` and peaks at `r = a₀`. The 2p lobes are schematic. Budget marks are illustrative, without financial values. Vyren's topology is not live traffic.

VECTOR, QUANTA and Arthrekha retain links to their separate applications. Their runtimes are not embedded. No runtime dependency is added.

PulseShift uses the original `pulse-rpm.js` module in one place. Its existing offscreen/visibility/preference lifecycle is integrated with the Embedded Lab controller. The original engineering sketch and qualifications are retained, including synthetic thresholds, disabled live decoding, unverified motorcycle compatibility, pending electrical qualification and the TWAI limitation.

## Bookmark compatibility

`assets/legacy-fragments.js` runs before the homepage welcome bootstrap and only on `/` or `/index.html`. An exact allowlist uses `location.replace` for known moved fragments, preserves query parameters, handles percent encoding, and ignores unknown or malformed fragments. Nested pages never redirect back. No-JavaScript arrivals expose a meaningful `:target` link to the relocated section.

| Old homepage fragments                                                                                         | Destination                       |
| -------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `pulseshift`, `pulseshift-title`, `pulse-rpm`                                                                  | `/embedded/#pulseshift`           |
| `vyren`, `vyren-title`                                                                                         | `/explorations/#vyren`            |
| `relay`, `relay-title`                                                                                         | `/explorations/#relay`            |
| `index`                                                                                                        | `/explorations/#index`            |
| `vector`, `quanta`, `arthrekha`, `aether`, `orbis`, `serein`, `veyra`, `aura`, `lumina`, `foresight`, `novarx` | Same fragment on `/explorations/` |

All other existing IDs remain on the homepage, including `systems`, `principles`, `approach` and `future`. Shared navigation owns fragment focus, opens enclosing disclosures and preserves Escape/focus restoration. Each primary route has one `aria-current="page"` link. Theme and motion choices synchronize between tabs.

## Chapter entrances

The homepage welcome implementation and its timing are unchanged. Embedded and Explorations use `chapter-entry.js` and `chapter-entry.css` for a first-visit, 2.2-second introduction: 1.6 seconds of staged drawing followed by a 600 ms geometric handoff into the existing hero SVG. Embedded adds a conceptual signal bus, six sequential LEDs and `f = 1/T` to the existing board sketch. Explorations stages its coordinates, orbital geometry, probability wave and network nodes. The SVG artwork is reused, without copying application runtimes or creating duplicate IDs.

The welcomes have no visible skip button. A slim citron progress bar tracks the secondary entrance's 2.2-second timeline, matching the homepage's existing epoch progress bar. It represents animation progress, not network loading. Escape, Tab, tapping the introductory artwork, scrolling, resizing, hidden tabs and motion-preference changes release the page. Session repeat visits, reloads, history navigation, fragments, reduced motion and data saving bypass the new intros. The destination h1 remains in the accessibility tree, and completion or explicit skipping places focus there. A bounded watchdog and CSS cover timeout fail open; no-JavaScript content is visible normally. Page-level animation controllers pause during the introduction.

All three documents opt in to native cross-document View Transitions. A short 160 ms snapshot bridge applies to ordinary return navigation. `pageswap` and `pagereveal` skip native transitions for full introductions, reduced motion, fragments and history traversal, so native snapshots do not compete with cinematic artwork. Browsers without this API still run the independent chapter introductions and use normal document navigation. This follows the same-origin, two-document opt-in described in [MDN's View Transition API guide](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using). The site remains a multi-page static website.

Review captures: [Explorations desktop](architecture-review/explorations-desktop.jpg), [mobile](architecture-review/explorations-mobile.jpg), [dark theme](architecture-review/explorations-dark.jpg), [Embedded introduction](architecture-review/embedded-intro-desktop.jpg), [Explorations introduction](architecture-review/explorations-intro-desktop.jpg), and [PulseShift](architecture-review/pulseshift.jpg).

## Validation and rollback

Local validation passed: `npm ci`, `npm run lint`, `npm test` (27 unit tests and four-page static integrity), `npm run build` and `npm run test:browser` (135 tests). The browser suite covers all six chapter-navigation directions, first and repeat entrances, history traversal, keyboard skipping, native-transition fallback, reduced motion, JavaScript failure, no JavaScript, all 19 bookmark destinations, themes, accessibility, enlarged text and existing functional demonstrations. All 63 original homepage IDs remain present, including compatibility links. Desktop/mobile before-and-after captures and chapter animation recordings were reviewed.

Rollback commit: `2ee97c3ba2d14a67c7db6aef4b1ce210d7f12964`. Before editing, the checkout matched fetched `origin/main`, both public routes returned HTTP 200, and GitHub's Pages and CI runs for that commit had succeeded.

The static validator includes the new route, its nested assets, all old homepage anchors and scoped size budgets. The Embedded Lab HTML budget grows from 50 KB to 56 KB to accommodate the relocated full presentation; the homepage becomes smaller. Browser tests retain the original assertions at their new locations and add navigation, all 19 fragment mappings, no-JavaScript fallback, accessibility, responsive typography, motion lifecycle and cross-page preferences. The build includes `explorations/`; the GitHub Pages configuration is unchanged.
