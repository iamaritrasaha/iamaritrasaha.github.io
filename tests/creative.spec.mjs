import { test, expect } from "@playwright/test";
test("welcome preserves its handoff, supports keyboard dismissal and shortens return visits", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".bb-entry button")).toHaveCount(0);
  await expect(page.getByRole("dialog")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator(".entry")).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("dialog")).toContainText("Aritra Saha");
  await page.keyboard.press("Escape");
  await expect(page.locator(".entry")).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("dialog")).toBeFocused();
  await expect(page.locator(".bb-entry")).toHaveClass(/is-returning/);
  await expect(page.locator(".entry")).toHaveCount(0, { timeout: 1600 });
  await expect(
    page.getByRole("button", { name: /replay welcome/i }),
  ).toHaveCount(0);
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
