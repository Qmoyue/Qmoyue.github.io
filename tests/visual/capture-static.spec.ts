import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

const outputDir = resolve("tests/visual/baseline");

for (const viewport of [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
] as const) {
  test(`${viewport.name} static shell and footer`, async ({ page }) => {
    await mkdir(outputDir, { recursive: true });
    await page.setViewportSize(viewport);
    await page.goto("/project/");
    await expect(page.getByRole("heading", { name: "Project" })).toBeVisible();
    await page.screenshot({
      path: resolve(outputDir, `${viewport.name}-static-intro.jpg`),
      type: "jpeg",
      quality: 90,
    });

    const footer = page.locator("footer.site-footer");
    await footer.scrollIntoViewIfNeeded();
    await expect(footer).toBeVisible();
    await page.screenshot({
      path: resolve(outputDir, `${viewport.name}-static-footer.jpg`),
      type: "jpeg",
      quality: 90,
    });
  });
}
