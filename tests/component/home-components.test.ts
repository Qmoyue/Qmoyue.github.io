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
  expect(html).toContain('href="/blog/"');
  expect(html).toContain('href="/project/"');
  expect(html).toContain('href="/me/"');
  expect(html).toContain('href="/friends/"');
  expect(html).toContain("flag{fixture}");
  expect(html).toContain('aria-label="显示头像留言"');
  expect(html).toContain('alt="花园里捧着花的人像"');
  expect(html).toContain('aria-label="日历"');
  expect(html).toContain('aria-label="页面滚动进度"');
  expect(html).toContain("First line");
  expect(html).toContain("data-falling-stage");
});
