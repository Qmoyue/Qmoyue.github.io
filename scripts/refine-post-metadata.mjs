import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const blogDir = path.join(root, "src", "content", "blog");

function parseFrontmatter(markdown) {
  if (!markdown.startsWith("---")) return { data: {}, body: markdown };
  const end = markdown.indexOf("\n---", 3);
  if (end === -1) return { data: {}, body: markdown };
  const raw = markdown.slice(3, end).trim();
  const body = markdown.slice(end + 4).replace(/^\s*\r?\n/, "");
  const data = {};

  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;
    const key = match[1];
    const value = match[2].trim();
    data[key] = value.replace(/^['"]|['"]$/g, "");
  }

  return { data, body };
}

function yamlString(value) {
  return JSON.stringify(String(value ?? ""));
}

function normalizeCompetition(title) {
  const compact = title.replace(/\s+/g, "");
  const rules = [
    [/moectf(20\d{2})/i, (year) => `MoeCTF ${year}`],
    [/lilacctf(20\d{2})/i, (year) => `lilacCTF ${year}`],
    [/suctf(20\d{2})/i, (year) => `SUCTF ${year}`],
    [/pcbctf(20\d{2})/i, (year) => `PCBCTF ${year}`],
    [/rctf(20\d{2})/i, (year) => `RCTF ${year}`],
    [/qctf(20\d{2})/i, (year) => `Q CTF ${year}`],
    [/qctf?(20\d{2})/i, (year) => `Q CTF ${year}`],
  ];

  for (const [pattern, format] of rules) {
    const match = compact.match(pattern);
    if (match) return format(match[1]);
  }

  const spaced = title.match(/([A-Za-z]+\s*CTF)\s*(20\d{2})/i);
  if (spaced) return `${spaced[1].replace(/\s+/g, " ").trim()} ${spaced[2]}`;
  return "CTF";
}

function hasAny(text, patterns) {
  return patterns.some((pattern) => pattern.test(text));
}

function uniqueTags(tags) {
  return Array.from(new Set(tags.filter(Boolean))).slice(0, 5);
}

function inferMetadata(filename, title) {
  const text = `${filename} ${title}`.toLowerCase();

  if (/ctf|题解|解出|writeup|\bwp\b/.test(text)) {
    const competition = normalizeCompetition(title);
    return {
      description: `${competition} Web方向比赛WP，整理解题思路、关键利用点和赛后复盘记录。`,
      tags: uniqueTags(["CTF", "Web安全", "WP"]),
    };
  }

  if (/react2shell|cve-?2025-?55182/.test(text)) {
    return {
      description: "React2Shell 漏洞分析，围绕 RSC 反序列化风险、利用链和防护思路做复盘。",
      tags: uniqueTags(["React", "CVE", "Web安全"]),
    };
  }

  if (/数据库|database/.test(text)) {
    return {
      description: "数据库指纹识别总结，整理 SQL 注入场景下判断数据库类型的常用方法。",
      tags: uniqueTags(["数据库", "SQL", "Web安全"]),
    };
  }

  if (/预编译|prepared/.test(text)) {
    return {
      description: "SQL 预编译机制总结，记录参数化查询、防注入边界和常见误区。",
      tags: uniqueTags(["SQL", "数据库", "Web安全"]),
    };
  }

  if (/sql.*upload|upload.*sql/.test(text)) {
    return {
      description: "SQL 注入写文件与上传利用总结，梳理利用条件、路径判断和实战注意点。",
      tags: uniqueTags(["SQL", "文件上传", "Web安全"]),
    };
  }

  if (/sql.*绕过|bypass/.test(text)) {
    return {
      description: "SQL 注入绕过技巧总结，整理过滤场景、绕过思路和常见 payload 变形。",
      tags: uniqueTags(["SQL", "绕过", "Web安全"]),
    };
  }

  if (/sql/.test(text)) {
    return {
      description: "SQL 注入漏洞总结，梳理漏洞原理、利用方式、绕过思路和防护要点。",
      tags: uniqueTags(["SQL", "漏洞总结", "Web安全"]),
    };
  }

  if (/xss|csrf/.test(text)) {
    return {
      description: "XSS 与 CSRF 漏洞总结，梳理攻击场景、风险影响和常见防护方式。",
      tags: uniqueTags(["XSS", "CSRF", "Web安全"]),
    };
  }

  if (/xxe/.test(text)) {
    return {
      description: "XXE 漏洞总结，记录外部实体注入的原理、利用场景和防护配置。",
      tags: uniqueTags(["XXE", "漏洞总结", "Web安全"]),
    };
  }

  if (/ssrf/.test(text)) {
    return {
      description: "SSRF 漏洞总结，整理服务端请求伪造的利用入口、内网探测和防护思路。",
      tags: uniqueTags(["SSRF", "漏洞总结", "Web安全"]),
    };
  }

  if (/ssti/.test(text)) {
    return {
      description: "SSTI 注入漏洞总结，整理模板注入的判断方法、利用链和防护要点。",
      tags: uniqueTags(["SSTI", "漏洞总结", "Web安全"]),
    };
  }

  if (/反序列化|deserialization|php/.test(text)) {
    return {
      description: "PHP 反序列化漏洞总结，梳理魔术方法、POP 链构造和常见利用条件。",
      tags: uniqueTags(["PHP", "反序列化", "Web安全"]),
    };
  }

  if (/文件包含|文件上传|file-include|upload/.test(text)) {
    return {
      description: "文件包含与文件上传漏洞总结，整理触发条件、利用方式和绕过技巧。",
      tags: uniqueTags(["文件上传", "文件包含", "Web安全"]),
    };
  }

  if (/sandbox|沙箱/.test(text)) {
    return {
      description: "MaxKB sandbox 漏洞挖掘记录，整理漏洞发现过程、利用条件和复现思路。",
      tags: uniqueTags(["沙箱逃逸", "漏洞挖掘", "Web安全"]),
    };
  }

  if (/cc链|双亲委派|类加载|java|反射/.test(text)) {
    return {
      description: "Java 反射、双亲委派与动态类加载总结，围绕 CC 链组装思路做整理。",
      tags: uniqueTags(["Java", "反序列化", "Web安全"]),
    };
  }

  if (/pcb|硬件/.test(text)) {
    return {
      description: "PCB 与硬件方向学习记录，整理实践过程、关键问题和复盘心得。",
      tags: uniqueTags(["硬件", "PCB", "实践记录"]),
    };
  }

  if (hasAny(text, [/web/, /安全/, /漏洞/])) {
    return {
      description: "Web 安全学习记录，整理实践过程、关键知识点和复盘心得。",
      tags: uniqueTags(["Web安全", "实践记录"]),
    };
  }

  return {
    description: "一篇技术与兴趣记录，整理当时的实践过程、想法和复盘。",
    tags: uniqueTags(["技术记录"]),
  };
}

const files = await readdir(blogDir, { withFileTypes: true });
let count = 0;

for (const file of files) {
  if (!file.isFile() || !file.name.toLowerCase().endsWith(".md")) continue;
  const fullPath = path.join(blogDir, file.name);
  const raw = await readFile(fullPath, "utf8");
  const { data, body } = parseFrontmatter(raw.replace(/^\uFEFF/, ""));
  const title = data.title || path.basename(file.name, ".md");
  const inferred = inferMetadata(file.name, title);
  const pubDate = data.pubDate || data.date || "2026-05-01";
  const updatedDate = data.updatedDate || pubDate;
  const cover = data.cover || "auto";
  const draft = data.draft || "false";

  const frontmatter = [
    "---",
    `title: ${yamlString(title)}`,
    `description: ${yamlString(inferred.description)}`,
    `pubDate: ${yamlString(pubDate)}`,
    `updatedDate: ${yamlString(updatedDate)}`,
    `tags: [${inferred.tags.map(yamlString).join(", ")}]`,
    `cover: ${cover}`,
    `coverAlt: ${yamlString(`${title} 的文章封面`)}`,
    `draft: ${draft}`,
    "---",
    "",
  ].join("\n");

  await writeFile(fullPath, frontmatter + body.trimStart(), "utf8");
  count += 1;
}

console.log(`Refined metadata for ${count} blog article(s).`);
