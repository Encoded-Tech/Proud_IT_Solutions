// 
"use server";

import { Category } from "@/models/categoryModel";


import { revalidatePath } from "next/cache";
import { mapCategoryToFrontend } from "@/lib/server/mappers/MapCategory";
import { deleteFromCloudinary, uploadToCloudinary } from "@/config/cloudinary";
import { connectDB } from "@/db";
import { requireAdmin } from "@/lib/auth/requireSession";
import mongoose from "mongoose";



export async function getCategories() {
  try {
    await connectDB();

    const categories = await Category.find({})
      .select("_id categoryName parentId")
      .lean();

    return {
      success: true,
      data: categories.map((c) => ({
        _id: c.id,
        categoryName: c.categoryName,
        parentId: c.parentId
          ? {
              _id: c.parentId.toString(),
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

  const categoryName = fd.get("categoryName") as string;
  const parentIdRaw = fd.get("parentId") as string | null;
  const image = fd.get("categoryImage") as File | null;

  if (!categoryName || !categoryName.trim()) {
    return {
      success: false,
      message: "Category name is required",
    };
  }

  // ✅ SAFE ObjectId handling
  let parentId: mongoose.Types.ObjectId | null = null;

  if (parentIdRaw && mongoose.Types.ObjectId.isValid(parentIdRaw)) {
    parentId = new mongoose.Types.ObjectId(parentIdRaw);
  }

  let imageUrl = "";
  if (image && image.size > 0) {
    imageUrl = await uploadToCloudinary(image);
  }

  const category = await Category.create({
    categoryName: categoryName.trim(),
    parentId, // ✅ ObjectId or null ONLY
    categoryImage: imageUrl,
  });

  revalidatePath("/admin/category");

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
  if (!category) return { success: false, message: "Category not found" };

  const name = fd.get("categoryName") as string;
  const parentId = fd.get("parentId") as string;
  const image = fd.get("categoryImage") as File | null;

  if (name) category.categoryName = name;
  category.parentId = parentId || null;

  if (image && image.size > 0) {
    if (category.categoryImage) {
      await deleteFromCloudinary(category.categoryImage);
    }
    category.categoryImage = await uploadToCloudinary(image);
  }

  await category.save();
  revalidatePath("/admin/category");

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
  revalidatePath("/admin/category");

  return { success: true, message: "Category deleted successfully" };
}
