
import { deleteFromCloudinary, uploadToCloudinary } from "@/config/cloudinary";
import { withDB } from "@/lib/HOF";
import { withAuth } from "@/lib/HOF/withAuth";
import { Category } from "@/models";
import { ICategory } from "@/models/categoryModel";
import { ApiResponse } from "@/types/api";
import { NextResponse } from "next/server";

export const GET = withDB(async (req, context) => {
  const params = await context?.params;
  const id = params?.id;
  if (!id) {
    return NextResponse.json({
      success: false,
      message: "product id missing",
      status: 404
    })
  }
  const singleCategory = await Category.findById(id).populate("parentId", "categoryName");
  const hasCategory = !!singleCategory;
  const response: ApiResponse<ICategory[]> = {
    success: hasCategory,
    message: hasCategory ? "Single category Fetched Successfully" : "category not found",
    data: singleCategory,
    status: hasCategory ? 200 : 400
  }
  return NextResponse.json(response, { status: response.status })
}, { resourceName: "category" });

export const DELETE = withAuth(
  withDB(async (req, context) => {
    const params = await context?.params;
    const id = params?.id;
    const categoryToDelete = await Category.findById(id);
    if (!categoryToDelete) {
      return NextResponse.json({ error: "category not found" }, { status: 404 });
    }
    if (categoryToDelete.categoryImage) {
      await deleteFromCloudinary(categoryToDelete.categoryImage);
    }
    await categoryToDelete.deleteOne();
    return NextResponse.json({
      success: true,
      message: "category deleted successfully",
      data: categoryToDelete,
    });
  }, { resourceName: "category" }), { roles: ["admin"] }
);

export const PUT = withAuth(
  withDB(async (req, context) => {
    const params = await context?.params;
    const id = params?.id;

    const categoryToUpdate = await Category.findById(id);
    if (!categoryToUpdate) {
      return NextResponse.json({
        success: false,
        message:   "category not found"
      }, { status: 404 });
    }
    const formData = await req.formData();
    const categoryName = formData.get("categoryName") as string;
    const categoryImage = formData.get("categoryImage") as File;
    const parentId = formData.get("parentId") as string | null;

    if (categoryName) {
      categoryToUpdate.categoryName = categoryName;

    }
    if (categoryImage && categoryImage.size > 0) {
      if (categoryToUpdate.categoryImage) {
        await deleteFromCloudinary(categoryToUpdate.categoryImage);

      }

      const imageUrl = await uploadToCloudinary(categoryImage);
      categoryToUpdate.categoryImage = imageUrl;
    }
    if (parentId !== null) {
      categoryToUpdate.parentId = parentId.trim() === "" ? null : parentId;
    }
    await categoryToUpdate.save();
    return NextResponse.json({
      success: true,
      message: "category updated successfully",
      data: categoryToUpdate,
    });
  }, { resourceName: "category" }),
  { roles: ["admin"] }
);

