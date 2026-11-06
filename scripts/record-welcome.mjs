import { chromium } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

// npm start, then node scripts/record-welcome.mjs [URL] [output-directory]
const url = process.argv[2] || "http://127.0.0.1:4173/";
const output = resolve(process.argv[3] || ".playwright-cli/welcome-proof");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || "msedge",
});
const report = [];
for (const [device, viewport] of [
  ["desktop", { width: 1440, height: 900 }],
  ["mobile", { width: 390, height: 844 }],
]) {
  for (const returning of [false, true]) {
    const key = `${device}-${returning ? "returning" : "first"}`;
    const context = await browser.newContext({
      viewport,
      recordVideo: { dir: output, size: viewport },
    });
    if (returning)
      await context.addInitScript(() =>
        sessionStorage.setItem("portfolio-welcomed", "true"),
      );
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.locator(".name-bits").waitFor();
    const box = await page.locator(".bb-entry > strong").boundingBox();
    await page
      .locator('.bb-entry > strong[data-construction="complete"]')
      .waitFor();
    const endBox = await page.locator(".bb-entry > strong").boundingBox();
    await page
      .locator(".bb-entry")
      .waitFor({ state: "detached", timeout: 6500 });
    await page.waitForTimeout(350);
    const video = page.video();
    await context.close();
    await video.saveAs(resolve(output, `${key}.webm`));
    await video.delete();
    report.push({ key, box, endBox, errors });
  }
  // Controlled intermediate frames accompany the unmodified real-time video.
  const page = await browser.newPage({ viewport, deviceScaleFactor: 2 });
  const time = new Date("2026-11-06T12:00:00Z");
  await page.clock.install({ time });
  await page.clock.pauseAt(time);
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  await page.locator(".name-bits").waitFor();
  const box = await page.locator(".bb-entry > strong").boundingBox();
  const clip = {
    x: Math.max(0, box.x - 18),
    y: box.y - 15,
    width: Math.min(viewport.width, box.width + 36),
    height: box.height + 30,
  };
  const frames = [];
  let elapsed = 0;
  for (const [at, label] of [
    [100, "Initial field"],
    [260, "A accumulating"],
    [400, "A in binary"],
    [510, "A resolved"],
    [730, "r in binary"],
    [1970, "Word space"],
    [2260, "S in binary"],
    [3300, "Complete name"],
    [4900, "Pixel handoff"],
    [5500, "Classifier arrival"],
  ]) {
    await page.clock.runFor(at - elapsed);
    elapsed = at;
    await page.locator(".bb-entry").evaluate(
      (el, at) =>
        el.getAnimations({ subtree: true }).forEach((a) => {
          a.pause();
          a.currentTime = at;
        }),
      at,
    );
    const png = await page.screenshot(at < 4000 ? { clip } : {});
    await writeFile(resolve(output, `${device}-${at}.png`), png);
    frames.push({
      at,
      label,
      url: `data:image/png;base64,${png.toString("base64")}`,
    });
  }
  await page.close();
  const sheet = await browser.newPage({
    viewport: { width: 1500, height: 1200 },
  });
  await sheet.setContent(
    `<style>body{margin:0;padding:24px;background:#101a48;color:#e4f489;font:18px monospace}main{display:grid;grid-template-columns:1fr 1fr;gap:20px}figure{margin:0;background:#1b2b70;padding:12px}img{display:block;width:100%;height:170px;object-fit:contain;object-position:left}figure:nth-last-child(-n+2) img{height:410px}figcaption{padding-bottom:10px}h1{font:24px monospace}</style><h1>${device} / actual browser captures / ${url}</h1><main>${frames.map((f) => `<figure><figcaption>${f.at} ms · ${f.label}</figcaption><img src="${f.url}"></figure>`).join("")}</main>`,
  );
  await sheet
    .locator("img")
    .evaluateAll((images) => Promise.all(images.map((img) => img.decode())));
  await sheet.screenshot({
    path: resolve(output, `${device}-sequence.png`),
    fullPage: true,
  });
  await sheet.close();
}
await writeFile(
  resolve(output, "recording.json"),
  JSON.stringify(report, null, 2),
);

// Decode the actual desktop video for visual inspection of real-time playback.
const player = await browser.newPage({
  viewport: { width: 1500, height: 1200 },
});
const data = await readFile(resolve(output, "desktop-first.webm"));
await player.setContent(
  `<video muted src="data:video/webm;base64,${data.toString("base64")}"></video>`,
);
await player.locator("video").evaluate(
  (v) =>
    new Promise((r) => {
      if (v.readyState >= 2) r();
      else v.onloadeddata = r;
    }),
);
const stills = [];
for (const at of [0.7, 0.85, 0.95, 1.03, 1.28, 2.5, 2.8, 3.9]) {
  const image = await player.locator("video").evaluate(async (v, t) => {
    await new Promise((r) => {
      v.onseeked = r;
      v.currentTime = t;
    });
    const c = document.createElement("canvas");
    c.width = 900;
    c.height = 160;
    c.getContext("2d").drawImage(v, 300, 380, 900, 160, 0, 0, 900, 160);
    return c.toDataURL();
  }, at);
  stills.push(
    `<figure><figcaption>${at.toFixed(2)} s of real-time recording</figcaption><img src="${image}"></figure>`,
  );
}
await player.setContent(
  `<style>body{background:#101a48;color:#e4f489;font:18px monospace}figure{margin:14px}img{display:block;width:900px}</style>${stills.join("")}`,
);
await player
  .locator("img")
  .evaluateAll((images) => Promise.all(images.map((img) => img.decode())));
await player.screenshot({
  path: resolve(output, "video-frames.png"),
  fullPage: true,
});
await browser.close();
console.log(JSON.stringify({ output, report }, null, 2));
