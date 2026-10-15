import { expect, test } from "@playwright/test";

test("archive commits search on Enter and recovers from no results", async ({
  page,
}) => {
  await page.goto("/blog/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Blog");
  const cards = page.locator("[data-note-card]:visible");
  const total = await cards.count();
  expect(total).toBeGreaterThan(0);
  const cover = cards.first().locator(".note-cover img");
  await expect(cover).toBeVisible();
  await expect
    .poll(() => cover.evaluate((image: HTMLImageElement) => image.naturalWidth))
    .toBeGreaterThan(0);

  const search = page.getByRole("searchbox", { name: "关键词" });
  await expect(search).toBeEditable();
  await search.fill("CTF");
  await expect(cards).toHaveCount(total);
  await expect(page.locator("[data-search-count]")).toContainText(
    "按 Enter 搜索",
  );
  await page.evaluate(() => window.scrollTo({ top: 650, behavior: "instant" }));
  const rail = page.getByRole("slider", { name: "页面滚动进度" });
  await expect(rail).not.toHaveAttribute("aria-valuenow", "0");
  await search.press("Enter");
  await expect(page.locator("[data-search-count]")).toContainText(
    /找到 \d+ \/ \d+ 篇文章/,
  );
  const matches = await cards.count();
  expect(matches).toBeGreaterThan(0);
  expect(matches).toBeLessThan(total);
  // Filtering changes document height; the shared rail must report the new progress.
  await expect
    .poll(() =>
      rail.evaluate((element) => {
        const progress = Math.round(
          (window.scrollY /
            Math.max(
              1,
              document.documentElement.scrollHeight - window.innerHeight,
            )) *
            100,
        );
        return Number(element.getAttribute("aria-valuenow")) === progress;
      }),
    )
    .toBe(true);

  await search.fill("a-term-that-is-not-in-any-article");
  await search.press("Enter");
  await expect(cards).toHaveCount(0);
  await expect(page.locator("[data-blog-empty]")).toBeVisible();
  await search.fill("");
  await search.press("Enter");
  await expect(cards).toHaveCount(total);
  await expect(page.locator("[data-blog-empty]")).toBeHidden();
});

test("archive opens a real article without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto("/blog/");
    await expect(
      page.getByRole("searchbox", { name: "关键词" }),
    ).toHaveAttribute("readonly", "");
    const article = page.locator("[data-note-card] > a").first();
    const href = await article.getAttribute("href");
    if (!href) throw new Error("Archive article link is missing");
    await article.click();
    await expect(page).toHaveURL(new URL(href, page.url()).href);
    await expect(page.locator(".article-prose")).toBeVisible();
  } finally {
    await context.close();
  }
});
