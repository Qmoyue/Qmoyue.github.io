import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { articleMetadataSchema } from "./domain/blog/metadata";

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: articleMetadataSchema,
});

export const collections = { blog };
