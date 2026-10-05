import type { ImageMetadata } from "astro";

export interface BlogCover {
  filename: string;
  src: ImageMetadata;
}

function hashId(id: string): number {
  let hash = 2166136261;
  for (const character of id) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function selectCoverFilename(
  id: string,
  requested: string,
  filenames: readonly string[],
): string {
  if (filenames.length === 0) throw new Error("Blog cover catalog is empty");
  if (requested === "auto") return filenames[hashId(id) % filenames.length];
  if (!filenames.includes(requested))
    throw new Error(`Unknown blog cover: ${requested}`);
  return requested;
}

export function resolveBlogCover(
  id: string,
  requested: string,
  catalog: readonly BlogCover[],
): BlogCover {
  const filename = selectCoverFilename(
    id,
    requested,
    catalog.map((item) => item.filename),
  );
  const cover = catalog.find((item) => item.filename === filename);
  if (!cover) throw new Error(`Blog cover is unavailable: ${filename}`);
  return cover;
}
