import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const route of ["/embedded/", "/explorations/"]) {
  test(`${route} first entrance draws its subject, hands off and skips repeats`, async ({
    page,
  }) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(route);
    const entry = page.locator(".chapter-entry");
    await expect(entry).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(entry).toBeFocused();
    await expect(entry.locator("button")).toHaveCount(0);
    await expect(entry.locator(".chapter-progress")).toBeVisible();
    expect(
      await entry.locator(".chapter-progress i").evaluate((el) => {
        const animation = el.getAnimations()[0];
        const duration = animation.effect.getTiming().duration;
        animation.pause();
        animation.currentTime = duration / 4;
        const early = new DOMMatrix(getComputedStyle(el).transform).a;
        animation.currentTime = (duration * 3) / 4;
        const late = new DOMMatrix(getComputedStyle(el).transform).a;
        animation.currentTime = 0;
        animation.play();
        return { duration, early, late };
      }),
    ).toEqual({ duration: 2200, early: 0.25, late: 0.75 });
    await expect(entry.locator("svg")).toHaveCount(1);
    if (route === "/embedded/") {
      await expect(entry.locator(".chapter-led")).toHaveCount(6);
      await expect(entry).toContainText("V = IR");
      await expect(entry).toContainText("f = 1/T");
    } else {
      await expect(entry).toContainText("x = r cos θ");
      await expect(entry).toContainText("p = |ψ|²");
    }
    await expect(page.locator("html")).toHaveAttribute(
      "data-chapter-state",
      "complete",
      { timeout: 4000 },
    );
    await expect(entry).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
    await page.reload();
    await expect(entry).toHaveCount(0);
    await expect(page.locator("html")).toHaveAttribute(
      "data-chapter-state",
      "bypassed",
    );
    expect(errors).toEqual([]);
  });
  for (const action of ["Escape", "Tab", "tap"]) {
    test(`${route} ${action} immediately reveals a usable destination`, async ({
      page,
    }) => {
      await page.goto(route);
      await expect(page.locator(".chapter-entry")).toBeVisible();
      if (action === "tap")
        await page
          .locator(".chapter-entry")
          .click({ position: { x: 20, y: 20 } });
      else await page.keyboard.press(action);
      await expect(page.locator(".chapter-entry")).toHaveCount(0);
      await expect(page.locator("html")).toHaveAttribute(
        "data-chapter-state",
        "bypassed",
      );
      if (action !== "Tab")
        await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
      expect(
        await page.evaluate(() =>
          document.activeElement.closest(".chapter-entry"),
        ),
      ).toBeNull();
    });
  }
  test(`${route} preferences, fragments, failed script and no-JS fail open`, async ({
    browser,
    baseURL,
  }) => {
    for (const mode of [
      "reduce",
      "saved",
      "data",
      "fragment",
      "failed",
      "no-js",
      "no-view-transitions",
    ]) {
      const context = await browser.newContext({
        javaScriptEnabled: mode !== "no-js",
        reducedMotion: mode === "reduce" ? "reduce" : "no-preference",
      });
      if (mode === "saved")
        await context.addInitScript(() =>
          localStorage.setItem("portfolio-reduced-motion", "true"),
        );
      if (mode === "data")
        await context.addInitScript(() =>
          Object.defineProperty(navigator, "connection", {
            value: {
              saveData: true,
              addEventListener() {},
              removeEventListener() {},
            },
          }),
        );
      if (mode === "failed")
        await context.route(/chapter-entry\.js/, (r) => r.abort());
      if (mode === "no-view-transitions")
        await context.route(/chapter-entry\.css/, async (r) => {
          const response = await r.fetch();
          await r.fulfill({
            response,
            body: (await response.text()).replace(
              /@view-transition\s*\{[^}]*\}/g,
              "",
            ),
          });
        });
      const page = await context.newPage();
      await page.goto(
        new URL(route + (mode === "fragment" ? "#main" : ""), baseURL).href,
      );
      if (mode === "no-view-transitions") {
        await expect(page.locator(".chapter-entry")).toBeVisible();
        await page.keyboard.press("Escape");
      }
      await expect(page.locator(".chapter-entry")).toHaveCount(0);
      await expect(page.locator("#chapter-paint")).toBeHidden();
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await context.close();
    }
  });
}

for (const [from, to, name] of [
  ["/", "/embedded/", "Embedded Lab"],
  ["/", "/explorations/", "Explorations"],
  ["/embedded/", "/explorations/", "Explorations"],
  ["/explorations/", "/embedded/", "Embedded Lab"],
  ["/embedded/", "/", "AI/ML"],
  ["/explorations/", "/", "AI/ML"],
]) {
  test(`chapter navigation ${from} to ${to} and browser history`, async ({
    page,
  }) => {
    await page.goto(from);
    await page.keyboard.press("Escape");
    await page
      .getByRole("navigation", { name: "Primary navigation" })
      .getByRole("link", { name, exact: true })
      .click();
    await expect(page).toHaveURL(new RegExp(to + "$"));
    await expect(
      page.locator(to === "/" ? ".bb-entry" : ".chapter-entry"),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator(".chapter-entry,.bb-entry")).toHaveCount(0);
    await page.goBack();
    await expect(page).toHaveURL(new RegExp(from + "$"));
    if (from !== "/")
      await expect(page.locator(".chapter-entry")).toHaveCount(0);
    else await page.keyboard.press("Escape");
    await page.goForward();
    await expect(page).toHaveURL(new RegExp(to + "$"));
    if (to !== "/") await expect(page.locator(".chapter-entry")).toHaveCount(0);
  });
}

for (const route of ["/embedded/", "/explorations/"]) {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1440, height: 1000 },
  ]) {
    test(`${route} ${viewport.width}px artwork, title and controls fit and remain accessible`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      const time = new Date("2026-11-06T00:00:00Z");
      await page.clock.install({ time });
      await page.clock.pauseAt(time);
      await page.goto(route);
      await expect(page.locator(".chapter-entry")).toBeVisible();
      for (const selector of [
        ".chapter-art",
        ".chapter-title",
        ".chapter-caption",
        ".chapter-progress",
      ]) {
        const box = await page.locator(selector).boundingBox();
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.y).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
        expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
      }
      // Axe uses browser timers; geometry is already checked at the held frame.
      await page.clock.resume();
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
      await page.keyboard.press("Escape");
    });
  }
}

test("a live motion preference or hidden page cancels the chapter without stale layers", async ({
  page,
}) => {
  await page.goto("/embedded/");
  await expect(page.locator(".chapter-entry")).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".chapter-entry")).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/explorations/");
  await expect(page.locator(".chapter-entry")).toBeVisible();
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      value: true,
      configurable: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.locator(".chapter-entry")).toHaveCount(0);
});
