import type { ImageMetadata } from "astro";
import { createBlogRepository } from "../domain/blog/repository";

const modules = import.meta.glob<{ default: ImageMetadata }>(
  "../assets/blog-covers/*.{jpg,jpeg,png,webp,avif}",
  { eager: true },
);

const covers = Object.entries(modules)
  .map(([path, module]) => ({
    filename: path.slice(path.lastIndexOf("/") + 1),
    src: module.default,
  }))
  .sort((a, b) => a.filename.localeCompare(b.filename));

export const blogRepository = createBlogRepository(covers);
