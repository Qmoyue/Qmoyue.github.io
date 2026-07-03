type BlogEntryLike = {
  id: string;
  body?: string;
  data: {
    title: string;
    description?: string;
    date?: string | Date;
    pubDate?: Date;
    updatedDate?: Date;
    tags?: string[];
  };
};

function parseFlexibleDate(value?: string | Date) {
  if (!value) return undefined;
  if (value instanceof Date && !Number.isNaN(value.valueOf())) return value;

  const normalized = String(value).trim().replace(/[.\/]/g, "-");
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.valueOf()) ? undefined : parsed;
}

function cleanBody(body = "") {
  return body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/[#>*_`\-[\](){}|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueTags(tags: string[]) {
  return Array.from(new Set(tags.filter((tag) => tag && tag !== "笔记"))).slice(0, 5);
}

function inferTags(post: BlogEntryLike) {
  const key = `${post.id} ${post.data.title}`.toLowerCase();
  const tags: string[] = [];

  if (/ctf|writeup|wp|题解|解出/.test(key)) tags.push("CTF", "Web安全", "WP");
  if (/xss/.test(key)) tags.push("XSS");
  if (/csrf/.test(key)) tags.push("CSRF");
  if (/xxe/.test(key)) tags.push("XXE");
  if (/ssrf/.test(key)) tags.push("SSRF");
  if (/ssti/.test(key)) tags.push("SSTI");
  if (/sql/.test(key)) tags.push("SQL", "数据库");
  if (/php/.test(key)) tags.push("PHP");
  if (/react|next|cve/.test(key)) tags.push("React", "CVE");
  if (/java|cc链|类加载|双亲委派|反射/.test(key)) tags.push("Java", "反序列化");
  if (/upload|上传/.test(key)) tags.push("文件上传");
  if (/sandbox|沙箱/.test(key)) tags.push("沙箱逃逸");
  if (/web|安全|漏洞/.test(key)) tags.push("Web安全");

  return uniqueTags(tags.length > 0 ? tags : ["技术记录"]);
}

export function getPostDate(post: BlogEntryLike) {
  return post.data.pubDate ?? parseFlexibleDate(post.data.date) ?? new Date("2026-05-01");
}

export function getPostDescription(post: BlogEntryLike) {
  if (post.data.description) return post.data.description;

  const plain = cleanBody(post.body);
  if (plain.length > 0) return plain.slice(0, 86) + (plain.length > 86 ? "..." : "");
  return "一篇技术与兴趣记录，整理当时的实践过程、想法和复盘。";
}

export function getPostTags(post: BlogEntryLike) {
  const tags = uniqueTags(post.data.tags ?? []);
  return tags.length > 0 ? tags : inferTags(post);
}

export function getPostSearchText(post: BlogEntryLike) {
  const bodyIndex = cleanBody(post.body).slice(0, 2200);
  return [post.data.title, getPostDescription(post), ...getPostTags(post), post.id, bodyIndex]
    .join(" ")
    .toLowerCase();
}
