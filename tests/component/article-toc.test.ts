import { createSSRApp } from "vue";
import { renderToString } from "vue/server-renderer";
import { expect, test } from "vitest";
import ArticleToc from "../../src/islands/ArticleToc.vue";

test("article TOC renders real section links without JavaScript", async () => {
  const html = await renderToString(
    createSSRApp(ArticleToc, {
      headings: [
        { depth: 1, slug: "title", text: "文章标题" },
        { depth: 2, slug: "setup", text: "准备工作" },
        { depth: 3, slug: "details", text: "实现细节" },
      ],
    }),
  );

  expect(html).toContain('aria-label="文章目录"');
  expect(html).toContain('href="#setup"');
  expect(html).toContain('href="#details"');
  expect(html).not.toContain('href="#title"');
});

test("article TOC explains when no section headings exist", async () => {
  const html = await renderToString(createSSRApp(ArticleToc, { headings: [] }));

  expect(html).toContain("这一页很轻，还没有目录。");
  expect(html).not.toContain('aria-label="文章目录"');
});
