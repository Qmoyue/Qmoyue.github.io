import { getContainerRenderer } from "@astrojs/vue/container-renderer";
import { loadRenderers } from "astro:container";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { expect, test } from "vitest";
import AstroVueFixture from "../fixtures/AstroVueFixture.astro";

test("Astro renders Vue content before hydration", async () => {
  const renderers = await loadRenderers([getContainerRenderer()]);
  const container = await AstroContainer.create({ renderers });
  const html = await container.renderToString(AstroVueFixture);

  expect(html).toContain('aria-label="Vue integration fixture"');
  expect(html).toContain("Counter 0");
  expect(html).toContain("astro-island");
});
