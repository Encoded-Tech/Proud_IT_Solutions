import type { ProductHighlight } from "@/types/product";

const MAX_PRODUCT_HIGHLIGHTS = 6;

export function sanitizeProductHighlights(input: unknown): ProductHighlight[] {
  if (!Array.isArray(input)) return [];

  return input
    .map((item) => {
      const candidate =
        item && typeof item === "object"
          ? (item as { label?: unknown; specs?: unknown })
          : {};

      return {
        label: String(candidate.label ?? "").trim(),
        specs: String(candidate.specs ?? "").trim(),
      };
    })
    .filter((item) => item.label && item.specs)
    .slice(0, MAX_PRODUCT_HIGHLIGHTS);
}

export { MAX_PRODUCT_HIGHLIGHTS };
