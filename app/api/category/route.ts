import { uploadToCloudinary } from "@/config/cloudinary";
import { checkRequiredFields } from "@/lib/helpers/validateRequiredFields";
import { withDB } from "@/lib/HOF";
import { Category } from "@/models";
import { ICategory } from "@/models/categoryModel";
import { ApiResponse } from "@/types/api";
import { NextRequest, NextResponse } from "next/server";


export const POST = withDB(async (req: NextRequest) => {
  const formData = await req.formData();
  const categoryName = formData.get("categoryName") as string;
  const categoryImage = formData.get("categoryImage") as File;
  const parentId = formData.get("parentId") as string | null;

  const requiredFields = { categoryName, categoryImage }
  const missingFields = checkRequiredFields(requiredFields);
  if (missingFields) return missingFields;

  const normalizedParentId =
    parentId && parentId !== "null" && parentId !== "" ? parentId : null;
  const existingCategory = await Category.findOne({ categoryName });
  if (existingCategory) {
    return NextResponse.json(
      { success: false, message: `Category with name '${categoryName}' already exists` },
      { status: 409 }
    );
  }

  const imageUrl = await uploadToCloudinary(categoryImage);
  const createCategory = await Category.create({ categoryName, categoryImage: imageUrl, parentId: normalizedParentId });
  return NextResponse.json({
    success: true,
    message: "category created successfully",
    data: createCategory,
  });
}, { resourceName: "category" })


export const GET = withDB(async () => {
  const categories = await Category.find()
    .populate("parentId", "categoryName")
    .sort({ createdAt: -1 });

  const hasCategory = categories.length > 0
  const response: ApiResponse<ICategory[]> = {
    success: hasCategory,
    message: hasCategory ? "categories fetched successfully" : "no categories found",
    data: categories,
    status: hasCategory ? 200 : 404
  }
  return NextResponse.json(response, { status: response.status })
}, { resourceName: "category" })