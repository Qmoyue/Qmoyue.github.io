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
    await page.goto("/friends/");
    await expect(page.getByRole("heading", { name: "Friends" })).toBeVisible();
    await page.screenshot({
      path: resolve(outputDir, `${viewport.name}-friends.jpg`),
      type: "jpeg",
      quality: 90,
      fullPage: true,
    });
  });
}
