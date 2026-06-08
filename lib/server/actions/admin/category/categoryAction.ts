"use server";

import { Types } from "mongoose";
import mongoose from "mongoose";
import { revalidatePath, revalidateTag } from "next/cache";
import { connectDB } from "@/db";
import { deleteFromCloudinary, uploadToCloudinary } from "@/config/cloudinary";
import { requireAdmin } from "@/lib/auth/requireSession";
import { createCategorySlug, formatCategoryDisplayName, isValidCategoryName, normalizeCategoryName } from "@/lib/helpers/category";
import { mapCategoryToFrontend } from "@/lib/server/mappers/MapCategory";
import { Category } from "@/models/categoryModel";

export interface CategoryResponse {
  _id: string;
  categoryName: string;
  parentId: {
    _id: string;
    categoryName: string;
  } | null;
}

export interface CategoryLean {
  _id: Types.ObjectId;
  categoryName: string;
  parentId?: Types.ObjectId | null;
}

function normalizeParentObjectId(value?: string | null) {
  if (!value || value === "null" || !mongoose.Types.ObjectId.isValid(value)) {
    return null;
  }

  return new mongoose.Types.ObjectId(value);
}

function hasInvalidParentValue(value?: string | null) {
  return Boolean(value && value !== "null" && value.trim() !== "" && !mongoose.Types.ObjectId.isValid(value));
}

function revalidateCategoryCaches() {
  revalidatePath("/admin/category");
  revalidatePath("/admin", "layout");
  revalidatePath("/");
  revalidatePath("/shop");
  revalidateTag("categories", "max");
  revalidateTag("products", "max");
  revalidateTag("homepage", "max");
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

async function validateParentCategory(parentId: Types.ObjectId | null, currentId?: string) {
  if (!parentId) return null;

  const parent = await Category.findById(parentId).select("_id").lean<{ _id: Types.ObjectId }>();
  if (!parent) {
    return "Invalid parent category selected.";
  }

  if (currentId && parent._id.toString() === currentId) {
    return "A category cannot be its own parent";
  }

  return null;
}

export async function getCategories(): Promise<{
  success: boolean;
  message?: string;
  data: CategoryResponse[];
}> {
  try {
    await connectDB();

    const categories = await Category.find({})
      .select("_id categoryName parentId")
      .lean<CategoryLean[]>();

    return {
      success: true,
      message: "Categories fetched successfully",
      data: categories.map((category) => ({
        _id: category._id.toString(),
        categoryName: formatCategoryDisplayName(category.categoryName),
        parentId: category.parentId
          ? {
              _id: category.parentId.toString(),
              categoryName: "",
            }
          : null,
      })),
    };
  } catch (error) {
    console.error(error);
    return { success: false, data: [] };
  }
}

export async function createCategory(fd: FormData) {
  await connectDB();
  await requireAdmin();

  const categoryName = normalizeCategoryName((fd.get("categoryName") as string) || "");
  const slug = createCategorySlug(categoryName);
  const parentIdRaw = fd.get("parentId") as string | null;
  const image = fd.get("categoryImage") as File | null;
  const isActiveRaw = fd.get("isActive") as string | null;

  if (!categoryName || !categoryName.trim()) {
    return {
      success: false,
      message: "Category name is required",
    };
  }

  if (!isValidCategoryName(categoryName)) {
    return {
      success: false,
      message: "Category name contains unsupported characters",
    };
  }

  const parentId = normalizeParentObjectId(parentIdRaw);
  if (hasInvalidParentValue(parentIdRaw)) {
    return {
      success: false,
      message: "Invalid parent category selected.",
    };
  }

  const parentError = await validateParentCategory(parentId);
  if (parentError) {
    return {
      success: false,
      message: parentError,
    };
  }

  let imageUrl = "";
  if (image && image.size > 0) {
    imageUrl = await uploadToCloudinary(image);
  }

  const existingCategory = await Category.findOne({
    parentId,
    slug,
  });
  if (existingCategory) {
    return {
      success: false,
      message: duplicateCategoryMessage(),
    };
  }

  try {
    const category = await Category.create({
      categoryName,
      slug,
      parentId,
      categoryImage: imageUrl,
      isActive: isActiveRaw === null ? true : isActiveRaw === "true",
    });

    revalidateCategoryCaches();

    return {
      success: true,
      message: "Category created successfully",
      data: mapCategoryToFrontend(category),
    };
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return {
        success: false,
        message: duplicateCategoryMessage(error),
      };
    }

    throw error;
  }
}

export async function updateCategory(id: string, fd: FormData) {
  await connectDB();
  await requireAdmin();

  const category = await Category.findById(id);
  if (!category) {
    return { success: false, message: "Category not found" };
  }

  const incomingName = normalizeCategoryName((fd.get("categoryName") as string) || "");
  const parentIdRaw = fd.get("parentId") as string | null;
  const image = fd.get("categoryImage") as File | null;
  const isActiveRaw = fd.get("isActive") as string | null;
  const parentId = normalizeParentObjectId(parentIdRaw);
  const name = incomingName || category.categoryName;
  const slug = createCategorySlug(name);

  if (hasInvalidParentValue(parentIdRaw)) {
    return { success: false, message: "Invalid parent category selected." };
  }

  const parentError = await validateParentCategory(parentId, id);
  if (parentError) {
    return { success: false, message: parentError };
  }

  if (!isValidCategoryName(name)) {
    return { success: false, message: "Category name contains unsupported characters" };
  }

  const duplicateCategory = await Category.findOne({
    parentId,
    slug,
    _id: { $ne: id },
  });

  if (duplicateCategory) {
    return { success: false, message: duplicateCategoryMessage() };
  }

  category.categoryName = name;
  category.slug = slug;
  category.parentId = parentId;
  if (isActiveRaw !== null) {
    category.isActive = isActiveRaw === "true";
  }

  if (image && image.size > 0) {
    if (category.categoryImage) {
      await deleteFromCloudinary(category.categoryImage);
    }
    category.categoryImage = await uploadToCloudinary(image);
  }

  try {
    await category.save();
    revalidateCategoryCaches();
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return {
        success: false,
        message: duplicateCategoryMessage(error),
      };
    }

    throw error;
  }

  return {
    success: true,
    message: "Category updated successfully",
    data: mapCategoryToFrontend(category),
  };
}

export async function deleteCategory(id: string) {
  await connectDB();
  await requireAdmin();

  const category = await Category.findById(id);
  if (!category) return { success: false };

  if (category.categoryImage) {
    await deleteFromCloudinary(category.categoryImage);
  }

  await category.deleteOne();
  revalidateCategoryCaches();

  return { success: true, message: "Category deleted successfully" };
}
