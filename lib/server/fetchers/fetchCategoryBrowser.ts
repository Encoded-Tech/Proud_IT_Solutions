import { cacheLife, cacheTag } from "next/cache";
import { Types } from "mongoose";
import { connectDB } from "@/db";
import { Category, Product } from "@/models";
import { IProduct } from "@/models/productModel";
import { formatCategoryDisplayName } from "@/lib/helpers/category";
import { mapProductToFrontend } from "@/lib/server/mappers/MapProductData";
import { productType } from "@/types/product";

const COMMON_GLOBAL_CATEGORY_SLUGS = new Set(["i3", "i5", "i7", "i9", "15", "17"]);

type CategoryNode = {
  id: string;
  objectId: Types.ObjectId;
  categoryName: string;
  slug: string;
  categoryImage: string;
  parentId: string | null;
  directProductCount: number;
  productCount: number;
};

type CategoryCardMode = "global-root" | "exact";

export type CategoryBrowseCard = {
  id: string;
  categoryName: string;
  slug: string;
  categoryImage: string;
  productCount: number;
  href: string;
};

export type CategoryBrowseData = {
  title: string;
  description: string;
  breadcrumbs: Array<{ label: string; href: string }>;
  totalProductCount: number;
  categories: CategoryBrowseCard[];
  shortcutCategories: CategoryBrowseCard[];
  products: productType[];
  notFound: boolean;
};

function getChildrenMap(categories: CategoryNode[]) {
  const childrenByParent = new Map<string, CategoryNode[]>();

  for (const category of categories) {
    const parentKey = category.parentId || "root";
    const children = childrenByParent.get(parentKey) || [];
    children.push(category);
    childrenByParent.set(parentKey, children);
  }

  return childrenByParent;
}

function getDescendantIds(
  categoryIds: string[],
  childrenByParent: Map<string, CategoryNode[]>
) {
  const ids = new Set<string>(categoryIds);
  const stack = [...categoryIds];

  while (stack.length > 0) {
    const id = stack.pop();
    if (!id) continue;

    for (const child of childrenByParent.get(id) || []) {
      if (ids.has(child.id)) continue;
      ids.add(child.id);
      stack.push(child.id);
    }
  }

  return [...ids];
}

function buildCategoryCards(
  categories: CategoryNode[],
  hrefPrefix: string,
  allCategories: CategoryNode[],
  mode: CategoryCardMode
): CategoryBrowseCard[] {
  const globalGroups = new Map<
    string,
    {
      categoryName: string;
      categoryImage: string;
      directProductCount: number;
      matches: number;
    }
  >();

  for (const category of allCategories) {
    const current = globalGroups.get(category.slug);

    if (current) {
      current.directProductCount += category.directProductCount;
      current.matches += 1;
      if (!current.categoryImage && category.categoryImage) {
        current.categoryImage = category.categoryImage;
      }
      continue;
    }

    globalGroups.set(category.slug, {
      categoryName: category.categoryName,
      categoryImage: category.categoryImage,
      directProductCount: category.directProductCount,
      matches: 1,
    });
  }

  const grouped = new Map<string, CategoryBrowseCard>();

  for (const category of categories) {
    const key = category.slug;
    const globalGroup = globalGroups.get(key);
    const isGlobal =
      mode === "global-root" &&
      (Boolean(globalGroup && globalGroup.matches > 1) ||
        COMMON_GLOBAL_CATEGORY_SLUGS.has(key));
    const productCount = isGlobal
      ? globalGroup?.directProductCount || 0
      : category.productCount;

    if (productCount < 1) continue;

    const current = grouped.get(key);
    if (current) {
      if (!isGlobal) current.productCount += productCount;
      continue;
    }

    grouped.set(key, {
      id: isGlobal ? key : category.id,
      categoryName: globalGroup?.categoryName || category.categoryName,
      slug: category.slug,
      categoryImage: globalGroup?.categoryImage || category.categoryImage,
      productCount,
      href: isGlobal
        ? `/shop?categoryName=${encodeURIComponent(key)}`
        : `${hrefPrefix}/${category.slug}`,
    });
  }

  return [...grouped.values()].sort((a, b) =>
    a.categoryName.localeCompare(b.categoryName, undefined, { sensitivity: "base" })
  );
}

function resolveSegmentMatches(
  segment: string,
  parentIds: Array<string | null>,
  scopedRootIds: string[],
  categories: CategoryNode[],
  childrenByParent: Map<string, CategoryNode[]>
) {
  const parentSet = new Set(parentIds.map((id) => id || "root"));
  const directMatches = categories.filter(
    (category) =>
      category.slug === segment && parentSet.has(category.parentId || "root")
  );

  if (directMatches.length > 0 || scopedRootIds.length === 0) {
    return directMatches;
  }

  const scopedIds = new Set(getDescendantIds(scopedRootIds, childrenByParent));
  return categories.filter(
    (category) => category.slug === segment && scopedIds.has(category.id)
  );
}

export async function fetchCategoryBrowseData(
  segments: string[] = []
): Promise<CategoryBrowseData> {
  "use cache";

  cacheLife("minutes");
  cacheTag("categories");
  cacheTag("products");

  await connectDB();

  const [rawCategories, productCounts] = await Promise.all([
    Category.find({ isActive: true })
      .select("_id categoryName slug categoryImage parentId createdAt")
      .sort({ categoryName: 1 })
      .lean<
        Array<{
          _id: Types.ObjectId;
          categoryName: string;
          slug: string;
          categoryImage?: string;
          parentId?: Types.ObjectId | null;
        }>
      >(),
    Product.aggregate<{ _id: Types.ObjectId; count: number }>([
      { $match: { isActive: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]),
  ]);

  const directCountMap = new Map(
    productCounts.map((item) => [item._id.toString(), item.count])
  );

  const categories: CategoryNode[] = rawCategories.map((category) => ({
    id: category._id.toString(),
    objectId: category._id,
    categoryName: formatCategoryDisplayName(category.categoryName),
    slug: category.slug,
    categoryImage: category.categoryImage || "",
    parentId: category.parentId?.toString() || null,
    directProductCount: directCountMap.get(category._id.toString()) || 0,
    productCount: directCountMap.get(category._id.toString()) || 0,
  }));

  const childrenByParent = getChildrenMap(categories);
  const categoryById = new Map(categories.map((category) => [category.id, category]));

  const calculateCount = (category: CategoryNode): number => {
    const childCount = (childrenByParent.get(category.id) || []).reduce(
      (total, child) => total + calculateCount(child),
      0
    );
    category.productCount = category.directProductCount + childCount;
    return category.productCount;
  };

  for (const root of childrenByParent.get("root") || []) {
    calculateCount(root);
  }

  const breadcrumbs = [{ label: "Categories", href: "/shop/categories" }];
  let selectedIds: string[] = [];
  let currentParentIds: Array<string | null> = [null];
  let hrefPrefix = "/shop/categories";
  let notFound = false;
  const selectedLabels: string[] = [];

  for (const segment of segments) {
    const matches = resolveSegmentMatches(
      segment,
      currentParentIds,
      selectedIds,
      categories,
      childrenByParent
    ).filter((category) => category.productCount > 0);

    if (matches.length === 0) {
      notFound = true;
      break;
    }

    selectedIds = matches.map((category) => category.id);
    currentParentIds = selectedIds;
    hrefPrefix += `/${segment}`;

    const label = matches[0]?.categoryName || segment;
    selectedLabels.push(label);
    breadcrumbs.push({ label, href: hrefPrefix });
  }

  if (notFound) {
    return {
      title: "Category not found",
      description: "This category is unavailable or has no active products.",
      breadcrumbs,
      totalProductCount: 0,
      categories: [],
      shortcutCategories: [],
      products: [],
      notFound: true,
    };
  }

  const childCategories =
    selectedIds.length === 0
      ? childrenByParent.get("root") || []
      : selectedIds.flatMap((id) => childrenByParent.get(id) || []);

  const categoriesToShow = buildCategoryCards(
    childCategories,
    hrefPrefix,
    categories,
    selectedIds.length === 0 ? "global-root" : "exact"
  );
  const childCategoryIds = new Set(childCategories.map((category) => category.id));
  const scopedDescendantIds =
    selectedIds.length > 0 ? getDescendantIds(selectedIds, childrenByParent) : [];
  const shortcutCategories =
    selectedIds.length > 0 && categoriesToShow.length > 0
      ? buildCategoryCards(
          scopedDescendantIds
            .map((id) => categoryById.get(id))
            .filter((category): category is CategoryNode => Boolean(category))
            .filter(
              (category) =>
                !selectedIds.includes(category.id) && !childCategoryIds.has(category.id)
            ),
          hrefPrefix,
          categories,
          "exact"
        )
      : [];
  const shouldShowProducts = selectedIds.length > 0 && categoriesToShow.length === 0;
  let products: productType[] = [];

  if (shouldShowProducts) {
    const productCategoryIds = getDescendantIds(selectedIds, childrenByParent)
      .map((id) => categoryById.get(id)?.objectId)
      .filter((id): id is Types.ObjectId => Boolean(id));

    const rawProducts = await Product.find({
      isActive: true,
      category: { $in: productCategoryIds },
    })
      .sort({ createdAt: -1 })
      .limit(96)
      .select(
        "name slug highlights price stock reservedStock category images variants avgRating totalReviews totalSales offeredPrice brandName isOfferedPriceActive discountPercent offerStartDate offerEndDate isActive createdAt updatedAt"
      )
      .populate("category", "categoryName slug categoryImage isActive createdAt")
      .populate({
        path: "variants",
        match: { isActive: true },
        select: "price stock specs images isActive",
      })
      .lean<IProduct[]>();

    products = rawProducts.map(mapProductToFrontend);
  }

  const activeTitle = selectedLabels[selectedLabels.length - 1];
  const totalProductCount =
    selectedIds.length > 0
      ? selectedIds.reduce(
          (total, id) => total + (categoryById.get(id)?.productCount || 0),
          0
        )
      : (childrenByParent.get("root") || []).reduce(
          (total, category) => total + category.productCount,
          0
        );

  return {
    title: activeTitle || "Shop by Category",
    description: activeTitle
      ? `Browse products and subcategories under ${activeTitle}.`
      : "Explore our product categories and find the right items faster.",
    breadcrumbs,
    totalProductCount,
    categories: categoriesToShow,
    shortcutCategories,
    products,
    notFound: false,
  };
}
