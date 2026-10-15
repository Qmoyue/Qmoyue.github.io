import { z } from "astro/zod";

const articleDate = z.iso
  .date()
  .transform((value) => new Date(`${value}T00:00:00Z`));

export const articleMetadataSchema = z
  .object({
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    pubDate: articleDate,
    updatedDate: articleDate.optional(),
    tags: z.array(z.string().trim().min(1)).min(1),
    cover: z.string().trim().min(1),
    coverAlt: z.string().trim().min(1),
    draft: z.boolean(),
  })
  .refine((data) => !data.updatedDate || data.updatedDate >= data.pubDate, {
    path: ["updatedDate"],
    message: "updatedDate must not precede pubDate",
  });
