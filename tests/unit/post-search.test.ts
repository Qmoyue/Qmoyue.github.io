import { expect, test } from "vitest";
import { getPostSearchText } from "../../src/domain/blog/posts";
import { matchesSearch, normalizeSearch } from "../../src/domain/blog/search";

test("search indexes article prose and metadata, not fenced code", () => {
  const text = getPostSearchText({
    id: "search-example",
    body: "正文里的关键字\n```js\nconst hiddenCodeTerm = true;\n```",
    title: "搜索标题",
    description: "摘要内容",
    tags: ["技术笔记"],
  });

  expect(text).toContain("搜索标题");
  expect(text).toContain("摘要内容");
  expect(text).toContain("技术笔记");
  expect(text).toContain("正文里的关键字");
  expect(text).not.toContain("hiddencodeterm");
});

test("search normalizes full-width text and punctuation", () => {
  expect(normalizeSearch(" ＣＴＦ / Web_题目 ")).toBe("ctf web 题目");
  expect(matchesSearch("MoeCTF Web 题目", "ＣＴＦ / 题目")).toBe(true);
  expect(matchesSearch("MoeCTF Web 题目", "ＣＴＦ / Vue")).toBe(false);
});
