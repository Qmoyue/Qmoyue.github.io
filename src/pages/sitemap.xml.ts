import type { APIRoute } from "astro";
import { absoluteSiteUrl, escapeXml } from "../framework/seo";
import { blogRepository } from "../site/blog";
import { navItems } from "../site/config";

export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error("Astro site URL is required for sitemap");
  const posts = await blogRepository.listSummaries();
  const pages = [
    ...navItems.map((item) => ({ href: item.href, updatedAt: undefined })),
    ...posts.map((post) => ({
      href: post.href,
      updatedAt: post.updatedDate ?? post.pubDate,
    })),
  ];
  const urls = pages
    .map(({ href, updatedAt }) => {
      const lastModified = updatedAt
        ? `<lastmod>${updatedAt.toISOString().slice(0, 10)}</lastmod>`
        : "";
      return `<url><loc>${escapeXml(absoluteSiteUrl(href, site))}</loc>${lastModified}</url>`;
    })
    .join("\n");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
};
