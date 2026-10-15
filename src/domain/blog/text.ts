import type { Nodes } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { gfm } from "micromark-extension-gfm";

export function articleText(markdown: string): string {
  const tree = fromMarkdown(markdown, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  });

  function text(node: Nodes): string {
    if (node.type === "text" || node.type === "inlineCode") return node.value;
    if (!("children" in node)) return " ";
    const block =
      node.type === "root" ||
      node.type === "blockquote" ||
      node.type === "list" ||
      node.type === "listItem" ||
      node.type === "table" ||
      node.type === "tableRow";
    return node.children.map(text).join(block ? " " : "");
  }

  return text(tree).replace(/\s+/g, " ").trim();
}

export function countWords(markdown: string): number {
  const prose = articleText(markdown);
  const cjk = prose.match(/[\u4e00-\u9fff]/g)?.length ?? 0;
  const words =
    prose.replace(/[\u4e00-\u9fff]/g, " ").match(/[A-Za-z0-9_]+/g)?.length ?? 0;
  return cjk + words;
}
