import { expect, test } from "@playwright/test";

test("navigation opens by click, closes with Escape, and reaches a page", async ({
  page,
}) => {
  await page.goto("/");
  const navigation = page.getByRole("navigation", { name: "主导航" });
  const trigger = navigation.getByRole("button", { name: "打开导航" });
  await trigger.click();
  await expect(navigation.getByRole("link", { name: /BLOG/ })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.click();
  await navigation.getByRole("link", { name: /BLOG/ }).click();
  await expect(page).toHaveURL(/\/blog\/$/);
});

test("navigation remains usable without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  const navigation = page.getByRole("navigation", { name: "主导航" });
  await navigation.locator("summary").click();
  await expect(navigation.getByRole("link", { name: /BLOG/ })).toBeVisible();
  const rect = await navigation
    .getByRole("link", { name: /BLOG/ })
    .boundingBox();
  if (!rect) throw new Error("Static blog link has no visible box");
  await page.mouse.click(rect.x + rect.width / 2, rect.y + rect.height / 2);
  await expect(page).toHaveURL(/\/blog\/$/);
  await context.close();
});

test("navigation opens on a narrow touch viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const navigation = page.getByRole("navigation", { name: "主导航" });
  await navigation.getByRole("button", { name: "打开导航" }).click();
  await expect(navigation.getByRole("link", { name: /FRIENDS/ })).toBeVisible();
  await page.mouse.click(16, 300);
  await expect(
    navigation.getByRole("button", { name: "打开导航" }),
  ).toHaveAttribute("aria-expanded", "false");
});

test("navigation opens from the keyboard with visible focus", async ({
  page,
}) => {
  await page.goto("/");
  const navigation = page.getByRole("navigation", { name: "主导航" });
  const trigger = navigation.getByRole("button", { name: "打开导航" });
  await page.keyboard.press("Tab");
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveCSS("outline-style", "solid");
  await page.keyboard.press("Enter");
  await expect(navigation.getByRole("link", { name: /BLOG/ })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});
