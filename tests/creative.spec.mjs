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
  await expect(page.locator(".epoch-label")).toContainText("INTRO EPOCH");
  expect(
    await page
      .locator(".bb-entry")
      .evaluate((el) =>
        parseFloat(el.style.getPropertyValue("--entry-duration")),
      ),
  ).toBe(4600);
  await expect(page.locator(".entry")).toHaveCount(0, { timeout: 5200 });
  await expect(
    page.getByRole("button", { name: /replay welcome/i }),
  ).toHaveCount(0);
});
test("reduced motion bypasses entry and instruments work by keyboard", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("[data-projection-pause]")).toBeDisabled();
  await expect(page.locator(".entry")).toHaveCount(0);
  expect(
    await page.evaluate(() => localStorage.getItem("projection-intro")),
  ).toBeNull();
  await expect(page.locator(".projection-readout output")).toHaveText("22.0°");
  await expect(page.locator(".projection-math")).toContainText(
    "advances 12° per active second",
  );
  await page.getByRole("button", { name: "Isolate signal path" }).click();
  await expect(page.locator("#seedl")).toHaveClass(/isolated/);
});
