import { test, expect } from "@playwright/test";

for (const width of [320, 390, 1024, 1440]) {
  for (const theme of ["light", "dark"]) {
    test(`${width}px ${theme}: contact folio colors and reflow`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
      await page.goto("/");
      await page.keyboard.press("Escape");
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);

      const contact = page.locator(".contact-section");
      await contact.scrollIntoViewIfNeeded();
      await expect(contact.locator(".contact-email")).toHaveAttribute(
        "href",
        /^mailto:/,
      );
      await expect(contact.locator(".contact-links .inline-link")).toHaveAttribute(
        "href",
        /github\.com/,
      );

      const layout = await contact.evaluate((element) => {
        const style = getComputedStyle(element);
        const email = element.querySelector(".contact-email");
        return {
          background: style.backgroundColor,
          graphPaper: style.backgroundImage.includes("linear-gradient"),
          emailSize: parseFloat(getComputedStyle(email).fontSize),
          overflowing: element.scrollWidth > element.clientWidth + 1,
        };
      });

      expect(layout.background).toBe(
        theme === "light" ? "rgb(244, 244, 236)" : "rgb(19, 28, 65)",
      );
      expect(layout.graphPaper).toBe(true);
      expect(layout.emailSize).toBeLessThanOrEqual(28);
      expect(layout.overflowing).toBe(false);
    });
  }
}
