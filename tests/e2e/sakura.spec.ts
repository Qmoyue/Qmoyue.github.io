import { expect, test } from "@playwright/test";

test("decorative sakura keeps the preset density and respects reduced motion", async ({
  page,
}) => {
  await page.goto("/");
  const field = page.locator('[data-effect="sakura"]');
  await expect(field.locator("span")).toHaveCount(64);
  await expect(field).toBeVisible();

  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(field).toBeHidden();
});
