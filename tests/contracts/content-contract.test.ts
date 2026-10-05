import { expect, test } from "vitest";
import { inspectArticle } from "../../scripts/lib/content-contract";

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
