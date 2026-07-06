import { z } from "zod";

const trimmed = (max: number) => z.string().trim().max(max);

const linkUrl = trimmed(500)
  .default("#")
  .refine(
    (value) =>
      value === "#" ||
      value.startsWith("/") ||
      /^https?:\/\/[^\s]+$/i.test(value),
    "Link must be #, a site path beginning with /, or an http(s) URL"
  );

export const homeBottomTileSchema = z
  .object({
    title: trimmed(120).min(1, "Title is required"),
    subtitle: trimmed(120).optional().default(""),
    imageUrl: trimmed(2000).min(1, "An image is required"),
    linkUrl,
    ctaText: trimmed(60).optional().default(""),
    altText: trimmed(180).optional().default(""),
    sortOrder: z.coerce.number().int().min(0).max(9999),
    isActive: z.boolean(),
    publicId: trimmed(500).optional(),
  })
  .transform((value) => ({
    ...value,
    linkUrl: value.linkUrl || "#",
    altText: value.altText || value.title,
  }));
