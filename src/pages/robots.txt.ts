import type { APIRoute } from "astro";
import { absoluteSiteUrl } from "../framework/seo";

export const GET: APIRoute = ({ site }) => {
  if (!site) throw new Error("Astro site URL is required for robots.txt");
  return new Response(
    `User-agent: *\nAllow: /\nSitemap: ${absoluteSiteUrl("/sitemap.xml", site)}\n`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
};
