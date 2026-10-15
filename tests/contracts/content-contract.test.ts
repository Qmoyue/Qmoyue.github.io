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
  const issues = inspectArticle(
    '![diagram](./missing-diagram.png) [unsafe](javascript:alert(1)) <img onerror="alert(1)">',
    file,
    root,
  );

  expect(issues.map((issue) => issue.code)).toContain("IMAGE_PATH");
  expect(issues.map((issue) => issue.code)).toContain("LINK");
  expect(issues.map((issue) => issue.code)).toContain("RAW_HTML");
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
