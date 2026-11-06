import { test, expect } from "@playwright/test";
const widths = [
  320, 360, 375, 390, 430, 600, 768, 1024, 1280, 1366, 1440, 1920, 2560,
];
const spacing =
  "*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}";
async function checkReflow(page) {
  const problems = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    const outside = [
      ...document.querySelectorAll(
        "h1,h2,h3,h4,p,button,select,summary,figcaption,nav,article,section",
      ),
    ]
      .filter((el) => {
        if (!el.getClientRects().length || el.closest(".sr-only,.welcome-math"))
          return false;
        const r = el.getBoundingClientRect();
        return (
          r.width &&
          (r.right > width + 1 ||
            r.left < -1 ||
            (el.scrollWidth > el.clientWidth + 2 &&
              getComputedStyle(el).overflowX === "visible" &&
              el.clientWidth > 0))
        );
      })
      .map(
        (el) =>
          `${el.tagName}.${el.className}: ${el.textContent.trim().slice(0, 45)}`,
      );
    const clipped = [...document.querySelectorAll("body *")]
      .filter(
        (el) =>
          el.clientHeight &&
          el.textContent.trim() &&
          !el.closest("svg,.sr-only,.neuron-announcement") &&
          ["hidden", "clip"].includes(getComputedStyle(el).overflowY) &&
          el.scrollHeight > el.clientHeight + 2,
      )
      .map((el) => `${el.tagName}.${el.className}`);
    return {
      width,
      scroll: document.documentElement.scrollWidth,
      outside,
      clipped,
    };
  });
  expect(problems.scroll).toBeLessThanOrEqual(problems.width + 1);
  expect(problems.outside).toEqual([]);
  expect(problems.clipped).toEqual([]);
}
for (const width of widths) {
  test(`${width}px: both themes, enlarged text, spacing and section reflow`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    for (const theme of ["light", "dark"]) {
      await page.locator("#theme-select").selectOption(theme);
      await checkReflow(page);
    }
    const before = await page
      .locator(".seedl-story > p:not(.stack-line)")
      .first()
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    const enlarged = await page.addStyleTag({
      content: "html{font-size:200%!important}",
    });
    expect(
      await page
        .locator(".seedl-story > p:not(.stack-line)")
        .first()
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
    ).toBe(before * 2);
    await checkReflow(page);
    await enlarged.evaluate((el) => el.remove());
    await page.addStyleTag({ content: spacing });
    await checkReflow(page);
    for (const id of ["seedl", "infera", "orion"]) {
      await page.locator(`#${id} details`).evaluate((el) => (el.open = true));
    }
    await checkReflow(page);
  });
}
for (const [width, height, textScale = 100] of [
  [320, 568],
  [390, 844],
  [600, 900],
  [768, 1024],
  [1024, 768],
  [1440, 900],
  [2560, 1440],
  [568, 320],
  [320, 234],
  [844, 390],
  [1280, 500],
  [390, 844, 200],
  [1440, 900, 200],
]) {
  test(`welcome ${width}×${height}, text ${textScale}%: complete formulas remain within the manuscript`, async ({
    page,
  }) => {
    const time = new Date("2026-11-05");
    await page.clock.install({ time });
    await page.clock.pauseAt(time);
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    if (textScale !== 100)
      await page.addStyleTag({
        content: `html{font-size:${textScale}%!important}`,
      });
    await expect(page.locator(".manuscript-note")).toHaveCount(0);
    for (const t of [2000, 3700]) {
      const collisions = await page.evaluate((t) => {
        const v = document.querySelector(".bb-entry");
        v.getAnimations({ subtree: true }).forEach((a) => {
          a.pause();
          a.currentTime = t;
        });
        const core = [
          ...v.querySelectorAll(
            ":scope > strong,:scope > small,.boot-grid,.epoch-meter",
          ),
        ].map((e) => e.getBoundingClientRect());
        const issues = [];
        for (const e of v.querySelectorAll(".math-group")) {
          if (!e.getClientRects().length || +getComputedStyle(e).opacity < 0.5)
            continue;
          const r = e.getBoundingClientRect();
          if (
            core.some(
              (c) =>
                r.left < c.right &&
                r.right > c.left &&
                r.top < c.bottom &&
                r.bottom > c.top,
            )
          )
            issues.push(e.className + " overlaps identity");
          for (const l of e.querySelectorAll("[data-equation]")) {
            const q = l.getBoundingClientRect();
            if (
              q.left < 0 ||
              q.right > innerWidth + 1 ||
              q.top < 0 ||
              q.bottom > innerHeight + 1 ||
              l.scrollWidth > q.width + 2
            )
              issues.push(l.dataset.equation + " clipped");
          }
        }
        return issues;
      }, t);
      expect(collisions).toEqual([]);
    }
    await page.keyboard.press("Escape");
    await expect(page.locator(".bb-entry")).toHaveCount(0);
  });
}
test("touch controls keep their targets and preserve real classifier interactions", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto("/");
  const pixel = page.locator("#pixels button").first();
  const label = await pixel.getAttribute("aria-label");
  const box = await pixel.boundingBox();
  expect(box.width).toBeGreaterThanOrEqual(24);
  expect(box.height).toBeGreaterThanOrEqual(24);
  await pixel.tap();
  await expect(pixel).not.toHaveAttribute("aria-label", label);
  await page.locator(".menu-toggle").tap();
  await expect(page.locator("#nav-panel")).toBeVisible();
  await page.getByRole("button", { name: "Report", exact: true }).tap();
  await expect(page.locator(".data-example p")).toContainText("Residual +1");
  await context.close();
});

test("enlarged equations can be scrolled by keyboard", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.addStyleTag({ content: "html{font-size:200%!important}" });
  const equation = page.locator(".neuron-working");
  await equation.focus();
  await page.keyboard.press("ArrowRight");
  await expect
    .poll(() => equation.evaluate((el) => el.scrollLeft))
    .toBeGreaterThan(0);
});
