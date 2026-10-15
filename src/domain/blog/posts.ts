import type { CollectionEntry } from "astro:content";
import { articleText, countWords } from "./text";
import { resolveBlogCover, type BlogCover } from "./covers";

export type BlogEntry = CollectionEntry<"blog">;

export interface PostSummary {
  id: string;
  href: string;
  title: string;
  description: string;
  pubDate: Date;
  updatedDate?: Date;
  tags: readonly string[];
  cover: BlogCover;
  coverAlt: string;
  words: number;
  searchText: string;
}

export interface PostDetail {
  summary: PostSummary;
  entry: BlogEntry;
}

export function getPostSearchText(post: {
  id: string;
  title: string;
  description: string;
  tags: readonly string[];
  body: string;
}): string {
  return [
    post.title,
    post.description,
    ...post.tags,
    post.id,
    articleText(post.body),
  ]
    .join(" ")
    .toLowerCase();
}

export function toPostSummary(
  entry: BlogEntry,
  catalog: readonly BlogCover[],
): PostSummary {
  if (typeof entry.body !== "string")
    throw new Error(`Blog article has no Markdown body: ${entry.id}`);

  const { title, description, pubDate, updatedDate, tags, cover, coverAlt } =
    entry.data;
  return {
    id: entry.id,
    href: `/blog/${entry.id}/`,
    title,
    description,
    pubDate,
    updatedDate,
    tags,
    cover: resolveBlogCover(entry.id, cover, catalog),
    coverAlt,
    words: countWords(entry.body),
    searchText: getPostSearchText({
      id: entry.id,
      title,
      description,
      tags,
      body: entry.body,
    }),
  };
}
