# Self-hosted typography

The primary design uses only Literata and JetBrains Mono. Font files are served locally, with no runtime font service requests.

- `Literata-Latin-Variable.woff2`, 85,672 bytes: Latin subset of the variable optical-size/weight font, requested for optical sizes 7 to 72 and weights 400 to 600. Obtained from [Google Fonts' official CSS service](https://fonts.googleapis.com/css2?family=Literata:opsz,wght@7..72,400..600&display=swap), served by `fonts.gstatic.com`, on 4 November 2026. [Typeface source](https://github.com/googlefonts/literata). The official [SIL Open Font License](https://github.com/google/fonts/blob/main/ofl/literata/OFL.txt) is preserved as `Literata-OFL.txt`.
- `JetBrainsMono-Regular.woff2`, 29,072 bytes: the existing regular technical face and its `JetBrainsMono-OFL.txt` are retained. [Official project](https://github.com/JetBrains/JetBrainsMono).

Only normal styles are downloaded. Literata optical sizing is automatic; weight 400 carries reading and display, with 500/600 used sparingly. Native mathematical layout may use platform glyph fallback for symbols absent from the Latin subset. Historical license notices remain for attribution of earlier revisions, although their font files are no longer shipped.
