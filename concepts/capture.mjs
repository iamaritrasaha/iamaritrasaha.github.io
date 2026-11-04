import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
const b = await chromium.launch({ channel: "msedge" });
await fs.mkdir("concepts/review", { recursive: true });
for (const name of ["cinema", "index-room", "bitbench"]) {
  for (const width of [1440, 390]) {
    const c = await b.newContext({
      viewport: { width, height: width === 390 ? 844 : 900 },
      ...(width === 1440
        ? {
            recordVideo: {
              dir: ".taste-skill",
              size: { width: 1280, height: 800 },
            },
          }
        : {}),
    });
    const p = await c.newPage();
    p.on("pageerror", console.error);
    await p.goto("http://localhost:4186/concepts/" + name + "/");
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(1150);
    await p.screenshot({
      path: "concepts/review/" + name + "-" + width + ".jpg",
      quality: 86,
    });
    console.log(
      name,
      width,
      await p.evaluate(() => document.documentElement.scrollWidth > innerWidth),
    );
    if (name === "cinema") {
      await p.locator("input").focus();
      for (let i = 0; i < 34; i++) {
        await p.keyboard.press("ArrowRight");
        await p.waitForTimeout(24);
      }
      await p.locator("#reel").scrollIntoViewIfNeeded();
      await p.getByRole("button", { name: "Advance signal cue" }).click();
      await p.waitForTimeout(400);
      await p.getByRole("button", { name: "Advance signal cue" }).click();
    }
    if (name === "index-room") {
      await p.getByRole("button", { name: /Infera/ }).click();
      await p.waitForTimeout(650);
      await p.getByRole("button", { name: /PulseShift/ }).click();
    }
    if (name === "bitbench") {
      await p.locator("#matrix button").nth(18).click();
      await p.locator("#sample").click();
      await p.waitForTimeout(450);
      await p.locator("#layer").click();
    }
    await p.waitForTimeout(850);
    const video = p.video();
    await c.close();
    if (video) await video.saveAs("concepts/review/" + name + ".webm");
  }
}
await b.close();
