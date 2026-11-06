import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const routes = ["/", "/embedded/", "/explorations/"];
const legacy = {
  pulseshift: "/embedded/#pulseshift",
  "pulseshift-title": "/embedded/#pulseshift",
  "pulse-rpm": "/embedded/#pulseshift",
  vyren: "/explorations/#vyren",
  "vyren-title": "/explorations/#vyren",
  relay: "/explorations/#relay",
  "relay-title": "/explorations/#relay",
  index: "/explorations/#index",
  aether: "/explorations/#aether",
  orbis: "/explorations/#orbis",
  arthrekha: "/explorations/#arthrekha",
  vector: "/explorations/#vector",
  quanta: "/explorations/#quanta",
  veyra: "/explorations/#veyra",
  serein: "/explorations/#serein",
  aura: "/explorations/#aura",
  lumina: "/explorations/#lumina",
  foresight: "/explorations/#foresight",
  novarx: "/explorations/#novarx",
};

test("all three routes share navigation and distinct metadata", async ({
  page,
}) => {
  const titles = new Set();
  for (const route of routes) {
    await page.goto(route + "?motion=reduce");
    titles.add(await page.title());
    const nav = page.getByRole("navigation", { name: "Primary navigation" });
    await expect(nav.locator(".nav-panel a")).toHaveText([
      "AI/ML",
      "Embedded Lab",
      "Explorations",
      "About",
      "Contact",
    ]);
    await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
    await expect(nav.locator('[aria-current="page"]')).toHaveAttribute(
      "href",
      route,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://iamaritrasaha.github.io" + route,
    );
    expect(
      await page
        .locator('script[type="application/ld+json"]')
        .evaluate((el) => JSON.parse(el.textContent)),
    ).toBeTruthy();
  }
  expect(titles.size).toBe(3);
});

test("every moved published fragment reaches a meaningful destination without the welcome", async ({
  page,
}) => {
  for (const [id, target] of Object.entries(legacy)) {
    await page.goto("/?motion=reduce#" + id);
    const [path, hash] = target.split("#");
    await expect(page).toHaveURL(
      new RegExp(path + "\\?motion=reduce#" + hash + "$"),
    );
    await expect(page.locator("#" + hash)).toBeVisible();
    await expect(page.locator("#" + hash)).toBeFocused();
    await expect(page.locator(".bb-entry, #welcome-paint")).toHaveCount(0);
  }
  await page.goto("/?motion=reduce#about");
  await expect(page.locator("#about")).toBeFocused();
  await page.evaluate(() => {
    location.hash = "vector";
  });
  await expect(page).toHaveURL(/\/explorations\/\?motion=reduce#vector$/);
  await page.goto("/?motion=reduce#unknown-project");
  await expect(page).toHaveURL(/\/\?motion=reduce#unknown-project$/);
  await page.goto("/?motion=reduce#%E0%A4%A");
  await expect(page.locator("h1")).toBeVisible();
});

test("legacy bookmarks and primary navigation remain useful without JavaScript", async ({
  browser,
  baseURL,
}) => {
  test.setTimeout(90000);
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  for (const [id, target] of Object.entries(legacy)) {
    await page.goto(new URL("/#" + id, baseURL).href);
    const link = page.locator(`#${id} a`);
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", target);
    await link.click();
    await expect(page.locator("#" + target.split("#")[1])).toBeVisible();
  }
  for (const route of routes) {
    await page.goto(new URL(route, baseURL).href);
    await expect(page.locator(".nav-panel a")).toHaveCount(5);
    for (const link of await page.locator(".nav-panel a").all())
      await expect(link).toBeVisible();
    await expect(page.locator("h1")).toBeVisible();
  }
  await context.close();
});

for (const width of [320, 390, 768, 1440]) {
  for (const colorScheme of ["light", "dark"]) {
    test(`Explorations ${width}px ${colorScheme}: drawings, reflow, accessibility and resources`, async ({
      page,
    }) => {
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("response", (response) => {
        if (response.status() >= 400) errors.push(response.url());
      });
      page.on("requestfailed", (request) => errors.push(request.url()));
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
      await page.goto("/explorations/");
      await page.evaluate(() => document.fonts.ready);
      for (const id of [
        "vector",
        "quanta",
        "arthrekha",
        "vyren",
        "aether",
        "orbis",
        "serein",
      ]) {
        await expect(page.locator(`#${id} svg`)).toBeVisible();
      }
      await expect(page.locator("#relay")).toContainText(
        "no longer a featured active priority",
      );
      await expect(page.locator("#veyra")).toContainText("Separate from Vyren");
      await page.locator("#vyren summary").click();
      await expect(page.locator("#vyren details")).toContainText(
        "application source is private",
      );
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.addStyleTag({
        content:
          "html{font-size:200%!important} p{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}",
      });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      expect(errors).toEqual([]);
    });
  }
}

test("Explorations motion runs only onscreen and honors live and shared preferences", async ({
  page,
  context,
}) => {
  await page.goto("/explorations/#vector");
  const scene = page.locator("#vector .exploration-scene");
  await scene.scrollIntoViewIfNeeded();
  await expect(scene).toHaveClass(/scene-active/);
  await page.locator("#earlier").scrollIntoViewIfNeeded();
  await expect(scene).not.toHaveClass(/scene-active/);
  await scene.scrollIntoViewIfNeeded();
  await expect(scene).toHaveClass(/scene-active/);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(scene).not.toHaveClass(/scene-active/);
  await page.evaluate(() => {
    delete document.hidden;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(scene).toHaveClass(/scene-active/);
  const home = await context.newPage();
  await home.goto("/#work");
  await home.locator("#theme-select").selectOption("dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await home.locator("[data-motion-toggle]").first().click();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduce");
  await expect(scene).not.toHaveClass(/scene-active/);
  await page.locator("[data-exploration-motion]").click();
  await expect(home.locator("html")).toHaveAttribute("data-motion", "full");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduce");
});

test("direct nested routes and built assets remain available", async ({
  request,
}) => {
  for (const url of [
    "/explorations/",
    "/embedded/",
    "/explorations",
    "/assets/explorations.css",
    "/assets/explorations.js",
    "/assets/legacy-fragments.js",
  ])
    expect((await request.get(url)).status()).toBe(200);
});
