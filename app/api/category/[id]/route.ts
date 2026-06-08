
import { deleteFromCloudinary, uploadToCloudinary } from "@/config/cloudinary";
import { withDB } from "@/lib/HOF";
import { withAuth } from "@/lib/HOF/withAuth";
import { createCategorySlug, formatCategoryDisplayName, isValidCategoryName, normalizeCategoryName } from "@/lib/helpers/category";
import { Category } from "@/models";
import { ICategory } from "@/models/categoryModel";
import { ApiResponse } from "@/types/api";
import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { Types } from "mongoose";


//total apis
//category-get-by-id api/category/[id]
//category-update-by-id api/category/[id]
//category-delete-by-id api/category/[id]

function revalidateCategoryCaches() {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/category");
  revalidateTag("categories", "max");
  revalidateTag("products", "max");
  revalidateTag("homepage", "max");
}

function normalizeParentObjectId(value?: string | null) {
  if (!value || value === "null" || value.trim() === "" || !Types.ObjectId.isValid(value)) {
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

async function validateParentCategory(parentId: Types.ObjectId | null, currentId: string) {
  if (!parentId) return null;

  const parent = await Category.findById(parentId).select("_id").lean<{ _id: Types.ObjectId }>();
  if (!parent) return "Invalid parent category selected.";
  if (parent._id.toString() === currentId) return "A category cannot be its own parent";

  return null;
}

// category-get-by-id api/category/[id]
export const GET = withDB(async (req, _context?) => {
  const params = await _context?.params;
  const id = params?.id;
  if (!id) {
    return NextResponse.json({
      success: false,
      message: "product id missing",
      status: 404
    })
  }
  const singleCategory = await Category.findById(id).populate("parentId", "categoryName");
  if (singleCategory) {
    singleCategory.categoryName = formatCategoryDisplayName(singleCategory.categoryName);
  }
  const hasCategory = !!singleCategory;
  const response: ApiResponse<ICategory[]> = {
    success: hasCategory,
    message: hasCategory ? "Single category Fetched Successfully" : "category not found",
    data: singleCategory,
    status: hasCategory ? 200 : 400
  }
  return NextResponse.json(response, { status: response.status })
}, { resourceName: "category" });


// category-update-by-id api/category/[id]
export const PUT = withAuth(
  withDB(async (req, _context?) => {
    const params = await _context?.params;
    const id = params?.id;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "category id missing" },
        { status: 400 }
      );
    }

    const categoryToUpdate = await Category.findById(id);
    if (!categoryToUpdate) {
      return NextResponse.json({
        success: false,
        message: "category not found"
      }, { status: 404 });
    }
    const formData = await req.formData();
    const incomingCategoryName = normalizeCategoryName((formData.get("categoryName") as string) || "");
    const categoryName = incomingCategoryName || categoryToUpdate.categoryName;
    const slug = createCategorySlug(categoryName);
    const categoryImage = formData.get("categoryImage") as File;
    const parentId = formData.get("parentId") as string | null;

    if (hasInvalidParentValue(parentId)) {
      return NextResponse.json(
        { success: false, message: "Invalid parent category selected." },
        { status: 400 }
      );
    }

    const normalizedParentId =
      parentId !== null
        ? normalizeParentObjectId(parentId)
        : categoryToUpdate.parentId || null;

    const parentError = await validateParentCategory(normalizedParentId, id);
    if (parentError) {
      return NextResponse.json(
        { success: false, message: parentError },
        { status: 400 }
      );
    }

    if (!isValidCategoryName(categoryName)) {
      return NextResponse.json(
        { success: false, message: "Category name contains unsupported characters" },
        { status: 400 }
      );
    }

    const duplicateCategory = await Category.findOne({
      parentId: normalizedParentId,
      slug,
      _id: { $ne: id },
    });

    if (duplicateCategory) {
      return NextResponse.json(
        { success: false, message: duplicateCategoryMessage() },
        { status: 409 }
      );
    }

    categoryToUpdate.categoryName = categoryName;
    categoryToUpdate.slug = slug;
    if (categoryImage && categoryImage.size > 0) {
      if (categoryToUpdate.categoryImage) {
        await deleteFromCloudinary(categoryToUpdate.categoryImage);

      }

      const imageUrl = await uploadToCloudinary(categoryImage);
      categoryToUpdate.categoryImage = imageUrl;
    }
    if (parentId !== null) {
      categoryToUpdate.parentId = normalizedParentId;
    }
    try {
      await categoryToUpdate.save();
      revalidateCategoryCaches();
      return NextResponse.json({
        success: true,
        message: "category updated successfully",
        data: categoryToUpdate,
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
);

// category-delete-by-id api/category/[id]
export const DELETE = withAuth(
  withDB(async (req, _context?) => {
    const params = await _context?.params;
    const id = params?.id;
    const categoryToDelete = await Category.findById(id);
    if (!categoryToDelete) {
      return NextResponse.json({ error: "category not found" }, { status: 404 });
    }
    if (categoryToDelete.categoryImage) {
      await deleteFromCloudinary(categoryToDelete.categoryImage);
    }
    await categoryToDelete.deleteOne();
    revalidateCategoryCaches();
    return NextResponse.json({
      success: true,
      message: "category deleted successfully",
      data: categoryToDelete,
    });
  }, { resourceName: "category" }), { roles: ["admin"] }
);


