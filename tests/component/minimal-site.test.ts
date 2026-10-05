import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { expect, test } from "vitest";
import MinimalSite from "../fixtures/MinimalSite.astro";

test("a second site renders through the shared config contract and neutral preset", async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(MinimalSite);

  expect(html).toContain('data-theme="neutral"');
  expect(html).toContain("Field Notes");
  expect(html).toContain("A small static notebook.");
  expect(html).toContain('href="/"');
  expect(html).not.toContain("moyue");
  expect(html).not.toContain("/images/");
});
