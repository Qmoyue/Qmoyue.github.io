import { createSSRApp } from "vue";
import { renderToString } from "vue/server-renderer";
import { expect, test } from "vitest";
import ArticleToc from "../../src/islands/ArticleToc.vue";

test("article TOC explains when no section headings exist", async () => {
  const html = await renderToString(createSSRApp(ArticleToc, { headings: [] }));

  expect(html).toContain("这一页很轻，还没有目录。");
  expect(html).not.toContain('aria-label="文章目录"');
});
