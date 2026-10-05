import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("home, archive, article, and 404 have no WCAG axe violations", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const path of ["/", "/blog/", "/404.html"]) {
    await page.goto(path);
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(
      violations.map(({ id, nodes }) => ({
        id,
        targets: nodes.map(({ target }) => target),
      })),
      path,
    ).toEqual([]);
  }

  await page.goto("/blog/");
  const firstArticle = await page
    .locator("[data-note-card] > a")
    .first()
    .getAttribute("href");
  if (!firstArticle) throw new Error("Archive article link is missing");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(firstArticle);
  await expect(page.locator(".expressive-code pre").first()).toHaveAttribute(
    "tabindex",
    "0",
  );
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(
    violations.map(({ id, nodes }) => ({
      id,
      targets: nodes.map(({ target }) => target),
    })),
    firstArticle,
  ).toEqual([]);
});
