import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const widths = [
  320, 360, 375, 390, 430, 600, 768, 1024, 1280, 1366, 1440, 1920, 2560,
];
async function reflow(page) {
  const result = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    const outside = [
      ...document.querySelectorAll(
        "h1,h2,h3,p,button,select,summary,figcaption,nav,article,section,fieldset",
      ),
    ]
      .filter((el) => {
        if (!el.getClientRects().length || el.closest(".sr-only")) return false;
        const r = el.getBoundingClientRect();
        return (
          r.width &&
          (r.right > width + 1 ||
            r.left < -1 ||
            (el.scrollWidth > el.clientWidth + 2 &&
              getComputedStyle(el).overflowX === "visible" &&
              el.clientWidth))
        );
      })
      .map(
        (el) =>
          `${el.tagName}.${el.className}: ${el.textContent.trim().slice(0, 30)}`,
      );
    const clipped = [...document.querySelectorAll("body *")]
      .filter(
        (el) =>
          el.clientHeight &&
          el.textContent.trim() &&
          !el.closest("svg,.sr-only") &&
          ["hidden", "clip"].includes(getComputedStyle(el).overflowY) &&
          el.scrollHeight > el.clientHeight + 2,
      )
      .map((el) => el.className);
    return {
      width,
      scroll: document.documentElement.scrollWidth,
      outside,
      clipped,
    };
  });
  expect(result.scroll).toBeLessThanOrEqual(result.width + 1);
  expect(result.outside).toEqual([]);
  expect(result.clipped).toEqual([]);
}
for (const width of widths)
  test(`embedded ${width}px: themes, 200% text and spacing`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/embedded/");
    await page.evaluate(() => document.fonts.ready);
    for (const theme of ["light", "dark"]) {
      await page.locator("#theme-select").selectOption(theme);
      await reflow(page);
    }
    for (const mode of [
      "html{font-size:200%!important}",
      "*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}",
    ]) {
      const style = await page.addStyleTag({ content: mode });
      for (const protocol of ["uart", "i2c", "spi", "can"]) {
        await page.locator(`[data-protocol="${protocol}"]`).click();
        await reflow(page);
      }
      for (const code of ["loop", "pwm", "interrupt"]) {
        await page.locator(`[data-code="${code}"]`).click();
        await reflow(page);
      }
      await page
        .locator(".lab-project-status")
        .evaluate((el) => (el.open = true));
      await reflow(page);
      await style.evaluate((el) => el.remove());
    }
  });
test("embedded controls calculate current, power and PWM timing", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/embedded/");
  await expect(page.locator("#lab-current")).toHaveText("22.73");
  await page.locator("#lab-voltage").fill("10");
  await page.locator("#lab-resistance").selectOption("1000");
  await expect(page.locator("#lab-current")).toHaveText("10.00");
  await expect(page.locator("#lab-power")).toHaveText("100.00");
  await page.locator("#lab-duty").fill("75");
  await page.locator("#lab-frequency").selectOption("2000");
  await expect(page.locator("#lab-pwm-summary")).toHaveText(
    "75% duty · T = 500 µs · t_on = 375 µs · f = 2,000 Hz",
  );
  await expect(page.locator("#pwm-svg-title")).toContainText(
    "High for 375 microseconds",
  );
  await page.locator('[data-protocol="can"]').click();
  await expect(page.locator("#protocol-can")).toBeVisible();
  await expect(page.locator("#protocol-uart")).toBeHidden();
  await expect(page.locator("#protocol-can")).toContainText("receive-only");
});
test("embedded mobile navigation, preferences and keyboard controls", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto("/");
  await page.locator("#theme-select").selectOption("dark");
  await page.locator(".menu-toggle").tap();
  await page.getByRole("link", { name: "Embedded Lab", exact: true }).tap();
  await expect(page).toHaveURL(/\/embedded\/$/);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("#lab-duty")).toBeVisible();
  await page.locator("#lab-duty").focus();
  const before = +(await page.locator("#lab-duty").inputValue());
  await page.keyboard.press("ArrowRight");
  expect(+(await page.locator("#lab-duty").inputValue())).toBeGreaterThan(
    before,
  );
  await page.locator('[data-protocol="spi"]').focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#protocol-spi")).toBeVisible();
  await page.locator(".menu-toggle").tap();
  await page.keyboard.press("Escape");
  await expect(page.locator(".menu-toggle")).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  await page.locator(".menu-toggle").tap();
  await page.getByRole("link", { name: "Portfolio", exact: true }).tap();
  await expect(page).toHaveURL(/\/$/);
  await context.close();
});
test("embedded drawings pause offscreen, hidden and with the shared motion setting", async ({
  page,
}) => {
  await page.goto("/embedded/");
  await expect(page.locator("html")).toHaveAttribute(
    "data-lab-running",
    "true",
  );
  const point = page.locator(".lab-cover-point"),
    start = await point.getAttribute("cx");
  await expect.poll(() => point.getAttribute("cx")).not.toBe(start);
  await page.locator("#firmware").scrollIntoViewIfNeeded();
  await expect(page.locator("html")).toHaveAttribute(
    "data-lab-running",
    "false",
  );
  const stopped = await point.getAttribute("cx");
  await page.waitForTimeout(100);
  expect(await point.getAttribute("cx")).toBe(stopped);
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await expect(page.locator("html")).toHaveAttribute(
    "data-lab-running",
    "true",
  );
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.locator("html")).toHaveAttribute(
    "data-lab-running",
    "false",
  );
  await page.evaluate(() => {
    delete document.hidden;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.locator("[data-lab-motion]").first().click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-lab-running",
    "false",
  );
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduce");
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduce");
});
test("embedded fallback, reduced motion, data saving and short landscape", async ({
  browser,
  page,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 568 },
  });
  const fallback = await context.newPage();
  await fallback.goto("/embedded/");
  for (const protocol of ["uart", "i2c", "spi", "can"])
    await expect(fallback.locator(`#protocol-${protocol}`)).toBeVisible();
  await expect(fallback.locator("#lab-current")).toHaveText("22.73");
  await expect(fallback.locator("#lab-voltage")).toBeHidden();
  await reflow(fallback);
  await context.close();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/embedded/");
  await expect(page.locator("html")).toHaveAttribute(
    "data-lab-running",
    "false",
  );
  for (const [width, height] of [
    [568, 320],
    [844, 390],
    [320, 234],
  ]) {
    await page.setViewportSize({ width, height });
    await reflow(page);
  }
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "connection", {
      value: { saveData: true, addEventListener() {} },
    }),
  );
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute(
    "data-lab-running",
    "false",
  );
});
test("embedded AA automated accessibility in both themes and all protocol panels", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/embedded/");
  for (const theme of ["light", "dark"]) {
    await page.locator("#theme-select").selectOption(theme);
    for (const protocol of ["uart", "i2c", "spi", "can"]) {
      await page.locator(`[data-protocol="${protocol}"]`).click();
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(result.violations).toEqual([]);
    }
  }
});

test("shared navigation works while application modules are delayed", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const modules = /\/(script|embedded|bitbench|creative)\.js(?:\?|$)/;
  for (const path of ["/", "/embedded/"]) {
    let release;
    const gate = new Promise((resolve) => {
      release = resolve;
    });
    await page.route(modules, async (route) => {
      await gate;
      await route.continue();
    });
    try {
      await page.goto(path, { waitUntil: "commit" });
      await expect(page.locator(".nav")).toHaveClass(/nav-ready/);
      await page.locator(".menu-toggle").click();
      await expect(page.locator("#nav-panel")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.locator(".menu-toggle")).toHaveAttribute(
        "aria-expanded",
        "false",
      );
    } finally {
      release();
      await page.waitForLoadState("load");
      await page.unroute(modules);
    }
  }
});
