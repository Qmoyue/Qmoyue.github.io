import { expect, test } from "@playwright/test";

test("page and article metadata use public canonical URLs", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://qmoyue.github.io/",
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    "https://qmoyue.github.io/images/mygo1.jpg",
  );
  await expect(page.locator('link[rel="alternate"]')).toHaveAttribute(
    "href",
    "https://qmoyue.github.io/rss.xml",
  );

  await page.goto("/blog/");
  const firstArticle = await page
    .locator("[data-note-card] > a")
    .first()
    .getAttribute("href");
  if (!firstArticle) throw new Error("Archive article link is missing");
  await page.goto(firstArticle);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    new URL(firstArticle, "https://qmoyue.github.io").href,
  );
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
    "content",
    "article",
  );
  await expect(
    page.locator('meta[property="article:published_time"]'),
  ).toHaveAttribute("content", /\d{4}-\d{2}-\d{2}T/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /^https:\/\/qmoyue\.github\.io\/_astro\//,
  );
});

test("RSS and sitemap list the live article and navigation links", async ({
  page,
  request,
}) => {
  await page.goto("/blog/");
  const articleLinks = await page
    .locator("[data-note-card] > a")
    .evaluateAll((links) =>
      links.map((link) => (link as HTMLAnchorElement).pathname),
    );
  expect(articleLinks.length).toBeGreaterThan(0);

  const sitemapResponse = await request.get("/sitemap.xml");
  expect(sitemapResponse.ok()).toBe(true);
  const sitemap = await sitemapResponse.text();
  const rssResponse = await request.get("/rss.xml");
  expect(rssResponse.ok()).toBe(true);
  const rss = await rssResponse.text();
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Sitemap: https://qmoyue.github.io/sitemap.xml");

  for (const path of [
    "/",
    "/blog/",
    "/project/",
    "/friends/",
    "/me/",
    ...articleLinks,
  ]) {
    const url = new URL(path, "https://qmoyue.github.io").href;
    expect(sitemap).toContain(`<loc>${url}</loc>`);
    const target = await request.get(path);
    expect(target.ok(), path).toBe(true);
  }
  for (const path of articleLinks) {
    expect(rss).toContain(
      `<link>${new URL(path, "https://qmoyue.github.io").href}</link>`,
    );
  }
});

test("404 page offers a working return link and is excluded from indexing", async ({
  page,
}) => {
  await page.goto("/404.html");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex",
  );
  await page.getByRole("link", { name: "回到首页" }).click();
  await expect(page).toHaveURL("/");
});
