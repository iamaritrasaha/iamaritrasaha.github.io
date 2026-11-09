import { test, expect } from "@playwright/test";

const colors = {
  light: "rgb(244, 244, 236)",
  dark: "rgb(19, 28, 65)",
};

for (const theme of ["light", "dark"]) {
  for (const width of [320, 390, 1440]) {
    test(`${theme} contact folio at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
      await page.goto("/");

      const section = page.locator("#contact");
      const style = await section.evaluate((el) => {
        const css = getComputedStyle(el);
        return {
          color: css.backgroundColor,
          grid: css.backgroundImage,
          overflow: el.scrollWidth > el.clientWidth + 1,
        };
      });

      expect(style.color).toBe(colors[theme]);
      expect(style.grid).toContain("linear-gradient");
      expect(style.overflow).toBe(false);

      const email = section.locator(".contact-email");
      await expect(email).toHaveAttribute("href", /^mailto:/);
    });
  }
}
