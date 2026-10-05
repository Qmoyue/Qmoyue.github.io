import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

const outputDir = resolve("tests/visual/baseline");

for (const viewport of [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
] as const) {
  test(`${viewport.name} navigation open`, async ({ page }) => {
    await mkdir(outputDir, { recursive: true });
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });
    await page.goto("/");
    await page.waitForTimeout(7800);
    const navigation = page.getByRole("navigation", { name: "主导航" });
    await navigation.getByRole("button", { name: "打开导航" }).click();
    await expect(navigation.getByRole("link", { name: /BLOG/ })).toBeVisible();
    await page.waitForTimeout(300);
    await page.screenshot({
      path: resolve(outputDir, `${viewport.name}-navigation-open.jpg`),
      type: "jpeg",
      quality: 90,
    });
  });
}
