# Social preview image

Open Graph and Twitter/X metadata in the homepage and 404 source HTML use `https://iamaritrasaha.github.io/assets/portfolio-social-20261105.png`. It is a 1200 × 630 PNG using the portfolio's cobalt/citron colours, self-hosted Literata and JetBrains Mono fonts, current professional title, and the actual first digit specimen rendered as a pixel relief.

Regenerate it with the existing development dependencies:

```bash
npm ci
npx playwright install chromium
node scripts/render_social_card.mjs
```

Rendering is offline, using embedded local fonts and the exported sample data. The script also copies the current image to the legacy `assets/portfolio-open-graph.png` path. This helps crawlers that retain old HTML but refetch its image. The previous image is preserved in Git history. The old SVG is historical artwork and is not advertised by the current metadata.

When the card changes again, use a new dated image filename and update both `og:image` and `twitter:image` in both HTML pages. Keep their alt descriptions and dimensions accurate. The static integrity check verifies that the two metadata formats agree, the PNG exists with the advertised dimensions, the file remains small, and the legacy PNG matches the current image.

Social services cache fetched HTML and image bytes separately. Updating the image URL prevents reuse of the old image cache once the service fetches the new metadata. Existing messages/posts and previously cached page previews may remain unchanged until that service refreshes them. Facebook Sharing Debugger and LinkedIn Post Inspector can request a new scrape for their respective platforms; other chat services control their own refresh timing. The website cannot directly purge every platform's cached messages.
