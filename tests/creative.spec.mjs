import { test, expect } from "@playwright/test";

for (const width of [390, 1440]) {
  test(`welcome name decodes from bits without changing accessible text or layout at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const time = new Date("2026-11-06T12:00:00Z");
    await page.clock.install({ time });
    await page.clock.pauseAt(time);
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const name = page.locator(".bb-entry > strong");
    await expect(name).toBeVisible();
    expect(await name.ariaSnapshot()).toContain("Aritra Saha");
    await expect(name.locator('.name-visual[aria-hidden="true"]')).toHaveCount(
      1,
    );
    const frames = await name.evaluate((name) => {
      const veil = name.closest(".bb-entry");
      const animations = veil.getAnimations({ subtree: true });
      return [0, 800, 1600].map((time) => {
        animations.forEach((animation) => {
          animation.pause();
          animation.currentTime = time;
        });
        const letters = [...name.querySelectorAll(".name-letter")];
        const codes = [...name.querySelectorAll(".name-code")];
        const rect = name.getBoundingClientRect();
        return {
          letters: letters.map((el) => +getComputedStyle(el).opacity),
          bits: codes.map((el) => +getComputedStyle(el).opacity),
          decoded: codes
            .map((el) => String.fromCharCode(parseInt(el.textContent, 2)))
            .join(""),
          width: rect.width,
          height: rect.height,
          left: rect.left,
          right: rect.right,
        };
      });
    });
    expect(frames[0].letters.every((value) => value === 0)).toBe(true);
    expect(frames[0].bits.every((value) => value > 0)).toBe(true);
    expect(frames[1].letters[0]).toBe(1);
    expect(frames[1].letters.at(-1)).toBe(0);
    expect(frames[2].letters.every((value) => value === 1)).toBe(true);
    expect(frames[2].bits.every((value) => value === 0)).toBe(true);
    expect(frames[2].decoded).toBe("AritraSaha");
    for (const frame of frames) {
      expect(frame.width).toBeCloseTo(frames[0].width, 1);
      expect(frame.height).toBeCloseTo(frames[0].height, 1);
      expect(frame.left).toBeGreaterThanOrEqual(0);
      expect(frame.right).toBeLessThanOrEqual(width);
    }
    expect(await name.ariaSnapshot()).toContain("Aritra Saha");
    await page.keyboard.press("Escape");
    await expect(page.locator(".bb-entry")).toHaveCount(0);
    await expect(page.locator("#pixels button:focus")).toHaveCount(1);
  });
}

test("welcome preserves its handoff, supports keyboard dismissal and shortens return visits", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".bb-entry button")).toHaveCount(0);
  await expect(page.getByRole("dialog")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator(".entry")).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("dialog")).toContainText("Aritra Saha");
  await page.keyboard.press("Escape");
  await expect(page.locator(".entry")).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("dialog")).toBeFocused();
  await expect(page.locator(".bb-entry")).toHaveClass(/is-returning/);
  await expect(page.locator(".epoch-label")).toContainText("INTRO EPOCH");
  expect(
    await page
      .locator(".bb-entry")
      .evaluate((el) =>
        parseFloat(el.style.getPropertyValue("--entry-duration")),
      ),
  ).toBe(4600);
  await expect(page.locator(".entry")).toHaveCount(0, { timeout: 5200 });
  await expect(
    page.getByRole("button", { name: /replay welcome/i }),
  ).toHaveCount(0);
});
test("reduced motion bypasses entry and instruments work by keyboard", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("#angle")).toBeVisible();
  await expect(page.locator(".entry")).toHaveCount(0);
  expect(
    await page.evaluate(() => localStorage.getItem("projection-intro")),
  ).toBeNull();
  await page.locator("#angle").focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".axis-control output")).toHaveText("23°");
  await page.getByRole("button", { name: "Report", exact: true }).click();
  await expect(page.locator(".data-example p")).toContainText("Residual +1");
  await page.getByRole("button", { name: "Isolate signal path" }).click();
  await expect(page.locator("#seedl")).toHaveClass(/isolated/);
});
