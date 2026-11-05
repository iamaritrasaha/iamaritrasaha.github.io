// Rebuild the share image with the current palette, local fonts and real specimen.
// Run: node scripts/render_social_card.mjs
import { chromium } from "@playwright/test";
import { readFile, copyFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { DIGIT_SAMPLES } from "../assets/digit-model.js";

const font = async (name) =>
  (
    await readFile(new URL(`../assets/fonts/${name}`, import.meta.url))
  ).toString("base64");
const [literata, mono] = await Promise.all([
  font("Literata-Latin-Variable.woff2"),
  font("JetBrainsMono-Regular.woff2"),
]);
const input = DIGIT_SAMPLES[0].input;
const point = (x, y) => `${x.toFixed(1)},${y.toFixed(1)}`;
const polygon = (points, fill, opacity = 1) =>
  `<polygon points="${points.map(([x, y]) => point(x, y)).join(" ")}" fill="${fill}" opacity="${opacity}" stroke="#8b9dca" stroke-width=".6"/>`;
let relief = "";
for (let row = 0; row < 8; row++)
  for (let column = 0; column < 8; column++) {
    const value = input[row * 8 + column],
      x = 250 + (column - row) * 27,
      y = 98 + (column + row) * 13;
    const h = 5 + value * 78;
    relief += polygon(
      [
        [x, y - h],
        [x + 27, y + 13 - h],
        [x, y + 26 - h],
        [x - 27, y + 13 - h],
      ],
      value > 0.3 ? "#e4f489" : "#6478b5",
      0.45 + value * 0.55,
    );
    relief += polygon(
      [
        [x - 27, y + 13 - h],
        [x, y + 26 - h],
        [x, y + 26],
        [x - 27, y + 13],
      ],
      value > 0.3 ? "#a2b792" : "#354b99",
    );
    relief += polygon(
      [
        [x, y + 26 - h],
        [x + 27, y + 13 - h],
        [x + 27, y + 13],
        [x, y + 26],
      ],
      value > 0.3 ? "#798e8a" : "#2a3f8a",
    );
  }
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || "chromium",
});
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  await page.setContent(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
    @font-face{font-family:Literata;src:url(data:font/woff2;base64,${literata}) format('woff2');font-weight:400 600}
    @font-face{font-family:Mono;src:url(data:font/woff2;base64,${mono}) format('woff2')}
    *{box-sizing:border-box}body{margin:0;width:1200px;height:630px;background:#20369b;color:#fffdec;padding:42px 56px;font-family:Literata,serif}
    header,footer{display:flex;justify-content:space-between;align-items:center;font:14px Mono,monospace;letter-spacing:.04em}
    header{color:#d5def9}header i{display:inline-block;width:9px;height:9px;margin-right:12px;background:#e4f489}
    main{display:grid;grid-template-columns:1fr 500px;align-items:center;gap:35px;height:478px}
    h1{font-size:110px;line-height:.98;letter-spacing:-.045em;font-weight:400;margin:0;color:#e4f489}
    .role{font:18px/1.75 Mono,monospace;margin:28px 0 0}
    figure{margin:0;border-top:1px solid #8194ce;padding-top:12px}
    svg{width:500px;height:300px;display:block}figcaption{font-size:43px;letter-spacing:-.035em;border-top:1px solid #8194ce;padding-top:10px}
    .note{font:11px Mono,monospace;color:#d5def9;letter-spacing:.07em;display:block;margin-bottom:12px}
    footer{border-top:1px solid #8194ce;padding-top:23px;color:#d5def9}footer span:last-child{color:#e4f489}
  </style></head><body>
    <header><span><i></i>ARITRA SAHA / PORTFOLIO</span><span>AI · SOFTWARE · SYSTEMS</span></header>
    <main><div><h1>Aritra<br>Saha.</h1><p class="role">AI/ML Engineer<br>Applied AI Developer</p></div>
    <figure><svg viewBox="0 0 500 340" aria-label="A handwritten digit represented as a relief of pixels">${relief}</svg><figcaption><span class="note">A TRAINED, EDITABLE DIGIT CLASSIFIER</span>Change one pixel.</figcaption></figure></main>
    <footer><span>iamaritrasaha.github.io</span><span>SeeDL · Infera · PulseShift</span></footer>
  </body></html>`,
    { waitUntil: "load" },
  );
  await page.evaluate(() => document.fonts.ready);
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth > 1200 ||
      document.documentElement.scrollHeight > 630,
  );
  if (overflow) throw new Error("Social image exceeds the 1200 × 630 frame");
  await page.screenshot({
    path: fileURLToPath(
      new URL("../assets/portfolio-social-20261105.png", import.meta.url),
    ),
    type: "png",
  });
  // Keep old cached metadata useful when a crawler refetches the legacy URL.
  await copyFile(
    new URL("../assets/portfolio-social-20261105.png", import.meta.url),
    new URL("../assets/portfolio-open-graph.png", import.meta.url),
  );
  console.log("Rendered assets/portfolio-social-20261105.png (1200 × 630)");
} finally {
  await browser.close();
}
