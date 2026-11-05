# Embedded Systems Lab

The static `/embedded/` notebook extends the existing portfolio. It uses the shared palette, locally hosted Literata and JetBrains Mono fonts, theme preference and motion preference. There is no blocking welcome overlay or additional production dependency.

## Files and models

- `embedded/index.html`: semantic page, original SVG sketches, complete static waveforms, accessible diagram descriptions, code examples and project status. With JavaScript disabled, all protocol and code panels remain visible; calculated initial values and diagrams remain meaningful.
- `assets/embedded.css`: scoped notebook compositions and responsive drawing styles. Equations and controls wrap when text is enlarged. Code retains indentation in keyboard-scrollable regions.
- `assets/embedded.js`: progressive controls, responsive waveform rendering and a single time-based animation loop. The loop stops outside the animated sections, when the tab is hidden, or when reduced motion/data saving is active. Geometry is cached by ResizeObserver, not read on every frame. CSS drawing effects also follow section visibility and motion preference.
- `assets/electronics-math.js`: pure, unit-tested teaching models. Current is V/R; power is VI. PWM period is 1/f and on-time is duty times period. The display spans two milliseconds, so changing frequency changes the number of pulses as well as the period marker.
- `assets/navigation.js`: the existing mobile navigation behavior, extracted for reuse by both pages and initialized immediately after the header, independently of the larger model modules. No routing framework is required.

UART illustrates the byte 0x53, 8N1, least significant bit first. I²C illustrates a byte, a low acknowledgement on the ninth clock, START and STOP. SPI illustrates mode 0, most significant bit first, with MOSI 0xA5 and MISO 0x3C. CAN shows nominal high-speed differential levels, not a decoded frame, measured bus trace or wiring recommendation. The scans run slowly for readability.

Arduino examples target the classic Uno explicitly. They are independent sketches: wrap-safe millis timing and GPIO/Serial, 10-bit ADC to 8-bit PWM on pin 9, and a short pin-2 interrupt with atomic copying of a 16-bit counter on the 8-bit AVR. No physical hardware validation is claimed. Board voltages, APIs and pin capabilities differ.

Reference documentation: [Arduino millis](https://docs.arduino.cc/language-reference/en/functions/time/millis/), [analogRead](https://docs.arduino.cc/language-reference/en/functions/analog-io/analogRead/), [analogWrite](https://docs.arduino.cc/language-reference/en/functions/analog-io/analogWrite/), [attachInterrupt](https://docs.arduino.cc/language-reference/en/functions/external-interrupts/attachInterrupt/), and [ESP-IDF TWAI operating modes](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/peripherals/twai.html).

## Project status

PulseShift status was checked against its [repository README](https://github.com/iamaritrasaha/PulseShift/blob/0c3c7cf9c8822e9248741af36c2c56dc2cca9f1e/README.md) on 5 November 2026: v0.3.0 software prerelease, ESP32/six-LED demonstration and experimental receive-only CAN work, physical motorcycle qualification pending. The unverified vehicle profile and unresolved hardware qualification are not presented as completed work. No firmware files were changed.

Future cards are explicitly planned explorations. Add a new semantic article to the project section with its actual status, repository link and verified evidence. Keep planned ideas distinct from work in progress or completed implementation.

## Validation

`npm test` checks static nested-page links, assets, metadata, source-size budgets and the numerical/protocol models. `npm run build` copies `embedded/` into the exact publishable output. The preview server redirects `/embedded` to `/embedded/` and serves its index document.

`tests/embedded.spec.mjs` covers the 13 requested widths, both themes, enlarged text, spacing, all protocol/code panels, short landscape, input calculations, keyboard/touch navigation, theme persistence, no-JavaScript content, motion/data-saving behavior, visibility pausing and automated accessibility. These are browser-emulation checks, not physical-device or electrical qualification.
