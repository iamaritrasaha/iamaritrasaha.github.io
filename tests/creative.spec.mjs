import { test, expect } from "@playwright/test";
test("entry skips immediately and does not replay", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const skip = page.getByRole("button", { name: "Skip intro" });
  await skip.click();
  await expect(page.locator(".entry")).toHaveCount(0);
  await page.reload();
  await expect(page.locator("#angle")).toBeVisible();
  await expect(page.locator(".entry")).toHaveCount(0);
});
test("reduced motion bypasses entry and instruments work by keyboard", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("#angle")).toBeVisible();
  await expect(page.locator(".entry")).toHaveCount(0);
  expect(
    await page.evaluate(() => localStorage.getItem("projection-intro")),
  ).toBeNull();
  await page.locator("#angle").focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".axis-control output")).toHaveText("23°");
  await page.getByRole("button", { name: "Report", exact: true }).click();
  await expect(page.locator(".data-example p")).toContainText("Residual +1");
  await page.getByRole("button", { name: "Isolate signal path" }).click();
  await expect(page.locator("#seedl")).toHaveClass(/isolated/);
});
