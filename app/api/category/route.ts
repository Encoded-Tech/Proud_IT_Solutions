import { uploadToCloudinary } from "@/config/cloudinary";

import { checkRequiredFields } from "@/lib/helpers/validateRequiredFields";
import { withDB } from "@/lib/HOF";
import { withAuth } from "@/lib/HOF/withAuth";
import { Category, Product } from "@/models";
import { ICategory } from "@/models/categoryModel";
import { ApiResponse } from "@/types/api";
import { NextRequest, NextResponse } from "next/server";

//total apis
//category-get-all api/category
//category-create api/category

// category-get-all api/category
export const GET = withDB(async () => {
  // 1) Fetch categories
  const categories = await Category.find()
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

  // 3) Merge categories + counts
  const categoriesWithCount = categories.map((cat) => ({
    ...cat,
    productCount: countMap.get(cat._id.toString()) || 0,
  }));


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

    let imageUrl: string | null = null;
    if (categoryImage && categoryImage.size > 0) {
      imageUrl = await uploadToCloudinary(categoryImage);
    }
    const createCategory = await Category.create({ categoryName, categoryImage: imageUrl, parentId: normalizedParentId });
    return NextResponse.json({
      success: true,
      message: "Category created successfully",
      data: createCategory,
    });
  }, { resourceName: "category" }),
  { roles: ["admin"] }
)



