import { test, expect } from "@playwright/test";
import { DIGIT_SAMPLES } from "../assets/digit-model.js";
import { evaluateNetwork } from "../assets/neural-network.js";
test("pixel relief moves on idle and still reflects edits when motion is paused", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Escape");
  const image = () =>
    page.locator(".pixel-relief canvas").evaluate((c) => c.toDataURL());
  const first = await image();
  await expect.poll(image).not.toBe(first);
  await page.locator(".pixel-relief button").click();
  const paused = await image();
  await page.waitForTimeout(150);
  expect(await image()).toBe(paused);
  await page.locator("#pixels button").nth(27).click();
  expect(await image()).not.toBe(paused);
});
test("pixel edits match model inference and inspected units", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const sample = DIGIT_SAMPLES[0],
    input = [...sample.input];
  input[1] = input[1] >= 0.5 ? 0 : 1;
  const r = evaluateNetwork(input, sample.label);
  const cells = page.locator("#pixels button");
  await cells.first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(cells.nth(1)).toBeFocused();
  await page.keyboard.press("Space");
  await expect(page.locator("#winner")).toHaveText(String(r.prediction));
  await expect(page.locator("#confidence")).toHaveText(
    (100 * r.probabilities[r.prediction]).toFixed(1) + "% probability",
  );
  await page.locator("#inspect").click();
  await page.getByLabel("Inspect activation of unit").selectOption("4");
  await expect(page.locator("#layer-note")).toContainText(r.h2[4].toFixed(4));
  await page.locator("#specimen").click();
  await expect(cells.nth(1)).toHaveAttribute(
    "aria-label",
    new RegExp("intensity " + DIGIT_SAMPLES[1].input[1] + "$"),
  );
});
