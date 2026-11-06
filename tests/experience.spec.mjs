import { test, expect } from "@playwright/test";

for (const route of ["/", "/embedded/", "/explorations/"]) {
  test(`keyboard exit closes mobile navigation on ${route}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(route);
    await page.locator(".menu-toggle").click();
    await page.locator("#nav-panel a").last().focus();
    await page.keyboard.press("Tab");
    await expect(page.locator(".menu-toggle")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(
      await page
        .locator(".nav")
        .evaluate((el) => el.contains(document.activeElement)),
    ).toBe(false);
    await page.locator(".menu-toggle").click();
    await page.keyboard.press("Tab");
    await expect(page.locator("#nav-panel a").first()).toBeFocused();
    await expect(page.locator(".menu-toggle")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await page.keyboard.press("Escape");
    await expect(page.locator(".menu-toggle")).toBeFocused();
  });
}

test("theme and motion preferences synchronize between real tabs", async ({
  context,
  page,
}) => {
  await page.emulateMedia({
    colorScheme: "light",
    reducedMotion: "no-preference",
  });
  await page.goto("/#work");
  const lab = await context.newPage();
  await lab.emulateMedia({
    colorScheme: "light",
    reducedMotion: "no-preference",
  });
  await lab.goto("/embedded/");
  await expect(lab.locator("#lab-duty")).toBeVisible();
  await page.locator("#theme-select").selectOption("dark");
  await expect(lab.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(lab.locator("#theme-select")).toHaveValue("dark");
  await lab.locator("#theme-select").selectOption("light");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await lab.locator("[data-lab-motion]").first().click();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduce");
  await expect(page.locator("[data-motion-toggle]").first()).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.locator("[data-motion-toggle]").first().click();
  await expect(lab.locator("html")).toHaveAttribute("data-motion", "full");
  await lab.goto("/embedded/?motion=reduce");
  await page.locator("[data-motion-toggle]").first().click();
  await page.locator("[data-motion-toggle]").first().click();
  await expect(lab.locator("html")).toHaveAttribute("data-motion", "reduce");
  await lab.evaluate(() => localStorage.clear());
  await expect(page.locator("#theme-select")).toHaveValue("system");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "full");
});

test("a preference from another tab cancels a pending welcome", async ({
  context,
  page,
}) => {
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  const lab = await context.newPage();
  await lab.goto("/embedded/");
  await expect(lab.locator("[data-lab-motion]").first()).toBeVisible();
  await page.route(/bitbench\.js/, async (route) => {
    await gate;
    await route.continue();
  });
  try {
    await page.goto("/", { waitUntil: "commit" });
    await expect(page.locator("html")).toHaveAttribute(
      "data-welcome-state",
      "pending",
    );
    await lab
      .locator("[data-lab-motion]")
      .first()
      .evaluate((el) => el.click());
    await expect(page.locator("html")).toHaveAttribute(
      "data-welcome-state",
      "bypassed",
    );
    await expect(page.locator("#welcome-paint")).toHaveCount(0);
  } finally {
    release();
    await page.waitForLoadState("load");
  }
  await expect(page.locator(".bb-entry")).toHaveCount(0);
});

test("paused PWM remains on the waveform after input changes and resizing", async ({
  page,
}) => {
  await page.goto("/embedded/");
  await page.locator("#timing").scrollIntoViewIfNeeded();
  await page.waitForFunction(() => {
    const svg = document.getElementById("lab-pwm-svg"),
      dot = svg.querySelector(".lab-scan-dot");
    const progress =
      (+dot.getAttribute("cx") - 32) / (svg.viewBox.baseVal.width - 64);
    return (
      progress > 0.23 && progress < 0.4 && dot.getAttribute("cy") === "152"
    );
  });
  await page
    .locator("[data-lab-motion]")
    .first()
    .evaluate((el) => el.click());
  const time = await page
    .locator("#lab-pwm-svg")
    .evaluate(
      (svg) =>
        ((+svg.querySelector(".lab-scan-dot").getAttribute("cx") - 32) /
          (svg.viewBox.baseVal.width - 64)) *
        0.002,
    );
  for (const [duty, frequency] of [
    [90, 1000],
    [10, 1000],
    [35, 500],
    [90, 2000],
  ]) {
    await page.locator("#lab-duty").fill(String(duty));
    await page.locator("#lab-frequency").selectOption(String(frequency));
    const expected =
      time % (1 / frequency) < duty / 100 / frequency ? "48" : "152";
    await expect(page.locator(".lab-scan-dot")).toHaveAttribute("cy", expected);
    await expect(page.locator("#lab-duty")).toHaveAttribute(
      "aria-valuetext",
      `${duty} percent duty cycle`,
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() =>
      page
        .locator("#lab-pwm-svg")
        .evaluate((svg) =>
          Math.round(
            ((+svg.querySelector(".lab-scan-dot").getAttribute("cx") - 32) /
              (svg.viewBox.baseVal.width - 64)) *
              2000000,
          ),
        ),
    )
    .toBe(Math.round(time * 1e9));
  await page.locator("#lab-voltage").fill("8.5");
  await expect(page.locator("#lab-voltage")).toHaveAttribute(
    "aria-valuetext",
    "8.5 volts",
  );
});

test("reduced-motion PWM has a meaningful correct static marker", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/embedded/");
  await expect(page.locator("#lab-duty")).toBeVisible();
  await expect(page.locator(".lab-scan-dot")).toHaveAttribute("cx", "32");
  await expect(page.locator(".lab-scan-dot")).toHaveAttribute("cy", "48");
  await page.locator("#lab-duty").fill("10");
  await expect(page.locator(".lab-scan-dot")).toHaveAttribute("cy", "48");
  await expect(page.locator("html")).toHaveAttribute(
    "data-lab-running",
    "false",
  );
});

test("forced colors preserve digit intensity and visible graphical feedback", async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await page.goto("/");
  test.skip(
    !(await page.evaluate(() => matchMedia("(forced-colors: active)").matches)),
    "Forced-color emulation is unavailable in this browser.",
  );
  await expect(page.locator("#layer-note")).toContainText(
    "Striped bars are negative",
  );
  expect(
    await page
      .locator("#activations .negative")
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundImage),
  ).toContain("repeating-linear-gradient");
  const pixels = page.locator("#pixels button");
  expect(
    await pixels.evaluateAll(
      (es) =>
        new Set(es.map((el) => getComputedStyle(el).backgroundColor)).size,
    ),
  ).toBeGreaterThan(2);
  await pixels.first().focus();
  expect(
    await pixels.first().evaluate((el) => getComputedStyle(el).boxShadow),
  ).not.toBe("none");
  const before = await pixels.first().getAttribute("aria-label");
  await page.keyboard.press("Space");
  await expect(pixels.first()).not.toHaveAttribute("aria-label", before);
  for (const selector of ["#activations", "#distribution", ".neuron-network"])
    expect(
      await page
        .locator(selector)
        .evaluate((el) => getComputedStyle(el).forcedColorAdjust),
    ).toBe("none");
  expect(
    await page
      .locator("body")
      .evaluate((el) => getComputedStyle(el).forcedColorAdjust),
  ).toBe("auto");
});

test("moved RPM illustration retains forced-color feedback", async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await page.goto("/embedded/#pulseshift");
  expect(
    await page
      .locator(".pulse-board")
      .evaluate((el) => getComputedStyle(el).forcedColorAdjust),
  ).toBe("none");
});

for (const javaScriptEnabled of [true, false]) {
  test(`notebook section links work with JavaScript ${javaScriptEnabled}`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      javaScriptEnabled,
      reducedMotion: "reduce",
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await page.goto(new URL("/embedded/", baseURL).href);
    await expect(
      page
        .getByRole("navigation", { name: "Notebook sections" })
        .getByRole("link"),
    ).toHaveCount(5);
    for (const id of [
      "circuits",
      "timing",
      "communication",
      "firmware",
      "projects",
    ]) {
      await page.locator(`.lab-notebook-nav a[href="#${id}"]`).click();
      await expect(page.locator(`#${id}`)).toBeFocused();
      expect(new URL(page.url()).hash).toBe("#" + id);
    }
    await context.close();
  });
}
