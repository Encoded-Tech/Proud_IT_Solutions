import { cacheLife, cacheTag } from "next/cache";
import { Types } from "mongoose";
import { Category } from "@/models";

type CategoryTreeItem = {
  _id: Types.ObjectId;
  categoryName: string;
  slug?: string;
  parentId?: Types.ObjectId | string | null;
};

function categoryMatches(category: CategoryTreeItem, categoryIdOrSlug: string) {
  return (
    category.slug === categoryIdOrSlug ||
    category.categoryName === categoryIdOrSlug ||
    category._id.toString() === categoryIdOrSlug
  );
}

export async function getCategoryAndDescendantIds(categoryIdOrSlug: string) {
  "use cache";

  cacheLife("hours");
  cacheTag("categories");

  const selected = categoryIdOrSlug.trim();
  if (!selected) return [];

  const categories = await Category.find({})
    .select("_id categoryName slug parentId")
    .lean<CategoryTreeItem[]>();

  const rootCategory = categories.find((category) => categoryMatches(category, selected));
  if (!rootCategory) return [];

  const childrenByParentId = new Map<string, CategoryTreeItem[]>();

  for (const category of categories) {
    if (!category.parentId) continue;

    const parentId = category.parentId.toString();
    const siblings = childrenByParentId.get(parentId) || [];
    siblings.push(category);
    childrenByParentId.set(parentId, siblings);
  }

  const ids: string[] = [];
  const stack = [rootCategory];

  while (stack.length > 0) {
    const category = stack.pop();
    if (!category) continue;

    ids.push(category._id.toString());
    stack.push(...(childrenByParentId.get(category._id.toString()) || []));
  }

  return ids;
}
