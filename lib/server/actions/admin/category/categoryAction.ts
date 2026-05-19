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

function revalidateCategoryCaches() {
  revalidatePath("/admin/category");
  revalidatePath("/admin", "layout");
  revalidatePath("/");
  revalidatePath("/shop");
  revalidateTag("categories", "max");
  revalidateTag("products", "max");
  revalidateTag("homepage", "max");
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

  let parentId: mongoose.Types.ObjectId | null = null;
  if (parentIdRaw && mongoose.Types.ObjectId.isValid(parentIdRaw)) {
    parentId = new mongoose.Types.ObjectId(parentIdRaw);
  }

  let imageUrl = "";
  if (image && image.size > 0) {
    imageUrl = await uploadToCloudinary(image);
  }

  const existingCategory = await Category.findOne({
    $or: [{ categoryName }, { slug }],
  });
  if (existingCategory) {
    return {
      success: false,
      message: "Category already exists",
    };
  }

  const category = await Category.create({
    categoryName,
    slug,
    parentId,
    categoryImage: imageUrl,
  });

  revalidateCategoryCaches();

  return {
    success: true,
    message: "Category created successfully",
    data: mapCategoryToFrontend(category),
  };
}

export async function updateCategory(id: string, fd: FormData) {
  await connectDB();
  await requireAdmin();

  const category = await Category.findById(id);
  if (!category) {
    return { success: false, message: "Category not found" };
  }

  const name = normalizeCategoryName((fd.get("categoryName") as string) || "");
  const slug = createCategorySlug(name);
  const parentId = fd.get("parentId") as string;
  const image = fd.get("categoryImage") as File | null;

  if (name) {
    if (!isValidCategoryName(name)) {
      return { success: false, message: "Category name contains unsupported characters" };
    }

    const duplicateCategory = await Category.findOne({
      $or: [{ categoryName: name }, { slug }],
      _id: { $ne: id },
    });

    if (duplicateCategory) {
      return { success: false, message: "Category already exists" };
    }

    category.categoryName = name;
    category.slug = slug;
  }
  category.parentId = parentId && parentId !== "null" ? parentId : null;

  if (image && image.size > 0) {
    if (category.categoryImage) {
      await deleteFromCloudinary(category.categoryImage);
    }
    category.categoryImage = await uploadToCloudinary(image);
  }

  await category.save();
  revalidateCategoryCaches();

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
