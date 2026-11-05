import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4174",
    browserName: process.env.PLAYWRIGHT_BROWSER || "chromium",
    channel:
      process.env.PLAYWRIGHT_BROWSER &&
      process.env.PLAYWRIGHT_BROWSER !== "chromium"
        ? undefined
        : process.env.PLAYWRIGHT_CHANNEL || "msedge",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node scripts/serve.mjs",
    env: { PORT: "4174" },
    url: "http://127.0.0.1:4174",
    reuseExistingServer: !process.env.CI,
  },
});
