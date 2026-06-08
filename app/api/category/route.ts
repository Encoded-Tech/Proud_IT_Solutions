import { uploadToCloudinary } from "@/config/cloudinary";

import { createCategorySlug, formatCategoryDisplayName, isValidCategoryName, normalizeCategoryName } from "@/lib/helpers/category";
import { checkRequiredFields } from "@/lib/helpers/validateRequiredFields";
import { withDB } from "@/lib/HOF";
import { withAuth } from "@/lib/HOF/withAuth";
import { Category, Product } from "@/models";
import { ICategory } from "@/models/categoryModel";
import { ApiResponse } from "@/types/api";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { Types } from "mongoose";

//total apis
//category-get-all api/category
//category-create api/category

function revalidateCategoryCaches() {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/category");
  revalidateTag("categories", "max");
  revalidateTag("products", "max");
  revalidateTag("homepage", "max");
}

function normalizeParentObjectId(value?: string | null) {
  if (!value || value === "null" || value === "" || !Types.ObjectId.isValid(value)) {
    return null;
  }

  return new Types.ObjectId(value);
}

function hasInvalidParentValue(value?: string | null) {
  return Boolean(value && value !== "null" && value.trim() !== "" && !Types.ObjectId.isValid(value));
}

type DuplicateKeyErrorShape = {
  code?: number;
  keyPattern?: Record<string, unknown>;
  keyValue?: Record<string, unknown>;
  message?: string;
};

function isDuplicateKeyError(error: unknown): error is DuplicateKeyErrorShape {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as DuplicateKeyErrorShape).code === 11000
  );
}

function duplicateCategoryMessage(error?: DuplicateKeyErrorShape) {
  if (
    error?.keyPattern?.categoryName ||
    error?.message?.includes("categoryName_1")
  ) {
    return "The database still has the old global categoryName unique index. Run npm run sync:category-indexes, or drop db.categories.dropIndex(\"categoryName_1\") from MongoDB.";
  }

  return "A category with this name already exists under the selected parent.";
}

async function validateParentCategory(parentId: Types.ObjectId | null) {
  if (!parentId) return null;

  const parent = await Category.findById(parentId).select("_id").lean<{ _id: Types.ObjectId }>();
  if (!parent) return "Invalid parent category selected.";

  return null;
}

function buildDescendantProductCounts(categories: ICategory[], directCounts: Map<string, number>) {
  const childrenByParent = new Map<string, ICategory[]>();

  for (const category of categories) {
    const parentKey = category.parentId?._id?.toString?.() || category.parentId?.toString() || "root";
    const children = childrenByParent.get(parentKey) || [];

    children.push(category);
    childrenByParent.set(parentKey, children);
  }

  const totals = new Map<string, number>();
  const getTotal = (category: ICategory): number => {
    const id = category._id.toString();
    if (totals.has(id)) return totals.get(id) || 0;

    const childTotal = (childrenByParent.get(id) || []).reduce(
      (total, child) => total + getTotal(child),
      0
    );
    const total = (directCounts.get(id) || 0) + childTotal;

    totals.set(id, total);
    return total;
  };

  for (const category of categories) {
    getTotal(category);
  }

  return totals;
}

// category-get-all api/category
export const GET = withDB(async () => {
  // 1) Fetch categories
  const categories = await Category.find({ isActive: true })
    .populate("parentId", "categoryName")
    .sort({ createdAt: -1 })
    .lean<ICategory[]>(); // IMPORTANT: gives plain objects for merging

  if (!categories.length) {
    const response: ApiResponse<ICategory[]> = {
      success: false,
      message: "no categories found",
      data: [],
      status: 404,
    };
    return NextResponse.json(response, { status: 404 });
  }

  // 2) Fetch product counts (single DB query)
  const productCounts = await Product.aggregate([
    {
      $match: {
        isActive: true,
      },
    },
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
  ]);

  // Convert counts to a Map for O(1) lookup
  const countMap = new Map(
    productCounts.map((item) => [item._id.toString(), item.count])
  );
  const descendantCountMap = buildDescendantProductCounts(categories, countMap);

  // 3) Merge categories + counts
  const categoriesWithCount = categories
    .map((cat) => ({
      ...cat,
      categoryName: formatCategoryDisplayName(cat.categoryName),
      productCount: descendantCountMap.get(cat._id.toString()) || 0,
    }))
    .filter((cat) => cat.productCount > 0);


  return NextResponse.json({
    success: true,
    message: "categories fetched successfully",
    data: categoriesWithCount,
  
  }, { status: 200 });
}, {
  resourceName: "category",
});

// category-create api/category
export const POST = withAuth(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  withDB(async (req: NextRequest, context?) => {

    const formData = await req.formData();
    const categoryName = normalizeCategoryName((formData.get("categoryName") as string) || "");
    const slug = createCategorySlug(categoryName);
    const categoryImage = formData.get("categoryImage") as File;
    const parentId = formData.get("parentId") as string | null;

    const requiredFields = { categoryName, categoryImage }
    const missingFields = checkRequiredFields(requiredFields);
    if (missingFields) return missingFields;

    if (!isValidCategoryName(categoryName)) {
      return NextResponse.json(
        { success: false, message: "Category name contains unsupported characters" },
        { status: 400 }
      );
    }

    if (hasInvalidParentValue(parentId)) {
      return NextResponse.json(
        { success: false, message: "Invalid parent category selected." },
        { status: 400 }
      );
    }

    const normalizedParentId = normalizeParentObjectId(parentId);
    const parentError = await validateParentCategory(normalizedParentId);
    if (parentError) {
      return NextResponse.json(
        { success: false, message: parentError },
        { status: 400 }
      );
    }

    const existingCategory = await Category.findOne({
      parentId: normalizedParentId,
      slug,
    });
    if (existingCategory) {
      return NextResponse.json(
        { success: false, message: duplicateCategoryMessage() },
        { status: 409 }
      );
    }

    let imageUrl: string | null = null;
    if (categoryImage && categoryImage.size > 0) {
      imageUrl = await uploadToCloudinary(categoryImage);
    }
    try {
      const createCategory = await Category.create({ categoryName, slug, categoryImage: imageUrl, parentId: normalizedParentId });
      revalidateCategoryCaches();
      return NextResponse.json({
        success: true,
        message: "Category created successfully",
        data: createCategory,
      });
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        return NextResponse.json(
          { success: false, message: duplicateCategoryMessage(error) },
          { status: 409 }
        );
      }

      throw error;
    }
  }, { resourceName: "category" }),
  { roles: ["admin"] }
)



