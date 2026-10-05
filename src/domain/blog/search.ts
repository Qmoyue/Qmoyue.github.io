export function normalizeSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[#_\-/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchesSearch(text: string, keyword: string): boolean {
  const terms = normalizeSearch(keyword).split(" ").filter(Boolean);
  const normalizedText = normalizeSearch(text);
  return terms.every((term) => normalizedText.includes(term));
}
