import { test, expect } from "@playwright/test";
import { radialCurve } from "../assets/quanta-feature.js";

test("QUANTA replaces the featured project and its radial study follows the equations", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/?motion=reduce#quanta");
  await expect(page.locator(".project-jump a")).toHaveText([
    /SeeDL/,
    /QUANTA/,
    /Orion/,
    /SysAI/,
  ]);
  await expect(page.locator("#quanta")).toBeFocused();
  await expect(page.locator(".quanta-density")).toHaveAttribute(
    "d",
    radialCurve(1),
  );
  const control = page.getByRole("button", { name: "2s excited state" });
  await control.focus();
  await page.keyboard.press("Enter");
  await expect(control).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".quanta-density")).toHaveAttribute(
    "d",
    radialCurve(2),
  );
  await expect(page.locator(".quanta-reading")).toContainText(
    "one radial node at 2a₀",
  );
  await expect(page.locator("#quanta .feature-story")).toContainText(
    "all 118 elements",
  );
  await expect(
    page.locator('#quanta a[href="https://iamaritrasaha.github.io/quanta/"]'),
  ).toBeVisible();
  await page.locator("#quanta summary").click();
  await expect(page.locator("#quanta details")).toContainText(
    "not exact many-electron solutions",
  );
  await page.getByRole("button", { name: "1s ground state" }).click();
  await expect(page.locator(".quanta-density")).toHaveAttribute(
    "d",
    radialCurve(1),
  );
  expect(errors).toEqual([]);
});

test("QUANTA and Infera bookmarks stay honest with and without JavaScript", async ({
  browser,
  baseURL,
}) => {
  for (const javaScriptEnabled of [true, false]) {
    const context = await browser.newContext({
      javaScriptEnabled,
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    for (const id of ["infera", "infera-title"]) {
      await page.goto(new URL("/#" + id, baseURL).href);
      await expect(page.locator("#infera")).toBeVisible();
      await expect(page.locator("#infera")).toContainText(
        "in progress and is not currently featured",
      );
      await expect(page.locator(".bb-entry")).toHaveCount(0);
    }
    await page.goto(new URL("/#quanta", baseURL).href);
    await expect(page).toHaveURL(/\/#quanta$/);
    await expect(page.locator("#quanta h3")).toHaveText("QUANTA");
    await expect(page.locator(".quanta-density")).toHaveAttribute(
      "d",
      radialCurve(1),
    );
    await page.goto(new URL("/explorations/#quanta", baseURL).href);
    await expect(page.locator('#quanta a[href="/#quanta"]')).toBeVisible();
    await context.close();
  }
});
