import { expect, test } from "vitest";
import { inspectArticle } from "../../scripts/lib/content-contract";
import { readFileSync } from "node:fs";
import { parseDocument, stringify } from "yaml";

const root = process.cwd();
const file = "src/content/blog/contract-example.md";

test("contract reports invalid metadata, body H1, and unlabeled code", () => {
  const issues = inspectArticle(
    '---\ntitle: ""\n---\n# Duplicate title\n```\ncode\n```',
    file,
    root,
  );

  expect(issues.map((issue) => issue.code)).toContain("METADATA");
  expect(issues.map((issue) => issue.code)).toContain("HEADING");
  expect(issues.map((issue) => issue.code)).toContain("FENCE_LANG");
});

test("contract reports missing local images, unsafe links, and raw HTML", () => {
  for (const source of [
    '![](./missing-diagram.png) [unsafe](javascript:alert(1)) <img onerror="alert(1)">',
    '![][Picture] [unsafe][Target] <img onerror="alert(1)">\n\n[picture]: ./missing-diagram.png\n[target]: javascript:alert(1)',
  ]) {
    const issues = inspectArticle(source, file, root);
    const codes = issues.map((issue) => issue.code);
    expect(codes).toContain("IMAGE_ALT");
    expect(codes).toContain("IMAGE_PATH");
    expect(codes).toContain("LINK");
    expect(codes).toContain("RAW_HTML");
  }
});

test("content checks reject invalid and backward update dates on a published article", () => {
  const path = "src/content/blog/web.md";
  const source = readFileSync(path, "utf8");
  const [, metadata, body] = source.split(/^---\s*$/m);
  const values = parseDocument(metadata).toJS();
  for (const updatedDate of ["2026-02-30", "2026-02-28", 42]) {
    const changed = `---\n${stringify({ ...values, updatedDate })}---\n${body}`;
    const issues = inspectArticle(changed, path, root);
    expect(
      issues.some(
        (issue) =>
          issue.code === "METADATA" && issue.message.startsWith("updatedDate:"),
      ),
    ).toBe(true);
  }
  expect(inspectArticle(source, path, root)).toEqual([]);
});
