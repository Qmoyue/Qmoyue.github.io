import type { ImageMetadata } from "astro";

type CoverModule = { default: ImageMetadata };
type BlogCover = { filename: string; src: ImageMetadata | string };
type PostLike = { id: string; data: { cover?: string } };

const modules = import.meta.glob<CoverModule>(
  "../assets/blog-covers/*.{jpg,jpeg,png,webp,avif}",
  { eager: true },
);

const covers: BlogCover[] = Object.entries(modules)
  .map(([path, module]) => ({
    filename: path.split("/").pop() ?? path,
    src: module.default,
  }))
  .sort((a, b) => a.filename.localeCompare(b.filename));

const fallbackCover: BlogCover = {
  filename: "flower.jpg",
  src: "/images/flower.jpg",
};

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function explicitCoverFor(filename?: string) {
  if (!filename || filename === "auto") return undefined;
  return covers.find((cover) => cover.filename === filename);
}

function shuffledCovers(seed: string) {
  return [...covers].sort((a, b) => hashString(`${seed}:${a.filename}`) - hashString(`${seed}:${b.filename}`));
}

export function getCoverForPost(slug: string, explicitCover?: string): BlogCover {
  const exact = explicitCoverFor(explicitCover);
  if (exact) return exact;

  if (covers.length > 0) return covers[hashString(slug) % covers.length];
  return fallbackCover;
}

export function createCoverAllocator(posts: PostLike[]) {
  const assigned = new Map<string, BlogCover>();
  const autoPosts = posts.filter((post) => {
    const exact = explicitCoverFor(post.data.cover);
    if (exact) {
      assigned.set(post.id, exact);
      return false;
    }
    return true;
  });

  if (covers.length === 0) {
    for (const post of autoPosts) assigned.set(post.id, fallbackCover);
  } else {
    const seed = autoPosts.map((post) => post.id).sort().join("|") || "default";
    const pool = shuffledCovers(seed);
    autoPosts.forEach((post, index) => {
      assigned.set(post.id, pool[index % pool.length]);
    });
  }

  return (post: PostLike) => assigned.get(post.id) ?? getCoverForPost(post.id, post.data.cover);
}
