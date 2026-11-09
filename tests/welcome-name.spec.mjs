import { test, expect } from "@playwright/test";

async function freeze(page) {
  const time = new Date("2026-11-06T12:00:00Z");
  await page.clock.install({ time });
  await page.clock.pauseAt(time);
}

// Observe Cipher Reel lifecycle and DOM resources without altering production code.
async function instrument(page) {
  await page.addInitScript(() => {
    window.nameProbe = {
      draws: 0,
      observers: 0,
      listeners: 0,
    };

    const listeners = new Set();
    const add = window.addEventListener,
      remove = window.removeEventListener;
    window.addEventListener = function (type, fn, ...rest) {
      if (type === "resize" && fn.name === "resized") listeners.add(fn);
      window.nameProbe.listeners = listeners.size;
      return add.call(this, type, fn, ...rest);
    };
    window.removeEventListener = function (type, fn, ...rest) {
      if (type === "resize" && fn.name === "resized") listeners.delete(fn);
      window.nameProbe.listeners = listeners.size;
      return remove.call(this, type, fn, ...rest);
    };

    const observe = ResizeObserver.prototype.observe;
    const disconnect = ResizeObserver.prototype.disconnect;
    ResizeObserver.prototype.observe = function (el, ...rest) {
      if (el.className === "name-visual") {
        this.nameProbe = true;
        window.nameProbe.observers++;
      }
      return observe.call(this, el, ...rest);
    };
    ResizeObserver.prototype.disconnect = function () {
      if (this.nameProbe) {
        this.nameProbe = false;
        window.nameProbe.observers--;
      }
      return disconnect.call(this);
    };
  });
}

async function ready(page) {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".bb-entry > strong")).toHaveAttribute(
    "data-construction",
    "anticipation",
  );
}

async function cleanup(page) {
  await expect(page.locator(".name-reel,.name-bits,.name-mask")).toHaveCount(0);
  const before = await page.evaluate(() => window.nameProbe.draws);
  await page.clock.runFor(600);
  expect(
    await page.evaluate(() => ({
      draws: window.nameProbe.draws,
      observers: window.nameProbe.observers,
      listeners: window.nameProbe.listeners,
    })),
  ).toEqual({ draws: before, observers: 0, listeners: 0 });
}

for (const width of [390, 1440]) {
  test(`cipher reel decodes every character sequentially with zero layout shift at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await freeze(page);
    await instrument(page);
    await ready(page);

    const name = page.locator(".bb-entry > strong");

    // Pause CSS veil animations so clock controls the test deterministically
    await page.locator(".bb-entry").evaluate((el) =>
      el.getAnimations({ subtree: true }).forEach((a) => {
        a.pause();
        a.currentTime = 0;
      }),
    );

    const original = await name.boundingBox();
    expect(await name.ariaSnapshot()).toContain("Aritra Saha");
    await expect(name.locator('.name-visual[aria-hidden="true"]')).toHaveText(
      "Aritra Saha",
    );

    // Overlay is mounted with 10 character slots
    const overlay = name.locator(".name-reel");
    await expect(overlay).toHaveCount(1);
    const slots = overlay.locator(".reel-slot");
    await expect(slots).toHaveCount(10);

    // Layout must match an unmodified title exactly (0px deviation)
    const native = await name.evaluate((el) => {
      const clone = el.cloneNode(false);
      clone.removeAttribute("class");
      clone.textContent = "Aritra Saha";
      el.after(clone);
      const rect = clone.getBoundingClientRect();
      clone.remove();
      return { width: rect.width, height: rect.height };
    });
    expect(original.width).toBeCloseTo(native.width, 1);
    expect(original.height).toBeCloseTo(native.height, 1);

    // Initial phase: anticipation field displays programming symbols
    const initialSymbols = await overlay.evaluate((el) => {
      const faces = el.querySelectorAll(".reel-face.front");
      return Array.from(faces, (f) => f.textContent.trim());
    });
    expect(initialSymbols.length).toBe(10);
    const allowed = new Set(["0", "1", "A", "F", "7", "X", "#", "/", "{", "}"]);
    expect(initialSymbols.every((s) => allowed.has(s))).toBe(true);

    // Advance to 300ms: active independent spinning phase
    await page.clock.runFor(300);
    await expect(name).toHaveAttribute("data-construction", "constructing");

    // Verify slots execute 3D rotation transforms
    const rotatingTransforms = await overlay.evaluate((el) => {
      const cards = el.querySelectorAll(".reel-card");
      return Array.from(cards, (c) => c.style.transform);
    });
    expect(
      rotatingTransforms.some(
        (t) => t.includes("rotateX") && t !== "rotateX(0deg)",
      ),
    ).toBe(true);

    // Smooth, decelerating settling schedule:
    // Aritra: 1250ms, 1430ms, 1610ms, 1790ms, 1970ms, 2150ms
    // Pause: 2150ms - 2470ms (320ms pause)
    // Saha: 2470ms, 2680ms, 2890ms, 3100ms
    const targetChars = ["A", "r", "i", "t", "r", "a", "S", "a", "h", "a"];
    const settleTimes = [
      1250, 1430, 1610, 1790, 1970, 2150, 2470, 2680, 2890, 3100,
    ];

    let currentElapsed = 300;
    for (let i = 0; i < settleTimes.length; i++) {
      const targetTime = settleTimes[i] + 15; // slightly after settle
      await page.clock.runFor(targetTime - currentElapsed);
      currentElapsed = targetTime;

      // Verify data-letter attribute tracks settled count
      await expect(name).toHaveAttribute("data-letter", String(i + 1));

      // Verify character i has settled into target Literata letter
      const settledChar = await slots.nth(i).evaluate((slot) => {
        const front = slot.querySelector(".reel-face.front");
        return {
          isSettled: slot.classList.contains("is-settled"),
          isTarget: front.classList.contains("target"),
          text: front.textContent.trim(),
        };
      });
      expect(settledChar.isSettled).toBe(true);
      expect(settledChar.isTarget).toBe(true);
      expect(settledChar.text).toBe(targetChars[i]);

      // If in Aritra (before i=5), verify subsequent characters are still spinning
      if (i < 5) {
        const nextCharSettled = await slots
          .nth(i + 1)
          .evaluate((slot) => slot.classList.contains("is-settled"));
        expect(nextCharSettled).toBe(false);
      }

      // Check inter-word pause: at 2300ms, Aritra (6 chars) is settled, Saha (4 chars) still spinning
      if (i === 5) {
        await page.clock.runFor(150);
        currentElapsed += 150;
        await expect(name).toHaveAttribute("data-letter", "6");
        const sahaFirstSettled = await slots
          .nth(6)
          .evaluate((slot) => slot.classList.contains("is-settled"));
        expect(sahaFirstSettled).toBe(false);
      }

      // Bounding box must never deviate during animation
      const currentBox = await name.boundingBox();
      expect(currentBox.width).toBeCloseTo(original.width, 1);
      expect(currentBox.height).toBeCloseTo(original.height, 1);
      expect(currentBox.x).toBeCloseTo(original.x, 1);
      expect(currentBox.y).toBeCloseTo(original.y, 1);
    }

    // Advance to 3550ms: completion and handover to native text
    await page.clock.runFor(3550 - currentElapsed);
    await expect(name).toHaveAttribute("data-construction", "complete");

    // Overlay removed, native visual unhidden
    await expect(name.locator(".name-reel")).toHaveCount(0);
    await expect(name.locator(".name-visual")).toBeVisible();
    await expect(name.locator(".name-visual")).toHaveCSS(
      "visibility",
      "visible",
    );

    // Final geometry matches original exactly
    const finalBox = await name.boundingBox();
    expect(finalBox.width).toBeCloseTo(original.width, 1);
    expect(finalBox.height).toBeCloseTo(original.height, 1);
    expect(finalBox.x).toBeCloseTo(original.x, 1);
    expect(finalBox.y).toBeCloseTo(original.y, 1);

    await cleanup(page);

    // Escape dismisses veil cleanly
    await page.keyboard.press("Escape");
    await expect(page.locator("#pixels button:focus")).toHaveCount(1);
  });
}

for (const reason of [
  "Escape",
  "Tab",
  "hidden",
  "motion",
  "manual-motion",
  "resize",
  "navigation",
  "pagehide",
  "data-saving",
]) {
  test(`cipher reel releases its resources on ${reason}`, async ({ page }) => {
    await freeze(page);
    await instrument(page);
    if (reason === "data-saving")
      await page.addInitScript(() => {
        const connection = new EventTarget();
        connection.saveData = false;
        Object.defineProperty(navigator, "connection", { value: connection });
      });

    await ready(page);
    await page.clock.runFor(200);

    if (["Escape", "Tab"].includes(reason)) await page.keyboard.press(reason);
    if (reason === "motion")
      await page.emulateMedia({ reducedMotion: "reduce" });
    if (reason === "manual-motion")
      await page.evaluate(() => {
        document.documentElement.dataset.motion = "reduce";
      });
    if (reason === "resize")
      await page.setViewportSize({ width: 600, height: 800 });
    if (reason === "navigation")
      await page.evaluate(() => {
        location.hash = "seedl";
      });
    if (reason === "pagehide")
      await page.evaluate(() => window.dispatchEvent(new Event("pagehide")));
    if (reason === "hidden")
      await page.evaluate(() => {
        Object.defineProperty(document, "hidden", { value: true });
        document.dispatchEvent(new Event("visibilitychange"));
      });
    if (reason === "data-saving")
      await page.evaluate(() => {
        navigator.connection.saveData = true;
        navigator.connection.dispatchEvent(new Event("change"));
      });

    await cleanup(page);

    if (reason === "resize") {
      await expect(page.locator(".name-visual")).toBeVisible();
      await expect(page.locator(".name-visual")).toHaveCSS(
        "visibility",
        "visible",
      );
    } else {
      await expect(page.locator(".bb-entry")).toHaveCount(0);
    }

    if (reason === "Escape")
      await expect(page.locator("#pixels button").first()).toBeFocused();
    if (reason === "Tab") await expect(page.locator("#specimen")).toBeFocused();
  });
}

for (const failure of ["font-failed", "font-slow"]) {
  test(`${failure} falls back to readable text within the original welcome deadline`, async ({
    page,
  }) => {
    await freeze(page);
    await instrument(page);
    let release;
    const held = new Promise((resolve) => {
      release = resolve;
    });

    if (failure.startsWith("font"))
      await page.route("**/Literata*.woff2", async (route) => {
        if (failure === "font-slow") {
          await held;
          await route.continue();
        } else await route.abort();
      });

    try {
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await expect(page.locator(".bb-entry")).toBeVisible();
      await page.clock.runFor(400);
      await expect(page.locator(".bb-entry > strong")).toHaveAttribute(
        "data-construction",
        "fallback",
      );
      await expect(page.locator(".name-visual")).toHaveText("Aritra Saha");
      await expect(page.locator(".name-visual")).toHaveCSS(
        "visibility",
        "visible",
      );
      await cleanup(page);
    } finally {
      release();
    }

    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator(".name-reel")).toHaveCount(0);
    await page.clock.runFor(5000);
    await expect(page.locator(".bb-entry")).toHaveCount(0);
    await expect(page.locator("h1")).toBeVisible();
  });
}

test("dismissing during font preparation cannot mount late resources", async ({
  page,
}) => {
  await freeze(page);
  await instrument(page);
  let release;
  const held = new Promise((resolve) => {
    release = resolve;
  });
  await page.route("**/Literata*.woff2", async (route) => {
    await held;
    await route.continue();
  });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".name-pending")).toHaveCount(1);
  await page.keyboard.press("Escape");
  release();
  await page.evaluate(() => document.fonts.ready);
  await cleanup(page);
  await expect(page.locator(".bb-entry")).toHaveCount(0);
});

for (const mode of ["manual", "query", "animation-unavailable"]) {
  test(`${mode} bypasses construction and keeps the homepage readable`, async ({
    page,
  }) => {
    if (mode === "manual")
      await page.addInitScript(() =>
        localStorage.setItem("portfolio-reduced-motion", "true"),
      );
    if (mode === "animation-unavailable")
      await page.addInitScript(() => {
        Element.prototype.animate = undefined;
      });
    await page.goto(mode === "query" ? "/?motion=reduce" : "/");
    await expect(page.locator(".bb-entry,.name-reel,.name-bits")).toHaveCount(
      0,
    );
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("#pixels button")).toHaveCount(64);
  });
}

test("animated welcome visually protects native wordmark until cipher reel reveals it with zero duplication", async ({
  page,
}) => {
  await freeze(page);
  await instrument(page);
  let releaseFont;
  const fontHeld = new Promise((resolve) => {
    releaseFont = resolve;
  });
  await page.route("**/Literata*.woff2", async (route) => {
    await fontHeld;
    await route.continue();
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  const strong = page.locator(".bb-entry > strong");
  await expect(strong).toHaveClass(/name-pending/);
  const visual = strong.locator(".name-visual");
  await expect(visual).toHaveCSS("visibility", "hidden");

  const visibleTextBeforeReel = await strong.evaluate((el) => {
    const vis = el.querySelector(".name-visual");
    return vis && getComputedStyle(vis).visibility !== "hidden";
  });
  expect(visibleTextBeforeReel).toBe(false);

  releaseFont();
  await page.evaluate(() => document.fonts.ready);
  await expect(strong).toHaveAttribute("data-construction", "anticipation");

  const overlay = strong.locator(".name-reel");
  await expect(overlay).toBeVisible();

  const initialSymbols = await overlay.evaluate((el) => {
    const faces = el.querySelectorAll(".reel-face.front");
    return Array.from(faces, (f) => f.textContent.trim());
  });
  const allowed = new Set(["0", "1", "A", "F", "7", "X", "#", "/", "{", "}"]);
  expect(initialSymbols.length).toBe(10);
  expect(initialSymbols.every((s) => allowed.has(s))).toBe(true);

  await page.clock.runFor(500);
  await expect(strong).toHaveAttribute("data-construction", "constructing");
  await expect(visual).toHaveCSS("visibility", "hidden");

  await page.clock.runFor(3100);
  await expect(strong).toHaveAttribute("data-construction", "complete");

  await expect(overlay).toHaveCount(0);
  await expect(visual).toHaveCSS("visibility", "visible");
  await expect(visual).toBeVisible();
  await expect(visual).toHaveText("Aritra Saha");

  await cleanup(page);
});
