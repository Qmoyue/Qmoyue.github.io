import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

const outputDir = resolve("tests/visual/baseline");

for (const viewport of [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
] as const) {
  test(`${viewport.name} friends`, async ({ page }) => {
    await mkdir(outputDir, { recursive: true });
    await page.setViewportSize(viewport);
    await page.goto("/friends/", { waitUntil: "domcontentloaded" });
    const intro = page.locator(".friends-intro");
    await expect(
      intro.getByRole("heading", { name: "Friends" }),
    ).toBeAttached();
    await page.waitForTimeout(700);
    await page.screenshot({
      path: resolve(outputDir, `${viewport.name}-friends-intro.jpg`),
      type: "jpeg",
      quality: 90,
    });

    await expect
      .poll(() =>
        intro.evaluate((element) => Number(getComputedStyle(element).opacity)),
      )
      .toBeLessThan(0.05);
    const avatar = page.locator(".friend-current .portrait-face img");
    await expect
      .poll(() =>
        avatar.evaluate((image: HTMLImageElement) => image.naturalWidth),
      )
      .toBeGreaterThan(0);
    await page.screenshot({
      path: resolve(outputDir, `${viewport.name}-friends-settled.jpg`),
      type: "jpeg",
      quality: 90,
    });

    await page.getByRole("link", { name: /访问 Nick Chen 的博客/ }).hover();
    await expect
      .poll(() =>
        page
          .locator(".friend-bubble")
          .evaluate((element) => Number(getComputedStyle(element).opacity)),
      )
      .toBeGreaterThan(0.95);
    await page.screenshot({
      path: resolve(outputDir, `${viewport.name}-friends-bubble.jpg`),
      type: "jpeg",
      quality: 90,
    });
  });
}
