# Experience audit, November 2026

This follow-up audits the published homepage and Embedded Systems Lab, then makes targeted fixes. The production checkpoint is `d9a253f3c1d0102b77aa0cf9b32bc3a072cf7e55`. The working branch is `fix/experience-audit`. No deployment configuration or mathematical model changed.

## Confirmed findings and corrections

| Finding reproduced on production                                                                                                                | Correction                                                                                                                                                                            | Verification                                                                                                                                |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Forced-colors emulation collapsed the classifier's editable intensity grid to one white color.                                                  | Preserve colors within data graphics, while normal text and controls continue using system colors. Add a dual-color focus ring to the editable pixels.                                | Chromium and Firefox forced-color checks, visible intensity differences, keyboard editing and screenshots.                                  |
| Tabbing beyond the last mobile navigation link left the menu expanded.                                                                          | Close the menu when keyboard focus leaves navigation, preserving focus inside it and Escape behavior.                                                                                 | Real Tab navigation on both routes.                                                                                                         |
| Changing PWM duty while motion was paused left the marker on the old signal level. A resize could also leave it at the old horizontal location. | Use the same timing geometry to render the waveform and marker on animation frames, control changes and resize.                                                                       | Change duty and frequency at a captured time, then resize; assert the mathematically correct level and horizontal position.                 |
| Two open tabs could display different theme and motion preferences after a setting changed.                                                     | Respond to native storage events, including reset, without writing events back. Preserve OS, data-saving and URL overrides. A pending welcome also respects an external motion pause. | Real two-tab browser tests and theme unit tests.                                                                                            |
| Voltage and duty sliders exposed numeric values without units.                                                                                  | Supply initial and updated accessible values in volts and percent duty cycle.                                                                                                         | Browser assertions after interaction; native keyboard controls retained.                                                                    |
| Negative activation values were distinguished visually by pink alone.                                                                           | Add diagonal stripes and update the existing legend. Retain the original colors.                                                                                                      | Rendered pattern assertion, screenshots and unchanged numerical tests.                                                                      |
| The development dependency tree had three moderate advisory entries involving the HTML validator, glob and minimatch.                           | Update html-validate to 11.18.0 and document its supported Node versions.                                                                                                             | Clean npm installation, audit with zero advisories and unchanged validation rules passing. The public site has no runtime npm dependencies. |

## Usability improvement

The long lab notebook now has five compact chapter links in its existing introductory strip: Circuits, PWM, Signals, Code and Projects. Native fragment targets receive focus, including without JavaScript. This is a navigation enhancement, not a claim that the former layout was broken. All existing homepage projects, section order and demonstrations remain intact.

## Research and audit checklist

Research used the Parallel Search plugin to consult MDN, W3C and web.dev. The GitHub plugin inspected the current branch and open pull requests. Recommendations were checked against the rendered site before implementation.

- **Keyboard and focus:** [WAI grid pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/) and [WCAG focus not obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html). Exercise focus movement, menu dismissal, native fragment navigation and real grid editing.
- **Meaningful values:** [MDN slider guidance](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/slider_role). Preserve native range controls and expose units with `aria-valuetext`.
- **High contrast and graphical information:** [MDN forced-colors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/forced-colors), [CSS Color Adjustment](https://www.w3.org/TR/css-color-adjust-1/) and [WAI use of color](https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html). Use limited overrides for data graphics, keep system styling elsewhere, and supplement color with labels or patterns.
- **Preferences:** [MDN storage events](https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event) and [Web Storage usage](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API). Check multiple documents, blocked storage, reset and absence of feedback loops.
- **Motion and performance:** [web.dev reduced motion](https://web.dev/articles/prefers-reduced-motion), [MDN Page Visibility](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API) and [JavaScript performance](https://developer.mozilla.org/en-US/docs/Learn/Performance/JavaScript). Check viewport and tab pausing, meaningful static diagrams, no redundant scene queries per frame, and unchanged animation timing.
- **Reflow and accessibility:** Re-run the existing responsive audit matrix, rather than inventing new breakpoints. Inspect 320 through 2560 CSS pixels, both themes, short landscape, 200% text, spacing overrides and Chromium native 200%/400% zoom. The research and design rationale for this matrix remain in [the responsive audit](responsive-audit.md).
- **Integrity:** Check all external links, dependencies, static asset budgets, HTML, actual calculations, browser console errors and public deployment bytes.

## Verification before publication

- `npm ci`, lint, static checks, 27 unit tests and production build pass.
- Full Chromium suite: 94 passed. Full Firefox suite: 93 passed, with only the Chromium-specific native zoom test skipped.
- The final nine new experience regression tests pass again after the final markup and pattern changes.
- Both routes cover all 13 requested widths, both themes, enlarged text and user text spacing. Existing welcome, RPM, classifier, embedded calculations, protocol panels, hidden-tab pausing, reduced motion and no-JavaScript checks remain enabled.
- Existing automated AA accessibility checks pass. Manual browser review includes keyboard menu exit, focus rings, chapter navigation, readable waveform states and high-contrast graphics.
- All 28 distinct external links inspected returned HTTP 200 at audit time. This does not guarantee future availability.
- Before screenshots come from the actual public checkpoint. After screenshots and deployment evidence are retained with the task's audit artifacts.

## Limits and optional future work

This is browser emulation and automated testing with visual inspection, not physical-device testing, a formal WCAG certification or a complete assistive-technology study. WebKit cannot run in this environment because required operating-system libraries are missing. Native zoom is tested in Chromium; text enlargement and reflow are tested in both available engines.

Lighthouse results are laboratory measurements. Production scores and asset verification are recorded after publication in the accompanying audit report. No real-user dataset is available, so there is no field INP claim. A high accessibility score does not replace a screen-reader study.

Optional future work is a real-device and screen-reader usability session, especially on iOS Safari and Windows high contrast. Consolidating the historical stylesheet layers could simplify maintenance, but this audit found no reason to risk a broad visual rewrite. Do not remove creative motion or change the welcome sequence merely to optimize a synthetic score.
