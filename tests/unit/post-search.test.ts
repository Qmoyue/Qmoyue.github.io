import { expect, test } from "vitest";
import { getPostSearchText } from "../../src/domain/blog/posts";
import { matchesSearch, normalizeSearch } from "../../src/domain/blog/search";
import { countWords } from "../../src/domain/blog/text";

test("search and word count use article prose instead of Markdown code", () => {
  const body =
    "正文里的关键字 hello **world** `inline_code`\n\n```js\nconst hiddenCodeTerm = true; 中文代码\n```\n\n~~~text\n围栏代码 tildeCodeTerm\n~~~\n\n    缩进代码 indentedCodeTerm\n";
  const text = getPostSearchText({
    id: "search-example",
    body,
    title: "搜索标题",
    description: "摘要内容",
    tags: ["技术笔记"],
  });

  expect(text).toContain("搜索标题");
  expect(text).toContain("摘要内容");
  expect(text).toContain("技术笔记");
  expect(text).toContain("正文里的关键字");
  expect(text).not.toContain("hiddencodeterm");
  expect(text).not.toContain("tildecodeterm");
  expect(text).not.toContain("indentedcodeterm");
  expect(countWords(body)).toBe(10);
});

test("search normalizes full-width text and punctuation", () => {
  expect(normalizeSearch(" ＣＴＦ / Web_题目 ")).toBe("ctf web 题目");
  expect(matchesSearch("MoeCTF Web 题目", "ＣＴＦ / 题目")).toBe(true);
  expect(matchesSearch("MoeCTF Web 题目", "ＣＴＦ / Vue")).toBe(false);
});
