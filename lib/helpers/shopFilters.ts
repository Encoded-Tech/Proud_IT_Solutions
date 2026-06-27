export const SHOP_FILTER_PARAM_KEYS = [
  "categoryId",
  "categoryName",
  "brand",
  "minPrice",
  "maxPrice",
  "rating",
  "sort",
  "search",
  "page",
] as const;

export type ShopFilterParamKey = (typeof SHOP_FILTER_PARAM_KEYS)[number];
export type ShopFilterParamValue = string | number | null | undefined;
export type ShopFilterUpdate = Partial<Record<ShopFilterParamKey, ShopFilterParamValue>>;

/**
 * Builds shop URLs without dropping unrelated, relevant query parameters.
 * Empty values are removed and a filter change can atomically reset pagination.
 */
export function buildShopFilterParams(
  current: URLSearchParams | ReadonlyURLSearchParams,
  updates: ShopFilterUpdate,
  options: { resetPage?: boolean } = {}
) {
  const params = new URLSearchParams(current.toString());

  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === undefined || String(value).trim() === "") {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
  }

  // All category links are canonicalized to categoryId/categoryName.
  if ("categoryId" in updates || "categoryName" in updates) {
    params.delete("category");
  }

  if (options.resetPage) {
    params.set("page", "1");
  }

  return params;
}

export function buildShopUrl(params: URLSearchParams) {
  const query = params.toString();
  return query ? `/shop?${query}` : "/shop";
}

// Kept structural so this helper works with Next's ReadonlyURLSearchParams too.
type ReadonlyURLSearchParams = Pick<URLSearchParams, "toString">;
