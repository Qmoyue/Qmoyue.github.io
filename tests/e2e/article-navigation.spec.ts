import { expect, test } from "@playwright/test";

test("article TOC tracks the section in view", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/blog/web/");
  const link = page
    .getByRole("navigation", { name: "文章目录" })
    .getByRole("link", { name: /Path/ });
  await link.click();
  await expect(page).toHaveURL(/#path$/);
  await expect(link).toHaveAttribute("aria-current", "location");

  const keep = page
    .getByRole("navigation", { name: "文章目录" })
    .getByRole("link", { name: /^keep/ });
  await keep.click();
  await expect(keep).toHaveAttribute("aria-current", "location");
  await page
    .getByRole("heading", { name: "Path", exact: true })
    .evaluate((heading) => {
      window.scrollTo({
        top: window.scrollY + heading.getBoundingClientRect().top + 400,
        behavior: "instant",
      });
    });
  await expect(link).toHaveAttribute("aria-current", "location");
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(
    page.locator('.article-toc [aria-current="location"]'),
  ).toHaveCount(0);
});

test("reading progress can seek through a long article by keyboard", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/blog/web/");
  const rail = page.getByRole("slider", { name: "页面滚动进度" });
  await rail.focus();
  await rail.press("End");
  await expect(rail).toHaveAttribute("aria-valuenow", "100");
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollHeight -
        window.innerHeight -
        window.scrollY,
    ),
  ).toBeLessThan(2);
  await rail.press("Home");
  await expect(rail).toHaveAttribute("aria-valuenow", "0");
});

test("reading progress follows Doro while dragging", async ({ page }) => {
  await page.goto("/blog/web/");
  const rail = page.getByRole("slider", { name: "页面滚动进度" });
  const box = await rail.boundingBox();
  if (!box) throw new Error("The reading progress rail is missing");
  const thumb = await page.locator(".scroll-rail-thumb").boundingBox();
  if (!thumb) throw new Error("Doro is missing from the reading progress rail");

  await page.mouse.move(thumb.x + thumb.width / 2, thumb.y + thumb.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.75);
  const position = await page.evaluate(() => ({
    top: window.scrollY,
    max: document.documentElement.scrollHeight - window.innerHeight,
  }));
  expect(position.top / position.max).toBeGreaterThan(0.7);
  await page.mouse.up();
});

test("reading progress stays at zero when the page has no scrollable range", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/404.html");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollHeight - window.innerHeight,
    ),
  ).toBe(0);
  const rail = page.getByRole("slider", { name: "页面滚动进度" });
  await expect(
    page.locator("astro-island").filter({ has: rail }),
  ).not.toHaveAttribute("ssr", "");
  await rail.press("End");
  await expect(rail).toHaveAttribute("aria-valuenow", "0");
  await rail.press("ArrowDown");
  await expect(rail).toHaveAttribute("aria-valuenow", "0");
});
