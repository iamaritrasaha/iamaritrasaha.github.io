# Self-hosted typography

The primary design uses only Literata and JetBrains Mono. Font files are served locally, with no runtime font service requests.

- `Literata-Latin-Variable.woff2`, 85,672 bytes: Latin subset of the variable optical-size/weight font, requested for optical sizes 7 to 72 and weights 400 to 600. Obtained from [Google Fonts' official CSS service](https://fonts.googleapis.com/css2?family=Literata:opsz,wght@7..72,400..600&display=swap), served by `fonts.gstatic.com`, on 4 November 2026. [Typeface source](https://github.com/googlefonts/literata). The official [SIL Open Font License](https://github.com/google/fonts/blob/main/ofl/literata/OFL.txt) is preserved as `Literata-OFL.txt`.
- `JetBrainsMono-Regular.woff2`, 29,072 bytes: the existing regular technical face and its `JetBrainsMono-OFL.txt` are retained. [Official project](https://github.com/JetBrains/JetBrainsMono).

Only normal styles are downloaded. Literata optical sizing is automatic; weight 400 carries reading and display, with 500/600 used sparingly. Native mathematical layout may use platform glyph fallback for symbols absent from the Latin subset. Historical license notices remain for attribution of earlier revisions, although their font files are no longer shipped.

## Projection Study mathematics

`PortfolioMath.woff2` is a narrowly scoped derivative of **STIX Two Math 2.13 build 171**, used only by `.projection-equation math`. It preserves the OpenType MATH table, italic mathematical identifiers and stretching parentheses. It does not replace Literata or JetBrains Mono elsewhere. The derivative is renamed **Portfolio Math**; the original copyright and SIL Open Font License are retained in `STIXTwoMath-OFL.txt`.

Source: [official STIX v2.13b171 distribution](https://raw.githubusercontent.com/stipub/stixfonts/v2.13b171/zipfiles/static_otf.zip), `STIXTwoMath-Regular.otf`; [upstream license](https://github.com/stipub/stixfonts/blob/v2.13b171/OFL.txt). Reproduce with `python3 scripts/prepare_projection_font.py /path/to/static_otf.zip` after installing FontTools and Brotli in an optional authoring environment. The script subsets only the study's characters and their layout dependencies and performs WOFF2 compression. No font service or equation-rendering JavaScript is required at runtime.
