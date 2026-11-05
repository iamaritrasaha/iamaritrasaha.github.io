import { test, expect } from "@playwright/test";

async function holdModel(page) {
  let release;
  const ready = new Promise((resolve) => {
    release = resolve;
  });
  await page.route("**/assets/digit-model.js*", async (route) => {
    await ready;
    await route.continue();
  });
  return release;
}
async function freezeClock(page) {
  const time = new Date("2026-11-05T00:00:00Z");
  await page.clock.install({ time });
  await page.clock.pauseAt(time);
}
const front = (page) =>
  page.evaluate(() => {
    const el = document.elementFromPoint(innerWidth / 2, innerHeight / 2);
    return {
      cover: Boolean(el?.closest("#welcome-paint")),
      welcome: Boolean(el?.closest(".bb-entry")),
      main: Boolean(el?.closest("main")),
    };
  });

test("a delayed model never paints the homepage before the welcome", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.preWelcomeFrames = [];
    function sample() {
      const state = document.documentElement.dataset.welcomeState;
      if (state === "running" || state === "bypassed") return;
      const el = document.elementFromPoint(innerWidth / 2, innerHeight / 2);
      if (el)
        window.preWelcomeFrames.push(Boolean(el.closest("main, .site-header")));
      requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  });
  const release = await holdModel(page);
  try {
    await page.goto("/", { waitUntil: "commit" });
    await expect(page.locator("#welcome-paint")).toBeVisible();
    await expect(page.locator(".bb-entry")).toHaveCount(0);
    await page.waitForTimeout(200);
    expect((await front(page)).cover).toBe(true);
    expect((await front(page)).main).toBe(false);
    expect(
      await page.evaluate(() => window.preWelcomeFrames.length),
    ).toBeGreaterThan(0);
    expect(
      await page.evaluate(() => window.preWelcomeFrames.some(Boolean)),
    ).toBe(false);
  } finally {
    release();
  }
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator("#welcome-paint")).toHaveCount(0);
  expect((await front(page)).welcome).toBe(true);
  await expect(page.locator(".epoch-label")).toContainText("INTRO EPOCH");
  await page.keyboard.press("Escape");
  await expect(page.locator("html")).toHaveAttribute(
    "data-welcome-state",
    "complete",
  );
});

test("a stalled model releases the page and cannot open a late welcome", async ({
  page,
}) => {
  await freezeClock(page);
  const release = await holdModel(page);
  try {
    await page.goto("/", { waitUntil: "commit" });
    await expect(page.locator("#welcome-paint")).toBeVisible();
    await page.clock.runFor(4200);
    await expect(page.locator("#welcome-paint")).toHaveCount(0);
    await expect(page.locator("html")).toHaveAttribute(
      "data-welcome-state",
      "bypassed",
    );
    expect((await front(page)).main).toBe(true);
  } finally {
    release();
  }
  await expect(page.locator("#pixels button")).toHaveCount(64);
  await expect(page.locator(".bb-entry")).toHaveCount(0);
  await page.locator("#specimen").click();
  await expect(page.locator("#confidence")).toContainText("% probability");
});

for (const key of ["Escape", "Tab"]) {
  test(`${key} cancels a pending welcome without a later focus interruption`, async ({
    page,
  }) => {
    const release = await holdModel(page);
    try {
      await page.goto("/", { waitUntil: "commit" });
      await expect(page.locator("#welcome-paint")).toBeVisible();
      await page.keyboard.press(key);
      await expect(page.locator("html")).toHaveAttribute(
        "data-welcome-state",
        "bypassed",
      );
      await expect(page.locator("#welcome-paint")).toHaveCount(0);
    } finally {
      release();
    }
    await expect(page.locator("#pixels button")).toHaveCount(64);
    await expect(page.locator(".bb-entry")).toHaveCount(0);
    if (key === "Tab")
      await expect(
        page.getByRole("link", { name: "Skip to content" }),
      ).toBeFocused();
  });
}

test("a motion preference change cancels the early cover immediately", async ({
  page,
}) => {
  const release = await holdModel(page);
  try {
    await page.goto("/", { waitUntil: "commit" });
    await expect(page.locator("#welcome-paint")).toBeVisible();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.locator("html")).toHaveAttribute(
      "data-welcome-state",
      "bypassed",
    );
    await expect(page.locator("#welcome-paint")).toHaveCount(0);
  } finally {
    release();
  }
  await expect(page.locator("#pixels button")).toHaveCount(64);
  await expect(page.locator(".bb-entry")).toHaveCount(0);
});

test("a failed intro module cannot leave a permanent cover", async ({
  page,
}) => {
  await freezeClock(page);
  await page.route("**/assets/bitbench.js*", (route) => route.abort());
  await page.goto("/", { waitUntil: "commit" });
  await expect(page.locator("#welcome-paint")).toBeVisible();
  await page.clock.runFor(4200);
  await expect(page.locator("html")).toHaveAttribute(
    "data-welcome-state",
    "bypassed",
  );
  await expect(page.locator("#welcome-paint")).toHaveCount(0);
  await expect(page.locator("h1")).toBeVisible();
  expect((await front(page)).main).toBe(true);
});

test("a blocked early script bypasses the intro while the classifier remains usable", async ({
  page,
}) => {
  await page.route("**/assets/welcome-start.js*", (route) => route.abort());
  await page.goto("/");
  await expect(page.locator("#welcome-paint")).toBeHidden();
  await expect(page.locator(".bb-entry")).toHaveCount(0);
  await expect(page.locator("#pixels button")).toHaveCount(64);
  await page.locator("#inspect").click();
  await expect(page.locator("#layer-note")).toContainText("Layer 2");
});

test("no-JavaScript and fragment navigation bypass the cover", async ({
  page,
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
  });
  const plain = await context.newPage();
  await plain.goto("/");
  await expect(plain.locator("#welcome-paint")).toBeHidden();
  await expect(plain.locator("h1")).toBeVisible();
  await expect(plain.locator(".nav-panel a").first()).toBeVisible();
  await context.close();
  await page.goto("/#pulseshift");
  await expect(page.locator("html")).toHaveAttribute(
    "data-welcome-state",
    "bypassed",
  );
  await expect(page.locator("#welcome-paint")).toBeHidden();
  await expect(page.locator(".bb-entry")).toHaveCount(0);
  await expect(page.locator(".pulse-kicker")).toHaveText(
    "SIMULATED RPM · VISUAL PREVIEW",
  );
});
