import { test, expect } from "@playwright/test";
import { LED_THRESHOLDS } from "../assets/pulse-rpm.js";
async function freezeClock(page) {
  const time = new Date("2026-11-04T00:00:00Z");
  await page.clock.install({ time });
  await page.clock.pauseAt(time);
}

test("the mathematical manuscript typesets correct relationships and retains the grid handoff", async ({
  page,
}) => {
  await freezeClock(page);
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const entry = page.locator(".bb-entry");
  await expect(entry).toBeVisible();
  await expect(entry.locator(".boot-grid i")).toHaveCount(64);
  await expect(entry.locator(".welcome-math")).toHaveAttribute(
    "aria-hidden",
    "true",
  );
  for (const [name, text] of Object.entries({
    ohm: "V = IR",
    "power-start": "P = VI",
    "power-substitution": "P = (IR)I",
    "power-result": "P = I2R",
    kirchhoff: "Σ Iin = Σ Iout",
    linear: "z = Wx + b",
    softmax: "pi = exp(zi)Σj exp(zj)",
    loss: "L = −log(py)",
    gradient: "∂L∂zi = pi − 1[i = y]",
  }))
    await expect(entry.locator(`[data-equation="${name}"]`)).toHaveText(text);
  const timeline = async (time) =>
    page.evaluate((t) => {
      const entry = document.querySelector(".bb-entry");
      entry.getAnimations({ subtree: true }).forEach((a) => {
        a.pause();
        a.currentTime = t;
      });
    }, time);
  for (const [time, equation] of [
    [900, "power-start"],
    [1400, "power-substitution"],
    [2000, "power-result"],
  ]) {
    await timeline(time);
    expect(
      await entry
        .locator(`[data-equation="${equation}"]`)
        .evaluate((el) => Number(getComputedStyle(el).opacity)),
    ).toBe(1);
  }
  await page.clock.runFor(2400);
  await page.evaluate(() =>
    document.querySelector(".boot-grid").getAnimations()[0].finish(),
  );
  const [from, to] = await Promise.all([
    entry.locator(".boot-grid").boundingBox(),
    page.locator("#pixels").boundingBox(),
  ]);
  for (const key of ["x", "y", "width", "height"])
    expect(Math.abs(from[key] - to[key])).toBeLessThan(1);
  await page.keyboard.press("Escape");
  await expect(entry).toHaveCount(0);
  await expect(page.locator("#pixels button").first()).toBeFocused();
});

test("welcome equations fit mobile and keyboard Tab exits without trapping focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() =>
    document
      .querySelector(".bb-entry")
      .getAnimations({ subtree: true })
      .forEach((a) => {
        a.pause();
        a.currentTime = 2000;
      }),
  );
  for (const selector of [
    ".math-power",
    ".math-probability",
    ".bb-entry > strong",
  ]) {
    const box = await page.locator(selector).boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(390);
  }
  await expect(page.locator(".math-gradient")).toBeHidden();
  await page.keyboard.press("Tab");
  await expect(page.locator(".bb-entry")).toHaveCount(0);
  await expect(page.locator("#specimen")).toBeFocused();
});

test("automatic RPM traverses low, shift and deceleration with the same six LEDs", async ({
  page,
}) => {
  await freezeClock(page);
  await page.goto("/#pulseshift");
  const figure = page.locator(".pulse-study");
  await figure.scrollIntoViewIfNeeded();
  await expect(figure).toHaveAttribute("data-running", "true");
  const check = async () => {
    const snapshot = await figure.evaluate((el) => ({
      rpm: Number(el.dataset.rpm),
      text: el.querySelector("#pulse-rpm").textContent,
      lit: el.querySelectorAll(".pulse-led.is-lit").length,
    }));
    expect(snapshot.text).toBe(snapshot.rpm.toLocaleString("en-US"));
    expect(snapshot.lit).toBe(
      LED_THRESHOLDS.filter((v) => snapshot.rpm >= v).length,
    );
    return snapshot.rpm;
  };
  await page.clock.runFor(100);
  expect(await check()).toBeLessThan(1600);
  await page.clock.runFor(2400);
  const middle = await check();
  expect(middle).toBeGreaterThan(3500);
  expect(middle).toBeLessThan(5000);
  await page.clock.runFor(2800);
  await expect(figure).toHaveAttribute("data-state", "shift");
  expect(await check()).toBe(7600);
  await page.clock.runFor(3000);
  expect(await check()).toBeLessThan(middle + 300);
  await expect(figure.locator(".pulse-state")).toContainText("DECELERATING");
  await page.clock.runFor(3100);
  expect(await check()).toBe(1200);
  await expect(
    page.locator(
      "#pulseshift input, #pulseshift button, #pulse-level, #pulse-output",
    ),
  ).toHaveCount(0);
  await expect(figure.locator(".pulse-kicker")).toHaveText(
    "SIMULATED RPM · VISUAL PREVIEW",
  );
  await expect(figure.locator("[aria-live]")).toHaveCount(0);
});

test("RPM suspends offscreen and in a hidden tab, resumes smoothly, and becomes static on motion reduction", async ({
  page,
}) => {
  await freezeClock(page);
  await page.goto("/#pulseshift");
  const figure = page.locator(".pulse-study");
  await figure.scrollIntoViewIfNeeded();
  await expect(figure).toHaveAttribute("data-running", "true");
  await page.clock.runFor(1800);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(figure).toHaveAttribute("data-running", "false");
  const paused = await figure.getAttribute("data-rpm");
  await page.clock.runFor(3000);
  await expect(figure).toHaveAttribute("data-rpm", paused);
  await figure.scrollIntoViewIfNeeded();
  await expect(figure).toHaveAttribute("data-running", "true");
  await page.clock.runFor(50);
  expect(
    Math.abs(Number(await figure.getAttribute("data-rpm")) - Number(paused)),
  ).toBeLessThan(200);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(figure).toHaveAttribute("data-running", "false");
  const hidden = await figure.getAttribute("data-rpm");
  await page.clock.runFor(3000);
  await expect(figure).toHaveAttribute("data-rpm", hidden);
  await page.evaluate(() => {
    delete document.hidden;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(figure).toHaveAttribute("data-running", "true");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(figure).toHaveAttribute("data-running", "false");
  await expect(page.locator("#pulse-rpm")).toHaveText("4,250");
  await expect(figure.locator(".pulse-led.is-lit")).toHaveCount(3);
});

test("data-saving bypasses welcome and retains a meaningful static instrument", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "connection", {
      value: new EventTarget(),
    }),
  );
  await page.addInitScript(() =>
    Object.defineProperty(navigator.connection, "saveData", { value: true }),
  );
  await page.goto("/");
  await expect(page.locator(".bb-entry")).toHaveCount(0);
  await expect(page.locator(".pulse-study")).toHaveAttribute(
    "data-running",
    "false",
  );
  await expect(page.locator("#pulse-rpm")).toHaveText("4,250");
  await expect(page.locator(".pulse-led.is-lit")).toHaveCount(3);
});
