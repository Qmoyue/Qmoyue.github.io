import type { APIRoute } from "astro";
import { blogRepository } from "../site/blog";
import { site as siteData } from "../site/config";
import { absoluteSiteUrl, escapeXml } from "../framework/seo";

export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error("Astro site URL is required for RSS");
  const posts = await blogRepository.listSummaries();
  const items = posts
    .map((post) => {
      const url = absoluteSiteUrl(post.href, site);
      return `<item>
  <title>${escapeXml(post.title)}</title>
  <link>${escapeXml(url)}</link>
  <guid isPermaLink="true">${escapeXml(url)}</guid>
  <description>${escapeXml(post.description)}</description>
  <pubDate>${post.pubDate.toUTCString()}</pubDate>
</item>`;
    })
    .join("\n");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>${escapeXml(siteData.name)}</title>
  <link>${escapeXml(absoluteSiteUrl("/", site))}</link>
  <description>${escapeXml(siteData.description)}</description>
  <language>zh-CN</language>
${items}
</channel></rss>`,
    { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } },
  );
};
