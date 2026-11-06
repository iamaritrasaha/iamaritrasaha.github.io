import { test, expect, chromium } from "@playwright/test";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("Chromium browser zoom at 200% and 400% preserves reflow and controls", async ({
  browserName,
  baseURL,
}) => {
  test.skip(
    browserName !== "chromium",
    "This check uses Chromium's native tabs.setZoom API.",
  );
  const directory = await mkdtemp(join(tmpdir(), "portfolio-zoom-"));
  const extension = join(directory, "extension");
  await mkdir(extension);
  await writeFile(
    join(extension, "manifest.json"),
    JSON.stringify({
      manifest_version: 3,
      name: "Portfolio zoom audit",
      version: "1.0",
      permissions: ["tabs"],
      background: { service_worker: "background.js" },
    }),
  );
  await writeFile(
    join(extension, "background.js"),
    `chrome.tabs.onUpdated.addListener((id,info,tab)=>{if(info.status!=="complete")return;try{const u=new URL(tab.url);const zoom=Number(u.searchParams.get("auditZoom"));if(u.origin===${JSON.stringify(new URL(baseURL).origin)}&&[2,4].includes(zoom))chrome.tabs.setZoom(id,zoom)}catch{}});`,
  );
  let context;
  try {
    context = await chromium.launchPersistentContext(
      join(directory, "profile"),
      {
        channel: "chromium",
        headless: true,
        viewport: null,
        args: [
          "--window-size=1280,1024",
          `--disable-extensions-except=${extension}`,
          `--load-extension=${extension}`,
        ],
      },
    );
    const page = await context.newPage();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(baseURL);
    // Native window borders vary by platform; zoom scales the content viewport.
    const unzoomedWidth = await page.evaluate(() => innerWidth);
    for (const zoom of [2, 4]) {
      await page.goto(`${baseURL}/?auditZoom=${zoom}`);
      await expect.poll(() => page.evaluate(() => devicePixelRatio)).toBe(zoom);
      const geometry = await page.evaluate(() => ({
        width: innerWidth,
        scroll: document.documentElement.scrollWidth,
      }));
      expect(geometry.width).toBeCloseTo(unzoomedWidth / zoom, 0);
      expect(geometry.scroll).toBeLessThanOrEqual(geometry.width);
      const pixel = page.locator("#pixels button").first();
      await pixel.focus();
      const before = await pixel.getAttribute("aria-label");
      await page.keyboard.press("Space");
      await expect(pixel).not.toHaveAttribute("aria-label", before);
      await page.locator(".menu-toggle").click();
      await expect(page.locator("#nav-panel")).toBeVisible();
      await page.goto(`${baseURL}/embedded/?auditZoom=${zoom}`);
      await expect.poll(() => page.evaluate(() => devicePixelRatio)).toBe(zoom);
      const labGeometry = await page.evaluate(() => ({
        width: innerWidth,
        scroll: document.documentElement.scrollWidth,
      }));
      expect(labGeometry.width).toBeCloseTo(unzoomedWidth / zoom, 0);
      expect(labGeometry.scroll).toBeLessThanOrEqual(labGeometry.width);
      await page.locator("#lab-duty").focus();
      const duty = await page.locator("#lab-duty").inputValue();
      await page.keyboard.press("ArrowRight");
      expect(await page.locator("#lab-duty").inputValue()).not.toBe(duty);
      await page.goto(`${baseURL}/explorations/?auditZoom=${zoom}`);
      await expect.poll(() => page.evaluate(() => devicePixelRatio)).toBe(zoom);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.locator('.exploration-index a[href="#science"]').click();
      await expect(page.locator("#science")).toBeFocused();
    }
  } finally {
    await context?.close();
    await rm(directory, { recursive: true, force: true });
  }
});
