import { test, expect } from "@playwright/test";

// Chromium trace snapshots can suppress MediaQueryList change delivery.
// Keep the same live-preference assertions without that instrumentation.
test.use({ trace: "off" });
test("new features survive no JavaScript and motion is cancelled live", async ({
  browser,
  page,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 844 },
  });
  const fallback = await context.newPage();
  await fallback.goto("/");
  await expect(fallback.locator("#infera h3")).toHaveText("Infera");
  await fallback.goto("/embedded/#pulseshift");
  await expect(
    fallback.locator("#pulseshift input, #pulseshift button"),
  ).toHaveCount(0);
  await expect(fallback.locator("#pulse-rpm")).toHaveText("4,250");
  await expect(fallback.locator(".pulse-led.is-lit")).toHaveCount(3);
  await fallback.locator("#pulseshift summary").click();
  await expect(fallback.locator("#pulseshift details")).toHaveAttribute(
    "open",
    "",
  );
  await context.close();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page.locator("#infera").scrollIntoViewIfNeeded();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduce");
  expect(
    await page.evaluate(
      () =>
        document
          .getAnimations()
          .filter((animation) => animation.playState === "running").length,
    ),
  ).toBe(0);
});
