import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const width of [320, 390, 768, 1024, 1440]) {
  for (const colorScheme of ["light", "dark"]) {
    test(`${width}px ${colorScheme}: layout, stages, accessibility and resources`, async ({
      page,
    }, testInfo) => {
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      page.on("requestfailed", (request) => errors.push(request.url()));
      page.on("response", (response) => {
        if (response.status() >= 400)
          errors.push(`${response.status()} ${response.url()}`);
      });
      await page.setViewportSize({ width, height: width < 600 ? 844 : 1000 });
      await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
      await page.goto("/");
      await expect(page.locator("#neuron-demo")).toHaveAttribute(
        "data-phase",
        "project",
      );
      await page.evaluate(() => document.fonts.ready);
      const titleLines = await page
        .locator("h1")
        .evaluate((el) =>
          Math.round(
            el.getBoundingClientRect().height /
              parseFloat(getComputedStyle(el).lineHeight),
          ),
        );
      expect(titleLines).toBeLessThanOrEqual(2);
      await expect(page.locator("html")).toHaveAttribute(
        "data-theme",
        colorScheme,
      );
      for (const stage of [
        "project",
        "transform",
        "classify",
        "loss",
        "backward",
      ]) {
        await page
          .getByRole("button", { name: `Show ${stage} stage`, exact: true })
          .click();
        await expect(page.locator("#neuron-demo")).toHaveAttribute(
          "data-phase",
          stage,
        );
        const overflow = await page.evaluate(() => ({
          document: document.documentElement.scrollWidth > innerWidth,
          equation: [
            ...document.querySelectorAll(".neuron-formula, .neuron-working"),
          ].some((el) => el.scrollWidth > el.clientWidth + 1),
        }));
        expect(overflow).toEqual({ document: false, equation: false });
      }
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(result.violations).toEqual([]);
      expect(
        await page.evaluate(
          () =>
            document.getAnimations().filter((a) => a.playState === "running")
              .length,
        ),
      ).toBe(0);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({
        path: testInfo.outputPath("full-page.png"),
        fullPage: true,
      });
      expect(errors).toEqual([]);
    });
  }
}

test("mobile menu and project shortcuts move keyboard focus to their destinations", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Menu" });
  await menu.click();
  await page.keyboard.press("Tab");
  await expect(page.locator(".nav-panel a").first()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await menu.click();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(page.locator("#work")).toBeFocused();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await menu.click();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(page.locator("#work")).toBeFocused();
  for (const id of ["orion", "sysai", "relay", "vyren"]) {
    await page.locator(`.project-jump a[href="#${id}"]`).click();
    await expect(page.locator(`#${id}`)).toBeFocused();
  }
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
});

test("theme persistence, manual classifier controls, disclosures and motion preferences", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator("#theme-select").selectOption("dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.locator("#theme-select").selectOption("system");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "Pause neural animation" }).click();
  await expect(page.locator("#neuron-demo")).not.toHaveClass(/is-playing/);
  await page.getByRole("button", { name: "Try a miss", exact: true }).click();
  await expect(page.locator("[data-prediction-status]")).toContainText(
    "missed",
  );
  await page.getByRole("button", { name: "Next digit", exact: false }).click();
  const neuron = page.locator('.neuron-select[tabindex="0"]');
  await neuron.focus();
  await page.keyboard.press("End");
  await expect(
    page.getByRole("button", { name: "First-layer neuron 16", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Home");
  await expect(
    page.getByRole("button", { name: "First-layer neuron 1", exact: true }),
  ).toBeFocused();
  for (const summary of await page
    .locator(".case-details summary, .archive-details summary")
    .all()) {
    await summary.click();
    await expect(summary.locator("..")).toHaveAttribute("open", "");
    await summary.click();
    await expect(summary.locator("..")).not.toHaveAttribute("open");
  }
  await page.goto("/#research-plate");
  await expect(page.locator("#research-plate")).toBeVisible();
  await expect(page.locator(".orion-details")).toHaveAttribute("open", "");
  const controls = page.locator(".research-plate__controls button");
  await controls.last().click();
  await expect(controls.last()).toHaveAttribute("aria-pressed", "true");
  await page.locator("#motion-toggle").click();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduce");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduce");
});

test("copy email succeeds and exposes a useful clipboard failure", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/#contact");
  await page.getByRole("button", { name: "Copy email address" }).click();
  await expect(page.locator("#copy-status")).toHaveText(
    "Email address copied.",
  );
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "thisisaritrasaha@gmail.com",
  );
  await page.evaluate(() => {
    navigator.clipboard.writeText = async () => {
      throw new Error("Clipboard blocked");
    };
  });
  await page.getByRole("button", { name: "Copy email address" }).click();
  await expect(page.locator("#copy-status")).toContainText("Couldn’t copy.");
  await expect(
    page.getByRole("button", { name: "Copy email address" }),
  ).toBeEnabled();
  await expect(page.locator(".contact-email")).toHaveAttribute(
    "href",
    "mailto:thisisaritrasaha@gmail.com",
  );
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { value: undefined });
  });
  await page.reload();
  await expect(page.locator(".contact-copy")).toBeHidden();
});

test("content and navigation survive disabled JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4174/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator(".neural-fallback")).toBeVisible();
  await expect(page.locator(".nav-panel a").first()).toBeVisible();
  await page.locator(".case-details summary").first().click();
  await expect(page.locator(".orion-details")).toHaveAttribute("open", "");
  await expect(page.locator("#copy-email")).toBeHidden();
  await expect(page.locator(".contact-copy")).toBeHidden();
  await context.close();
});

test("nested missing routes render the accessible 404 and public files stay bounded", async ({
  page,
  request,
}) => {
  const response = await page.goto("/missing/nested/path");
  expect(response.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "A wrong turn.",
  );
  expect(
    await page.locator('meta[name="robots"]').getAttribute("content"),
  ).toContain("noindex");
  await expect(page.locator(".inline-link")).toHaveAttribute("href", "/");
  expect((await request.get("/.git/config")).status()).toBe(404);
  expect((await request.get("/assets/%2e%2e%5cpackage.json")).status()).toBe(
    404,
  );
  expect((await request.post("/")).status()).toBe(405);
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(result.violations).toEqual([]);
});
