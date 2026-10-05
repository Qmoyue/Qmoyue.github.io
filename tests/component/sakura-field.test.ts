import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { expect, test } from "vitest";
import SakuraField from "../../src/components/effects/SakuraField.astro";

test("sakura field renders the requested deterministic petal count", async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(SakuraField, {
    props: { count: 64 },
  });

  expect((html.match(/<span\b/g) ?? []).length).toBe(64);
  expect(html).toContain('aria-hidden="true"');
});

test("sakura field rejects an invalid count at build time", async () => {
  const container = await AstroContainer.create();
  await expect(
    container.renderToString(SakuraField, { props: { count: -1 } }),
  ).rejects.toThrow("Sakura count must be a non-negative integer");
});
