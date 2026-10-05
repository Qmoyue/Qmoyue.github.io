import { expect, test } from "@playwright/test";

test("technical code remains readable with language syntax distinction", async ({
  page,
}) => {
  await page.goto("/blog/web/");

  const code = page.locator(".article-prose pre").first();
  await expect(code).toContainText("import requests");
  const visibleColors = await code.evaluate((element) => {
    const spans = Array.from(element.querySelectorAll("span"));
    return new Set(spans.map((span) => getComputedStyle(span).color)).size;
  });
  expect(visibleColors).toBeGreaterThan(2);

  await page.setViewportSize({ width: 390, height: 844 });
  const pageFitsViewport = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth,
  );
  expect(pageFitsViewport).toBe(true);
});

test("technical code is present without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto("/blog/web/");
    await expect(page.locator(".article-prose pre").first()).toContainText(
      "import requests",
    );
    await expect(page.locator(".article-prose pre").first()).toHaveAttribute(
      "tabindex",
      "0",
    );
  } finally {
    await context.close();
  }
});

test("a real GFM table remains navigable on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/blog/wp/");
  const table = page.getByRole("table");
  await expect(table.getByRole("columnheader", { name: "名称" })).toBeVisible();
  await expect(table).toContainText("caddy-admin-api");
  await expect(table).toHaveAttribute("tabindex", "0");
  const pageFitsViewport = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth,
  );
  expect(pageFitsViewport).toBe(true);
});
