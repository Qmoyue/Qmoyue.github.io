import { getCollection } from "astro:content";
import type { BlogCover } from "./covers";
import { toPostSummary, type PostDetail, type PostSummary } from "./posts";

export function createBlogRepository(catalog: readonly BlogCover[]) {
  async function listDetails(): Promise<PostDetail[]> {
    const entries = await getCollection("blog", ({ data }) =>
      import.meta.env.PROD ? !data.draft : true,
    );
    return entries
      .map((entry) => ({ entry, summary: toPostSummary(entry, catalog) }))
      .sort(
        (a, b) =>
          b.summary.pubDate.valueOf() - a.summary.pubDate.valueOf() ||
          a.summary.id.localeCompare(b.summary.id),
      );
  }

  return {
    listDetails,
    async listSummaries(): Promise<PostSummary[]> {
      return (await listDetails()).map(({ summary }) => summary);
    },
  };
}
