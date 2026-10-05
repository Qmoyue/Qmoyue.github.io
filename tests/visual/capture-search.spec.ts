import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

const outputDir = resolve("tests/visual/baseline");

for (const viewport of [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
] as const) {
  test(`${viewport.name} archive search`, async ({ page }) => {
    await mkdir(outputDir, { recursive: true });
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });
    await page.goto("/blog/");

    const input = page.getByRole("searchbox", { name: "关键词" });
    await expect(input).toBeVisible();
    await expect(page.locator("[data-note-card]").first()).toBeVisible();
    await page.screenshot({
      path: resolve(outputDir, `${viewport.name}-archive-search.jpg`),
      type: "jpeg",
      quality: 90,
    });

    await input.fill("CTF");
    await input.press("Enter");
    await expect(page.getByText(/找到 \d+ \/ \d+ 篇文章/)).toBeVisible();
    await page.screenshot({
      path: resolve(outputDir, `${viewport.name}-archive-search-results.jpg`),
      type: "jpeg",
      quality: 90,
    });
  });
}
