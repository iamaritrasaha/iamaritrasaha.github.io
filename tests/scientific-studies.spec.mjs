import { test, expect } from "@playwright/test";
import { radialCurve } from "../assets/quanta-feature.js";
import { VIEW } from "../assets/projection.js";

test("QUANTA replaces the featured project and its radial study follows the equations", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/?motion=reduce#quanta");
  await expect(page.locator(".project-jump a")).toHaveText([
    /SeeDL/,
    /QUANTA/,
    /Orion/,
    /SysAI/,
  ]);
  await expect(page.locator("#quanta")).toBeFocused();
  await expect(page.locator(".quanta-density")).toHaveAttribute(
    "d",
    radialCurve(1),
  );
  const control = page.getByRole("button", { name: "2s excited state" });
  await control.focus();
  await page.keyboard.press("Enter");
  await expect(control).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".quanta-density")).toHaveAttribute(
    "d",
    radialCurve(2),
  );
  await expect(page.locator(".quanta-reading")).toContainText(
    "one radial node at 2a₀",
  );
  await expect(page.locator("#quanta .feature-story")).toContainText(
    "all 118 elements",
  );
  await expect(
    page.locator('#quanta a[href="https://iamaritrasaha.github.io/quanta/"]'),
  ).toBeVisible();
  await page.locator("#quanta summary").click();
  await expect(page.locator("#quanta details")).toContainText(
    "not exact many-electron solutions",
  );
  await page.getByRole("button", { name: "1s ground state" }).click();
  await expect(page.locator(".quanta-density")).toHaveAttribute(
    "d",
    radialCurve(1),
  );
  expect(errors).toEqual([]);
});

test("QUANTA and Infera bookmarks stay honest with and without JavaScript", async ({
  browser,
  baseURL,
}) => {
  for (const javaScriptEnabled of [true, false]) {
    const context = await browser.newContext({
      javaScriptEnabled,
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    for (const id of ["infera", "infera-title"]) {
      await page.goto(new URL("/#" + id, baseURL).href);
      await expect(page.locator("#infera")).toBeVisible();
      await expect(page.locator("#infera")).toContainText(
        "in progress and is not currently featured",
      );
      await expect(page.locator(".bb-entry")).toHaveCount(0);
    }
    await page.goto(new URL("/#quanta", baseURL).href);
    await expect(page).toHaveURL(/\/#quanta$/);
    await expect(page.locator("#quanta h3")).toHaveText("QUANTA");
    await expect(page.locator(".quanta-density")).toHaveAttribute(
      "d",
      radialCurve(1),
    );
    await expect(page.locator(".projection-math")).toContainText(
      "Orthographic projection has no perspective scaling",
    );
    if (!javaScriptEnabled)
      await expect(page.locator(".projection-fallback")).toHaveCount(1);
    await page.goto(new URL("/explorations/#quanta", baseURL).href);
    await expect(page.locator('#quanta a[href="/#quanta"]')).toBeVisible();
    await context.close();
  }
});

test("projection rotates automatically, agrees with its angle and pauses without phase jumps", async ({
  page,
}) => {
  const time = new Date("2026-11-06T12:00:00Z");
  await page.clock.install({ time });
  await page.clock.pauseAt(time);
  await page.goto("/#work");
  const panel = page.locator(".instrument");
  const drawing = panel.locator("canvas");
  await expect(page.locator("#angle")).toHaveCount(0);
  await expect(drawing).toHaveAttribute("data-angle", String(VIEW.initial));
  await panel.scrollIntoViewIfNeeded();
  await expect(panel).toHaveClass(/scene-active/);
  await page.clock.runFor(1000);
  const angle = await panel.locator("output").innerText();
  expect(parseFloat(angle)).toBeGreaterThan(32);
  const moving = await drawing.getAttribute("data-angle");
  expect(moving).not.toBe(String(VIEW.initial));
  const pause = panel.getByRole("button", { name: "Pause rotation" });
  await pause.focus();
  await page.keyboard.press("Enter");
  await page.clock.runFor(1000);
  await expect(drawing).toHaveAttribute("data-angle", moving);
  await expect(panel.locator("output")).toHaveText(angle);
  await panel.getByRole("button", { name: "Resume rotation" }).click();
  await page.clock.runFor(100);
  const resumed = parseFloat(await panel.locator("output").innerText());
  expect(resumed - parseFloat(angle)).toBeLessThan(1.5);
  await page.locator("h1").scrollIntoViewIfNeeded();
  await expect(panel).not.toHaveClass(/scene-active/);
  const offscreen = await drawing.getAttribute("data-angle");
  await page.clock.runFor(1000);
  await expect(drawing).toHaveAttribute("data-angle", offscreen);
  await panel.scrollIntoViewIfNeeded();
  await expect(panel).toHaveClass(/scene-active/);
  await page.clock.runFor(100);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  const hidden = await drawing.getAttribute("data-angle");
  await page.clock.runFor(1000);
  await expect(drawing).toHaveAttribute("data-angle", hidden);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: false,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.locator("[data-motion-toggle]").first().click();
  await panel.scrollIntoViewIfNeeded();
  await expect(
    panel.getByRole("button", { name: "Motion off" }),
  ).toBeDisabled();
  const reduced = await drawing.getAttribute("data-angle");
  await page.clock.runFor(1000);
  await expect(drawing).toHaveAttribute("data-angle", reduced);
});

test("data saving keeps a complete static projection with its equations", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const connection = new EventTarget();
    connection.saveData = true;
    Object.defineProperty(navigator, "connection", { value: connection });
  });
  await page.goto("/");
  await expect(page.locator(".instrument canvas")).toHaveAttribute(
    "data-angle",
    String(VIEW.initial),
  );
  await expect(page.locator("[data-projection-pause]")).toBeDisabled();
  await page.locator(".projection-derivation summary").click();
  await expect(
    page.getByRole("region", { name: "Camera tilt and depth" }),
  ).toBeVisible();
});
