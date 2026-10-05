import { getContainerRenderer } from "@astrojs/vue/container-renderer";
import { loadRenderers } from "astro:container";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { expect, test } from "vitest";
import HomeComponents from "../fixtures/HomeComponents.astro";

test("home production components render core content and actions as static HTML", async () => {
  const renderers = await loadRenderers([getContainerRenderer()]);
  const container = await AstroContainer.create({ renderers });
  const html = await container.renderToString(HomeComponents);

  expect(html).toContain("Fixture Author");
  expect(html).toContain('href="/blog/first/"');
  expect(html).toContain("First note");
  expect(html).toContain("flag{fixture}");
  expect(html).toContain('aria-label="弹一下吉他"');
  expect(html).toContain('alt="Flower cover"');
  expect(html).toContain('aria-label="日历"');
  expect(html).toContain('aria-label="页面滚动进度"');
  expect(html).toContain("First line");
  expect(html).toContain("data-falling-stage");
});
