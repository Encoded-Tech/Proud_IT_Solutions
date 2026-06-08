import { cacheLife, cacheTag } from "next/cache";
import { Types } from "mongoose";
import { Category } from "@/models";
import { createCategorySlug, normalizeCategoryName } from "@/lib/helpers/category";

type CategoryTreeItem = {
  _id: Types.ObjectId;
  categoryName: string;
  slug?: string;
  parentId?: Types.ObjectId | string | null;
};

function categoryMatches(category: CategoryTreeItem, categoryIdOrSlug: string) {
  const normalizedName = normalizeCategoryName(categoryIdOrSlug);
  const slug = createCategorySlug(categoryIdOrSlug);

  return (
    category.slug === slug ||
    normalizeCategoryName(category.categoryName).toLowerCase() ===
      normalizedName.toLowerCase() ||
    category._id.toString() === categoryIdOrSlug
  );
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getChildrenByParentId(categories: CategoryTreeItem[]) {
  const childrenByParentId = new Map<string, CategoryTreeItem[]>();

  for (const category of categories) {
    const parentId = category.parentId?.toString() || "root";
    const siblings = childrenByParentId.get(parentId) || [];
    siblings.push(category);
    childrenByParentId.set(parentId, siblings);
  }

  return childrenByParentId;
}

function collectCategoryAndDescendantIds(
  rootCategories: CategoryTreeItem[],
  childrenByParentId: Map<string, CategoryTreeItem[]>
) {
  const ids = new Set<string>();
  const stack = [...rootCategories];

  while (stack.length > 0) {
    const category = stack.pop();
    if (!category) continue;

    const id = category._id.toString();
    if (ids.has(id)) continue;

    ids.add(id);
    stack.push(...(childrenByParentId.get(id) || []));
  }

  return [...ids];
}

function resolveCategoryPath(
  path: string,
  categories: CategoryTreeItem[],
  childrenByParentId: Map<string, CategoryTreeItem[]>
) {
  const segments = path
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (segments.length === 0) return [];

  let parentIds = ["root"];
  let matches: CategoryTreeItem[] = [];

  for (const segment of segments) {
    const slug = createCategorySlug(segment);
    const parentSet = new Set(parentIds);

    matches = categories.filter(
      (category) =>
        category.slug === slug &&
        parentSet.has(category.parentId?.toString() || "root")
    );

    if (matches.length === 0) return [];
    parentIds = matches.map((category) => category._id.toString());
  }

  return collectCategoryAndDescendantIds(matches, childrenByParentId);
}

export async function getCategoryAndDescendantIds(categoryIdOrSlug: string, activeOnly = true) {
  "use cache";

  cacheLife("hours");
  cacheTag("categories");

  const selected = decodeURIComponent(categoryIdOrSlug).trim();
  if (!selected) return [];

  const categories = await Category.find(activeOnly ? { isActive: true } : {})
    .select("_id categoryName slug parentId")
    .lean<CategoryTreeItem[]>();

  const childrenByParentId = getChildrenByParentId(categories);

  if (selected.includes("/")) {
    return resolveCategoryPath(selected, categories, childrenByParentId);
  }

  if (selected.startsWith("name:")) {
    const selectedName = selected.slice("name:".length);
    const slug = createCategorySlug(selectedName);
    const normalizedName = normalizeCategoryName(selectedName).toLowerCase();
    const matchingCategories = categories.filter(
      (category) =>
        category.slug === slug ||
        normalizeCategoryName(category.categoryName).toLowerCase() === normalizedName
    );

    return collectCategoryAndDescendantIds(matchingCategories, childrenByParentId);
  }

  const rootCategories = categories.filter((category) => categoryMatches(category, selected));
  if (rootCategories.length === 0) return [];

  return collectCategoryAndDescendantIds(rootCategories, childrenByParentId);
}

export async function getCategoryIdsByGlobalName(name: string, activeOnly = true) {
  "use cache";

  cacheLife("hours");
  cacheTag("categories");

  const normalizedName = normalizeCategoryName(decodeURIComponent(name || ""));
  const slug = createCategorySlug(normalizedName);
  if (!slug) return [];

  const categories = await Category.find({
    $or: [
      { slug },
      { categoryName: { $regex: `^${escapeRegex(normalizedName)}$`, $options: "i" } },
    ],
    ...(activeOnly ? { isActive: { $ne: false } } : {}),
  })
    .select("_id")
    .lean<Array<{ _id: Types.ObjectId }>>();

  return categories.map((category) => category._id.toString());
}
