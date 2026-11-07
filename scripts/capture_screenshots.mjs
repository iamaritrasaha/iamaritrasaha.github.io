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

    // Hero screenshot
    const heroEl = page.locator(".bench-hero");
    if (await heroEl.isVisible()) {
      await heroEl.screenshot({
        path: `${outDir}/${cfg.name}-hero.png`,
      });
    }

    // Selected work screenshot
    const workEl = page.locator(".selected-work");
    if (await workEl.isVisible()) {
      await workEl.screenshot({
        path: `${outDir}/${cfg.name}-selected-work.png`,
      });
    }

    // Full homepage
    await page.screenshot({
      path: `${outDir}/${cfg.name}-homepage-full.png`,
      fullPage: true,
    });

    // 2. Embedded Lab
    await page.goto("http://127.0.0.1:4174/embedded/", {
      waitUntil: "networkidle",
    });
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);

    const embeddedStyles = await page.evaluate(() => {
      const getBg = (sel) => {
        const el = document.querySelector(sel);
        return el ? getComputedStyle(el).backgroundImage : "not found";
      };
      return {
        body: getBg("body"),
        labHero: getBg(".lab-hero"),
      };
    });
    console.log(
      `[${cfg.name}] Computed backgrounds on Embedded:`,
      embeddedStyles,
    );

    await page.screenshot({
      path: `${outDir}/${cfg.name}-embedded.png`,
      fullPage: false,
    });

    // 3. Explorations
    await page.goto("http://127.0.0.1:4174/explorations/", {
      waitUntil: "networkidle",
    });
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);

    const explorationsStyles = await page.evaluate(() => {
      const getBg = (sel) => {
        const el = document.querySelector(sel);
        return el ? getComputedStyle(el).backgroundImage : "not found";
      };
      return {
        body: getBg("body"),
        explorationsHero: getBg(".explorations-hero"),
      };
    });
    console.log(
      `[${cfg.name}] Computed backgrounds on Explorations:`,
      explorationsStyles,
    );

    await page.screenshot({
      path: `${outDir}/${cfg.name}-explorations.png`,
      fullPage: false,
    });

    // 4. 404 page
    await page.goto("http://127.0.0.1:4174/404.html", {
      waitUntil: "networkidle",
    });
    await page.screenshot({
      path: `${outDir}/${cfg.name}-404.png`,
      fullPage: false,
    });

    await context.close();
  }

  await browser.close();
  console.log(`Saved screenshots to ${outDir}`);
} finally {
  server.kill();
}
