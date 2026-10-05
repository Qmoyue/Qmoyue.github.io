import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { Nodes } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { gfm } from "micromark-extension-gfm";
import { parseDocument } from "yaml";

export interface ContentIssue {
  file: string;
  line: number;
  code: string;
  message: string;
}

function visit(node: Nodes, inspect: (node: Nodes) => void): void {
  inspect(node);
  if ("children" in node) {
    for (const child of node.children) visit(child, inspect);
  }
}

export function inspectArticle(
  source: string,
  file: string,
  projectRoot: string,
): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const rawHtmlLines = new Set<number>();
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const add = (line: number, code: string, message: string) => {
    issues.push({ file, line, code, message });
  };

  let body = source;
  let bodyOffset = 0;

  if (lines[0] !== "---") {
    add(1, "FRONTMATTER", "missing opening ---");
  } else {
    const end = lines.findIndex((line, index) => index > 0 && line === "---");
    if (end === -1) {
      add(1, "FRONTMATTER", "missing closing ---");
    } else {
      body = lines.slice(end + 1).join("\n");
      bodyOffset = end + 1;
      const document = parseDocument(lines.slice(1, end).join("\n"), {
        uniqueKeys: true,
      });

      for (const error of document.errors) {
        add((error.linePos?.[0].line ?? 1) + 1, "YAML", error.message);
      }

      if (document.errors.length === 0) {
        const metadata: unknown = document.toJS();
        if (
          !metadata ||
          typeof metadata !== "object" ||
          Array.isArray(metadata)
        ) {
          add(2, "FRONTMATTER", "frontmatter must be a mapping");
        } else {
          const values = metadata as Record<string, unknown>;
          for (const key of [
            "title",
            "description",
            "pubDate",
            "cover",
            "coverAlt",
          ]) {
            if (typeof values[key] !== "string" || !values[key].trim()) {
              add(2, "METADATA", `${key} must be a non-empty string`);
            }
          }
          if (
            typeof values.pubDate === "string" &&
            (!/^\d{4}-\d{2}-\d{2}$/.test(values.pubDate) ||
              Number.isNaN(Date.parse(`${values.pubDate}T00:00:00Z`)) ||
              new Date(`${values.pubDate}T00:00:00Z`)
                .toISOString()
                .slice(0, 10) !== values.pubDate)
          ) {
            add(2, "METADATA", "pubDate must be a valid YYYY-MM-DD date");
          }
          if (
            !Array.isArray(values.tags) ||
            values.tags.length === 0 ||
            values.tags.some((tag) => typeof tag !== "string" || !tag.trim())
          ) {
            add(2, "METADATA", "tags must be non-empty strings");
          }
          if (typeof values.draft !== "boolean") {
            add(2, "METADATA", "draft must be a boolean");
          }
          if (typeof values.cover === "string" && values.cover !== "auto") {
            const cover = resolve(
              projectRoot,
              "src/assets/blog-covers",
              values.cover,
            );
            if (!existsSync(cover))
              add(2, "COVER", `missing cover: ${values.cover}`);
          }
        }
      }
    }
  }

  const bodyLines = body.split("\n");
  const tree = fromMarkdown(body, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  });
  let previousHeading = 1;

  visit(tree, (node) => {
    const line = (node.position?.start.line ?? 1) + bodyOffset;
    if (node.type === "heading") {
      if (node.depth === 1)
        add(line, "HEADING", "body H1 duplicates the page title");
      if (node.depth > previousHeading + 1) {
        add(
          line,
          "HEADING",
          `heading jumps from H${previousHeading} to H${node.depth}`,
        );
      }
      previousHeading = node.depth;
    }

    if (node.type === "code") {
      const opening = bodyLines[(node.position?.start.line ?? 1) - 1] ?? "";
      const fence = opening.match(/^ {0,3}(`{3,}|~{3,})/);
      if (fence) {
        if (!node.lang)
          add(
            line,
            "FENCE_LANG",
            "code fence needs a language; use text for plain text",
          );
        const closing = bodyLines[(node.position?.end.line ?? 1) - 1] ?? "";
        const marker = fence[1][0];
        const closePattern = new RegExp(
          `^ {0,3}${marker}{${fence[1].length},}\\s*$`,
        );
        if (!closePattern.test(closing))
          add(line, "FENCE_CLOSE", "code fence is not closed");
      }
    }

    if (node.type === "image") {
      if (!node.alt?.trim())
        add(line, "IMAGE_ALT", "image needs meaningful alt text");
      checkLocalTarget(node.url, line, "IMAGE_PATH", true);
    }
    if (node.type === "link") {
      checkLocalTarget(node.url, line, "LINK", false);
    }
    if (node.type === "html") {
      if (!rawHtmlLines.has(line)) {
        add(
          line,
          "RAW_HTML",
          "raw HTML must be escaped or fenced in an article",
        );
        rawHtmlLines.add(line);
      }
    }
  });

  function checkLocalTarget(
    url: string,
    line: number,
    code: string,
    image: boolean,
  ): void {
    if (!url.trim()) {
      add(line, code, "empty destination");
      return;
    }
    if (/^(javascript|data):/i.test(url)) {
      add(line, code, `unsafe destination: ${url}`);
      return;
    }
    if (/^(https?:|mailto:|tel:|#|\/\/)/i.test(url)) return;

    const path = url.split(/[?#]/, 1)[0];
    if (!image && !path.endsWith(".md") && !path.endsWith(".mdx")) return;

    let decoded: string;
    try {
      decoded = decodeURIComponent(path);
    } catch (error) {
      if (!(error instanceof URIError)) throw error;
      add(line, code, `malformed path: ${url}`);
      return;
    }

    const target = decoded.startsWith("/")
      ? resolve(projectRoot, "public", decoded.slice(1))
      : resolve(dirname(resolve(projectRoot, file)), decoded);
    if (!existsSync(target)) add(line, code, `missing local target: ${url}`);
  }

  return issues;
}
