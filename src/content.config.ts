import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.union([z.string(), z.date()]).optional(),
    pubDate: z.coerce.date().optional(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    cover: z.string().optional().default("auto"),
    coverAlt: z.string().optional(),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = { blog };
