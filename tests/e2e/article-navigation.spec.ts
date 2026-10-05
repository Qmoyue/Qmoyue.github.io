import { expect, test } from "@playwright/test";

test("article TOC tracks the section in view", async ({ page }) => {
  await page.goto("/blog/web/");
  const link = page
    .getByRole("navigation", { name: "文章目录" })
    .getByRole("link", { name: /Path/ });
  await link.click();
  await expect(page).toHaveURL(/#path$/);
  await expect(link).toHaveAttribute("aria-current", "location");
});

test("reading progress can seek through a long article by keyboard", async ({
  page,
}) => {
  await page.goto("/blog/web/");
  const rail = page.getByRole("slider", { name: "页面滚动进度" });
  await rail.focus();
  await rail.press("End");
  await expect(rail).toHaveAttribute("aria-valuenow", "100");
  await rail.press("Home");
  await expect(rail).toHaveAttribute("aria-valuenow", "0");
});
