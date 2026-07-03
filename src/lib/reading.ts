export function countWords(markdown: string) {
  const cjk = markdown.match(/[\u4e00-\u9fff]/g)?.length ?? 0;
  const words =
    markdown
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/[\u4e00-\u9fff]/g, " ")
      .match(/[A-Za-z0-9_]+/g)?.length ?? 0;

  return cjk + words;
}
