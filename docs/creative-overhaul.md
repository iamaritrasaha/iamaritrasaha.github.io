# Creative overhaul review

Branch `feat/portfolio-creative-overhaul` starts at recovery commit `64842db`. Preview with `npm start` and open [localhost:4173](http://localhost:4173). For the built site run `npm run build` and `npm start -- dist`.

## Compare the result

[Desktop comparisons](creative-review/comparison-1440.jpg) · [Phone comparisons](creative-review/comparison-390.jpg) · [Recorded walkthrough](creative-review/walkthrough.webm) · [Entry frame](creative-review/entry.jpg)

Before changing the site I captured ten matching positions at each width. The original first viewport was a broad, single-line nameplate with parallel text columns and a full-width classifier below. The original motion largely entered groups vertically. The new first viewport has an offset two-line name and a bright square projection surface. The phone reads from identity to controls to a compact instrument. The real classifier now has its own lab, linked directly from the hero.

The comparison sheets cover the hero, work index, three public features, Orion, archive, practice, biography and contact. Individual JPEGs sit beside the sheets. The later research and historical sections keep more of their previous structure than the opening and featured work.

## Motion and computation

The 1.25-second first visit opens on a dark field. A copy of the hero's actual wireframe unfolds above the revealing name, then scales and travels to the hero instrument as the field clears. Skip, Escape and Tab dismiss immediately. A saved visit marker, reduced motion, data saving and direct fragment links bypass the sequence. With scripts disabled the HTML and the SVG surface render directly.

Rotating the hero range input recomputes an orthographic projection of a helicoid with the parameterization (r cos θ, r sin θ, 23θ). The selected angle rotates the surface before projection onto the tilted camera plane. This geometry is independent of the classifier. Its original numerical implementation, learned weights, examples, equations and training metadata were retained.

Three native scroll sequences handle the progression into work. The work title tightens its tracking, SeeDL opens its diagnostic plate with a horizontal mask, and PulseShift's LED board unfolds from perspective. Each follows the element's visibility within native scrolling. The existing motion preference gates the sequences. Browsers without view timelines display the complete static composition. I chose this approach after reviewing [CSS view timelines](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-timeline/view) and [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/).

## Project experiences

- **SeeDL.** A dark diagnostic plate leads the spread. The isolate control dims the surrounding connections and emphasizes the existing conceptual signal. The link to the actual viewer and the notebook disclosure remain available.
- **Infera.** Profile, Fit and Report switch an illustrated dataset through three stages. Four labeled training observations lie on y = 2x + 1. A held-out x of 4 gives a prediction of 9 against an observation of 10. The interface draws the fitted line and reveals the residual. The values are an illustrative worked example, not a reported project benchmark.
- **PulseShift.** A full-width hardware bench places six discrete LED packages beside the keyboard-operated output control. Engineering notes follow beneath it. The preview describes synthetic progression and retains the firmware's physical qualification limits.

## Implementation and iteration

`index.html` changes section ordering and adds progressively enhanced instruments. `404.html` loads the new palette through a root-relative stylesheet. `assets/creative.css` owns the composition, mobile layout, dark masthead, diagnostic states, motion and responsive hardware bench. `assets/creative.js` orchestrates the entry and instrument controls. `assets/projection.js` computes the surface. `assets/helicoid.svg` supplies the static fallback. The site uses the locally licensed Literata and JetBrains Mono files.

The first screenshot pass showed the phone surface needed more height. It also showed PulseShift still closely resembled its previous two-column spread. The second pass enlarged the phone instrument, moved the hardware bench above its explanatory copy, put SeeDL's visual earlier on small screens and gave Infera a worked numerical example.

## Validation and limits

Lint, static build and all 17 module tests passed. The 20 browser tests include the existing classifier, theme, responsive layout, archive, keyboard, no-JavaScript and nested 404 checks. Two new tests exercise intro skip, repeat visits, reduced motion and keyboard operation of the project controls. Browser checks use Microsoft Edge emulation at 320, 390, 768, 1024 and 1440px.

The final built-site mobile Lighthouse run measured **96 Performance, 100 Accessibility, 100 Best Practices and 100 SEO**. LCP was 1.8 seconds, total blocking time was 40 ms and CLS was 0.070. The checkpoint report recorded 94 Performance, 1.9-second LCP, 210 ms blocking time and CLS 0.070. One intermediate overhaul run scored 91 Performance. These local measurements vary between runs. Physical-device and Safari behavior were not measured. [Raw final audit](creative-review/lighthouse.json)
