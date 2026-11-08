import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const targetDir = process.argv[2] || "after";
const outDir = resolve("docs/screenshots", targetDir);
await mkdir(outDir, { recursive: true });

// Start server
const server = spawn("node", ["scripts/serve.mjs"], {
  env: { ...process.env, PORT: "4174" },
  stdio: "ignore",
});

await new Promise((r) => setTimeout(r, 1200));

try {
  const browser = await chromium.launch();

  // Representative configurations: desktop (1440) and mobile (390), light & dark themes
  const configs = [
    { name: "desktop-1440-light", width: 1440, height: 900, theme: "light" },
    { name: "desktop-1440-dark", width: 1440, height: 900, theme: "dark" },
    { name: "mobile-390-light", width: 390, height: 844, theme: "light" },
    { name: "mobile-390-dark", width: 390, height: 844, theme: "dark" },
  ];

  for (const cfg of configs) {
    const context = await browser.newContext({
      viewport: { width: cfg.width, height: cfg.height },
      colorScheme: cfg.theme,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();

    // 1. Home
    await page.goto("http://127.0.0.1:4174/", { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    // Dismiss any welcome reel if active
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);

    // Verify computed styles on home
    const homeStyles = await page.evaluate(() => {
      const getBg = (sel) => {
        const el = document.querySelector(sel);
        return el ? getComputedStyle(el).backgroundImage : "not found";
      };
      return {
        body: getBg("body"),
        benchHero: getBg(".bench-hero"),
        benchPanel: getBg(".bench-panel"),
        caseSeedl: getBg(".case-seedl"),
        contactSection: getBg(".contact-section"),
      };
    });

    console.log(`[${cfg.name}] Computed backgrounds on Home:`, homeStyles);

    // Representative Hero capture
    const heroEl = page.locator(".bench-hero");
    if (await heroEl.isVisible()) {
      await heroEl.screenshot({
        path: `${outDir}/${cfg.name}-hero.png`,
      });
    }

    // Representative Selected Work capture
    const workEl = page.locator(".selected-work");
    if (await workEl.isVisible()) {
      await workEl.screenshot({
        path: `${outDir}/${cfg.name}-selected-work.png`,
      });
    }

    await context.close();
  }

  await browser.close();
  console.log(`Saved representative screenshots to ${outDir}`);
} finally {
  server.kill();
}
