import { test, expect } from "@playwright/test";

async function freeze(page) {
  const time = new Date("2026-11-06T12:00:00Z");
  await page.clock.install({ time });
  await page.clock.pauseAt(time);
}

// Observe actual Canvas output and lifecycle, without a production test API.
async function instrument(page) {
  await page.addInitScript(() => {
    window.nameProbe = {
      bits: [],
      fragments: [],
      draws: 0,
      observers: 0,
      listeners: 0,
    };
    const proto = CanvasRenderingContext2D.prototype;
    const fill = proto.fillText,
      clear = proto.clearRect,
      read = proto.getImageData,
      draw = proto.drawImage;
    proto.drawImage = function (source, ...args) {
      if (
        source === window.nameProbe.raster &&
        this.canvas.className === "name-bits"
      )
        window.nameProbe.fragments.push(args);
      return draw.call(this, source, ...args);
    };
    proto.fillText = function (text, ...args) {
      if (this.canvas.className === "name-bits") {
        const m = this.getTransform();
        const dpr = Math.min(devicePixelRatio, 2);
        window.nameProbe.bits.push({
          text,
          x: m.e / dpr + parseFloat(this.canvas.style.left),
          y: m.f / dpr + parseFloat(this.canvas.style.top),
          alpha: this.globalAlpha,
        });
        window.nameProbe.draws++;
      }
      return fill.call(this, text, ...args);
    };
    proto.clearRect = function (...args) {
      if (this.canvas.className === "name-bits") {
        window.nameProbe.bits = [];
        window.nameProbe.fragments = [];
      }
      return clear.apply(this, args);
    };
    proto.getImageData = function (...args) {
      const result = read.apply(this, args);
      if (this.font.includes("Literata") && this.canvas.className === "") {
        window.nameProbe.ink = result;
        window.nameProbe.raster = this.canvas;
      }
      return result;
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
  await expect(page.locator(".name-bits,.name-mask")).toHaveCount(0);
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
  test(`binary symbols construct every glyph sequentially in the unchanged native layout at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await freeze(page);
    await instrument(page);
    await ready(page);
    const name = page.locator(".bb-entry > strong");
    // Playwright's JS clock and the browser's CSS animation timeline are separate.
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
    await expect(name.locator('canvas[aria-hidden="true"]')).toHaveCount(1);
    // Full text always owns the layout; compare against an unmodified title.
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
    await page.clock.runFor(80);
    const initial = await page.evaluate(() => window.nameProbe.bits);
    await page.clock.runFor(220);
    const half = await page.evaluate(() => window.nameProbe.bits);
    expect(half).not.toEqual(initial);
    expect(half.length).toBeGreaterThan(initial.length);
    expect(initial.every((p) => p.text === "0" || p.text === "1")).toBe(true);
    expect(await page.evaluate(() => window.nameProbe.fragments.length)).toBe(
      0,
    );
    await expect(name.locator("svg,mask,clipPath")).toHaveCount(0);
    let elapsed = 300;
    let start = 180;
    for (let index = 0; index < 10; index++) {
      if (index === 6) start += 70;
      const duration = index === 0 ? 420 : 260;
      const at = start + duration * 0.71;
      await page.clock.runFor(at - elapsed);
      elapsed = at;
      await expect(name).toHaveAttribute("data-letter", String(index));
      const formation = await name.evaluate((el, index) => {
        const { bits, ink, fragments } = window.nameProbe;
        const scale = Math.min(devicePixelRatio, 2);
        const active = bits.filter((p) => p.alpha === 1);
        const visual = el.querySelector(".name-visual");
        const range = document.createRange();
        const character = index < 6 ? index : index + 1;
        range.setStart(visual.firstChild, character);
        range.setEnd(visual.firstChild, character + 1);
        const glyph = range.getBoundingClientRect();
        const base = visual.getBoundingClientRect();
        return {
          count: active.length,
          occupied: active.every(
            (p) =>
              ink.data[
                (Math.floor(p.y * scale) * ink.width +
                  Math.floor(p.x * scale)) *
                  4 +
                  3
              ] > 0,
          ),
          withinGlyph: active.every(
            (p) =>
              p.x >= glyph.left - base.left - 1 &&
              p.x <= glyph.right - base.left + 1,
          ),
          fragments: fragments.length,
        };
      }, index);
      expect(formation.count).toBeGreaterThan(5);
      expect(formation.count).toBeLessThanOrEqual(180);
      expect(formation.occupied).toBe(true);
      expect(formation.withinGlyph).toBe(true);
      // The binary silhouette exists before any of its raster material grows.
      expect(formation.fragments).toBe(0);
      const box = await name.boundingBox();
      expect(box).toEqual(original);
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
      await page.clock.runFor(duration * 0.25);
      elapsed += duration * 0.25;
      await expect(name).toHaveAttribute("data-letter", String(index));
      const joining = await page.evaluate(() => window.nameProbe.fragments);
      expect(joining.length).toBe(formation.count);
      // Actual raster pieces expand spatially from the occupied targets.
      expect(joining.every((p) => p[6] > 0 && p[7] > 0)).toBe(true);
      start += duration;
    }
    await page.clock.runFor(3300 - elapsed);
    await expect(name).toHaveAttribute("data-construction", "complete");
    await expect(name.locator(".name-visual")).toHaveCSS("mask-image", "none");
    expect(await name.boundingBox()).toEqual(original);
    expect(await name.ariaSnapshot()).toContain("Aritra Saha");
    await cleanup(page);
    await expect(name).toHaveCSS("opacity", "1");
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
  test(`construction releases its resources on ${reason}`, async ({ page }) => {
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
        "mask-image",
        "none",
      );
    } else await expect(page.locator(".bb-entry")).toHaveCount(0);
    if (reason === "Escape")
      await expect(page.locator("#pixels button").first()).toBeFocused();
    if (reason === "Tab") await expect(page.locator("#specimen")).toBeFocused();
  });
}

for (const failure of ["font-failed", "font-slow", "canvas", "readback"]) {
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
    if (failure === "canvas")
      await page.addInitScript(() => {
        HTMLCanvasElement.prototype.getContext = () => null;
      });
    if (failure === "readback")
      await page.addInitScript(() => {
        CanvasRenderingContext2D.prototype.getImageData = () => {
          throw new Error("Readback unavailable");
        };
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
      await expect(page.locator(".name-visual")).toHaveCSS(
        "mask-image",
        "none",
      );
      await cleanup(page);
    } finally {
      release();
    }
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator(".name-bits")).toHaveCount(0);
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
    await expect(page.locator(".bb-entry,.name-bits,.name-mask")).toHaveCount(
      0,
    );
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("#pixels button")).toHaveCount(64);
  });
}
