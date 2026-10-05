import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

const outputDir = resolve("tests/visual/baseline");

for (const viewport of [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
] as const) {
  test(`${viewport.name} technical article`, async ({ page }) => {
    await mkdir(outputDir, { recursive: true });
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });
    await page.goto("/blog/web/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.screenshot({
      path: resolve(outputDir, `${viewport.name}-article-intro.jpg`),
      type: "jpeg",
      quality: 90,
    });

    const code = page.locator(".article-prose pre").first();
    await code.scrollIntoViewIfNeeded();
    await expect(code).toBeVisible();
    await page.screenshot({
      path: resolve(outputDir, `${viewport.name}-article-code.jpg`),
      type: "jpeg",
      quality: 90,
    });
  });
}
