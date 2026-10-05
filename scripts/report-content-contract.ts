import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { inspectArticle, type ContentIssue } from "./lib/content-contract.ts";

const projectRoot = process.cwd();
const blogRoot = join(projectRoot, "src/content/blog");

function markdownFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(path);
    return /\.mdx?$/.test(entry.name) ? [path] : [];
  });
}

const files = markdownFiles(blogRoot).sort();
const issues: ContentIssue[] = [];
const slugs = new Map<string, string>();

for (const path of files) {
  const file = relative(projectRoot, path).replaceAll("\\", "/");
  issues.push(...inspectArticle(readFileSync(path, "utf8"), file, projectRoot));

  const slug = relative(blogRoot, path)
    .replace(/\.mdx?$/, "")
    .toLowerCase();
  const previous = slugs.get(slug);
  if (previous) {
    issues.push({
      file,
      line: 1,
      code: "SLUG",
      message: `duplicate slug with ${previous}`,
    });
  } else {
    slugs.set(slug, file);
  }
}

issues.sort(
  (a, b) =>
    a.file.localeCompare(b.file) ||
    a.line - b.line ||
    a.code.localeCompare(b.code),
);
for (const issue of issues) {
  console.log(`${issue.file}:${issue.line} [${issue.code}] ${issue.message}`);
}
const strict = process.argv.includes("--strict");
console.log(
  `\n${files.length} articles, ${issues.length} issues (${strict ? "strict" : "report only"})`,
);
if (strict && issues.length > 0) process.exitCode = 1;
