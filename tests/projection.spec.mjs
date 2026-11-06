import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("manual inspection renders the reported angle and preserves keyboard and drag controls", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?motion=reduce#projection");
  const canvas = page.locator(".instrument canvas");
  await canvas.focus();
  await page.keyboard.press("ArrowRight");
  await expect(canvas).toHaveAttribute("data-angle", "27");
  await expect(page.locator(".instrument output")).toHaveText("27.0°");
  expect(
    await canvas.evaluate(async (canvas) => {
      const { createSculpture } = await import(
        "/assets/projection-renderer.js?v=s1"
      );
      const reference = document.createElement("canvas");
      reference.width = canvas.width;
      reference.height = canvas.height;
      createSculpture(reference)(27);
      return reference.toDataURL() === canvas.toDataURL();
    }),
  ).toBe(true);
  const box = await canvas.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 50, box.y + box.height / 2);
  await page.mouse.up();
  await expect(canvas).toHaveAttribute("data-angle", "47");
  await page.getByRole("button", { name: "Reset view" }).click();
  await expect(canvas).toHaveAttribute("data-angle", "22");
  await canvas.focus();
  await page.keyboard.press("Shift+ArrowLeft");
  await expect(canvas).toHaveAttribute("data-angle", "7");
  await page.keyboard.press("Home");
  await expect(canvas).toHaveAttribute("data-angle", "22");
  await page
    .locator(".instrument")
    .evaluate((el) => (el.style.display = "none"));
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
  await page
    .locator(".instrument")
    .evaluate((el) => el.style.removeProperty("display"));
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
  expect(errors).toEqual([]);
});

for (const width of [320, 390, 768, 1440])
  test(`projection ${width}px: MathML, themes, enlarged text and disclosure`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/?motion=reduce#projection");
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator("#projection h2")).toHaveText(
      "Change one angle.",
    );
    await expect(page.locator(".projection-derivation")).not.toHaveAttribute(
      "open",
    );
    await page.locator(".projection-derivation summary").click();
    await expect(page.locator(".projection-math math")).toHaveCount(5);
    await expect(page.locator(".projection-math mfrac")).toHaveCount(1);
    expect(
      await page.evaluate(() => document.fonts.check('20px "Portfolio Math"')),
    ).toBe(true);
    for (const theme of ["light", "dark"]) {
      await page.locator("#theme-select").selectOption(theme);
      expect(
        (
          await new AxeBuilder({ page })
            .include("#projection")
            .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
    }
    for (const css of [
      "html{font-size:200%!important}",
      "*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}",
    ]) {
      const style = await page.addStyleTag({ content: css });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      await expect(
        page.locator(".projection-derivation summary"),
      ).toBeVisible();
      await style.evaluate((el) => el.remove());
    }
  });

test("projection fallback retains the sculpture and semantic mathematics without JavaScript", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto(new URL("/#projection", baseURL).href);
  await expect(page.locator(".projection-fallback")).toBeVisible();
  expect(
    await page
      .locator(".projection-fallback")
      .evaluate((img) => img.complete && img.naturalWidth > 0),
  ).toBe(true);
  await expect(page.locator(".instrument canvas")).toBeHidden();
  await expect(page.locator("[data-projection-pause]")).toBeHidden();
  await page.locator(".projection-derivation summary").click();
  await expect(page.locator(".projection-math")).toBeVisible();
  await context.close();
});
