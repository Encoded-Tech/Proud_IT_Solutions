import { createCategorySlug, formatCategoryDisplayName } from "@/lib/helpers/category";

type CategoryReference = string | { id?: string; _id?: string } | null | undefined;

export type CategorySelectionItem = {
  id?: string;
  _id?: string;
  categoryName?: string;
  name?: string;
  slug?: string;
  path?: string;
  categoryImage?: string;
  parent?: CategoryReference;
  parentCategory?: CategoryReference;
  parentId?: CategoryReference;
  directProductCount?: number;
  productCount?: number;
};

export type CategoryPathOption = {
  value: string;
  label: string;
  leafName: string;
  slug?: string;
};

export type CategoryLeafGroup = {
  leafName: string;
  slug: string;
  options: CategoryPathOption[];
  count: number;
};

export type CategoryGlobalOption = {
  label: string;
  value: string;
  count: number;
};

export type PublicCategoryCardOption = {
  id: string;
  label: string;
  image: string;
  count: number;
  href: string;
  isGlobal: boolean;
};

const COMMON_CATEGORY_NAME_SLUGS = new Set(["i3", "i5", "i7", "i9", "15", "17"]);

export function getCategoryId(category: CategorySelectionItem) {
  return String(category.id || category._id || "");
}

export function getCategoryParentId(category: CategorySelectionItem) {
  const parent = category.parent || category.parentCategory || category.parentId;

  if (!parent) return null;
  if (typeof parent === "object") return String(parent.id || parent._id || "");

  return String(parent);
}

export function getCategoryLeafName(category: CategorySelectionItem) {
  return formatCategoryDisplayName(category.categoryName || category.name || category.slug || "");
}

export function formatCategoryPathFallback(path?: string) {
  return String(path || "")
    .split("/")
    .map((segment) => formatCategoryDisplayName(segment.replace(/-/g, " ")))
    .filter(Boolean)
    .join(" / ");
}

export function buildCategoryPath(
  category: CategorySelectionItem,
  categoryMap: Map<string, CategorySelectionItem>
) {
  const names: string[] = [];
  const visited = new Set<string>();
  let current: CategorySelectionItem | undefined = category;

  while (current) {
    const id = getCategoryId(current);
    if (id) {
      if (visited.has(id)) break;
      visited.add(id);
    }

    const label = getCategoryLeafName(current);
    if (label) names.unshift(label);

    const parentId = getCategoryParentId(current);
    current = parentId ? categoryMap.get(parentId) : undefined;
  }

  return names.join(" / ") || formatCategoryPathFallback(category.path) || getCategoryId(category);
}

export function buildCategoryPathOptions(
  categories: CategorySelectionItem[]
): CategoryPathOption[] {
  const categoryMap = new Map(
    categories
      .map((category) => [getCategoryId(category), category] as const)
      .filter(([id]) => Boolean(id))
  );

  return categories
    .map((category) => ({
      value: getCategoryId(category),
      label: buildCategoryPath(category, categoryMap),
      leafName: getCategoryLeafName(category),
      slug: category.slug,
    }))
    .filter((option) => option.value)
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
}

export function groupCategoriesByLeafName(
  options: CategoryPathOption[]
): CategoryLeafGroup[] {
  const grouped = new Map<string, CategoryLeafGroup>();

  for (const option of options) {
    const key = option.slug || option.leafName.toLowerCase();
    const current = grouped.get(key);

    if (current) {
      current.options.push(option);
      current.count += 1;
      continue;
    }

    grouped.set(key, {
      leafName: option.leafName,
      slug: key,
      options: [option],
      count: 1,
    });
  }

  return [...grouped.values()]
    .map((group) => ({
      ...group,
      options: [...group.options].sort((a, b) =>
        a.label.localeCompare(b.label, undefined, { sensitivity: "base" })
      ),
    }))
    .sort((a, b) => a.leafName.localeCompare(b.leafName, undefined, { sensitivity: "base" }));
}

export function buildGlobalCategoryOptions(
  categories: CategorySelectionItem[],
  options: { requireProductCount?: boolean } = {}
): CategoryGlobalOption[] {
  const grouped = new Map<
    string,
    {
      label: string;
      value: string;
      count: number;
      matches: number;
    }
  >();

  for (const category of categories) {
    const label = getCategoryLeafName(category);
    const value = category.slug || createCategorySlug(label);
    if (!label || !value) continue;

    const current = grouped.get(value);
    if (current) {
      current.count += category.directProductCount ?? category.productCount ?? 0;
      current.matches += 1;
      continue;
    }

    grouped.set(value, {
      label,
      value,
      count: category.directProductCount ?? category.productCount ?? 0,
      matches: 1,
    });
  }

  return [...grouped.values()]
    .filter((option) => option.matches > 1 || COMMON_CATEGORY_NAME_SLUGS.has(option.value))
    .filter((option) => !options.requireProductCount || option.count > 0)
    .map(({ label, value, count }) => ({ label, value, count }))
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
}

export function buildPublicCategoryCardOptions(
  categories: CategorySelectionItem[]
): PublicCategoryCardOption[] {
  const grouped = new Map<
    string,
    {
      id: string;
      label: string;
      image: string;
      slug: string;
      matches: number;
      directCount: number;
      descendantCount: number;
    }
  >();

  for (const category of categories) {
    const id = getCategoryId(category);
    const label = getCategoryLeafName(category);
    const slug = category.slug || createCategorySlug(label);
    if (!id || !label || !slug) continue;

    const current = grouped.get(slug);
    if (current) {
      current.matches += 1;
      current.directCount += category.directProductCount ?? 0;
      current.descendantCount += category.productCount ?? 0;
      if (!current.image && category.categoryImage) current.image = category.categoryImage;
      continue;
    }

    grouped.set(slug, {
      id,
      label,
      image: category.categoryImage || "",
      slug,
      matches: 1,
      directCount: category.directProductCount ?? 0,
      descendantCount: category.productCount ?? 0,
    });
  }

  return [...grouped.values()]
    .map((group) => {
      const isGlobal = group.matches > 1 || COMMON_CATEGORY_NAME_SLUGS.has(group.slug);
      const count = isGlobal ? group.directCount : group.descendantCount;

      return {
        id: isGlobal ? group.slug : group.id,
        label: group.label,
        image: group.image,
        count,
        href: isGlobal
          ? `/shop?categoryName=${encodeURIComponent(group.slug)}`
          : `/shop?categoryId=${encodeURIComponent(group.id)}`,
        isGlobal,
      };
    })
    .filter((option) => option.count > 0)
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
}

export function splitCategoryOptionsByLeafGroup(options: CategoryPathOption[]) {
  const groups = groupCategoriesByLeafName(options);
  const commonGroups = groups.filter((group) => group.options.length > 1);
  const commonValues = new Set(commonGroups.flatMap((group) => group.options.map((option) => option.value)));
  const remainingOptions = options.filter((option) => !commonValues.has(option.value));

  return {
    commonGroups,
    remainingOptions,
  };
}
