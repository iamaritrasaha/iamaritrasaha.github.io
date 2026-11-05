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
  const initial = await readPixels(page);
  const sampleIndex = DIGIT_SAMPLES.findIndex((sample) =>
    sample.input.every((value, index) => value === initial[index]),
  );
  expect(sampleIndex).toBeGreaterThanOrEqual(0);
  const sample = DIGIT_SAMPLES[sampleIndex],
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
    new RegExp(
      "intensity " +
        DIGIT_SAMPLES[(sampleIndex + 1) % DIGIT_SAMPLES.length].input[1] +
        "$",
    ),
  );
});

async function readPixels(page) {
  await expect(page.locator("#pixels button")).toHaveCount(64);
  return page
    .locator("#pixels button")
    .evaluateAll((cells) =>
      cells.map((cell) => Number(cell.style.getPropertyValue("--intensity"))),
    );
}

async function expectSample(page, digit) {
  const sample = DIGIT_SAMPLES[digit];
  expect(await readPixels(page)).toEqual(sample.input);
  const result = evaluateNetwork(sample.input, sample.label);
  await expect(page.locator("#winner")).toHaveText(String(result.prediction));
  await expect(page.locator("#confidence")).toHaveText(
    (100 * result.probabilities[result.prediction]).toFixed(1) +
      "% probability",
  );
}

async function freezeClock(page) {
  const time = new Date("2026-11-05T00:00:00Z");
  await page.clock.install({ time });
  await page.clock.pauseAt(time);
}

test("hero starts randomly and avoids the last displayed digit on reload", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Math.random = () => 0.68;
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expectSample(page, 6);
  await page.reload();
  await expectSample(page, 7);
});

test("random selection works without storage and reduced motion keeps the sample still", async ({
  page,
}) => {
  await freezeClock(page);
  await page.addInitScript(() => {
    Math.random = () => 0.94;
    Object.defineProperty(window, "sessionStorage", {
      get() {
        throw new Error("Storage blocked");
      },
    });
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expectSample(page, 9);
  await page.clock.fastForward(15000);
  await expectSample(page, 9);
  await page.locator("#specimen").click();
  expect(await readPixels(page)).toEqual(DIGIT_SAMPLES[10].input);
});

test("hero waits for the welcome then animates real samples in digit order with wraparound", async ({
  page,
}) => {
  await freezeClock(page);
  await page.addInitScript(() => {
    Math.random = () => 0.99;
  });
  await page.goto("/");
  await expect(page.locator(".bb-entry")).toBeVisible();
  await page
    .locator(".bb-entry")
    .evaluate((entry) =>
      entry
        .getAnimations({ subtree: true })
        .forEach((animation) => animation.pause()),
    );
  await page.clock.fastForward(5000);
  await expectSample(page, 9);
  expect(
    await page
      .locator(".boot-grid i")
      .evaluateAll((tiles) => tiles.map((tile) => Number(tile.style.opacity))),
  ).toEqual(
    DIGIT_SAMPLES[9].input.map((value) =>
      Number((0.14 + 0.86 * value).toFixed(6)),
    ),
  );
  await page.keyboard.press("Escape");
  await expect(page.locator(".bb-entry")).toHaveCount(0);
  await page.clock.fastForward(4700);
  await expectSample(page, 9);
  await page.clock.fastForward(200);
  await expectSample(page, 0);
  const timings = await page.locator("#pixels button").evaluateAll((cells) =>
    cells.flatMap((cell) =>
      cell
        .getAnimations()
        .filter((animation) => animation.effect.getTiming().duration === 360)
        .map((animation) => animation.effect.getTiming().delay),
    ),
  );
  expect(timings).toHaveLength(64);
  expect(Math.max(...timings)).toBe(196);
  await expect(page.locator("#bench-status")).toBeEmpty();
  await page.clock.fastForward(4800);
  await expectSample(page, 1);
});

test("cycling pauses for motion, visibility and manual edits and resumes from Next specimen", async ({
  page,
}) => {
  await freezeClock(page);
  await page.addInitScript(() => {
    Math.random = () => 0.4;
  });
  await page.goto("/#top");
  await expect(page.locator(".pixel-relief")).toHaveClass(/scene-active/);
  await page.clock.fastForward(4900);
  await expectSample(page, 5);
  const pause = page.locator(".pixel-relief button");
  await pause.click();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduce");
  await page.clock.fastForward(10000);
  await expectSample(page, 5);
  await pause.click();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "full");
  await page.clock.fastForward(4900);
  await expectSample(page, 6);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.clock.fastForward(10000);
  await expectSample(page, 6);
  await page.evaluate(() => {
    delete document.hidden;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await expect(page.locator(".pixel-relief")).not.toHaveClass(/scene-active/);
  await page.clock.fastForward(10000);
  await expectSample(page, 6);
  await page.locator("#pixels").scrollIntoViewIfNeeded();
  await page.clock.fastForward(600);
  await page.locator("#pixels button").nth(27).click();
  const edited = await readPixels(page);
  await page.clock.fastForward(10000);
  expect(await readPixels(page)).toEqual(edited);
  await page.locator("#specimen").click();
  await expectSample(page, 7);
  await page.clock.fastForward(4900);
  await expectSample(page, 8);
  await page.locator("#inspect").click();
  await page.clock.fastForward(10000);
  await expectSample(page, 8);
});
