import { Category, Product } from "@/models";
import { ICategoryWithCountPlain, mapCategoryToFrontend } from "../mappers/MapCategory";
import { CategoryType } from "@/types/product";
import {ICategory } from "@/models/categoryModel";



export interface ApiCategoryResponse {
  success: boolean;
  message: string;
  data: CategoryType[] | null;
  error?: string | null;
}

export async function fetchCategories(): Promise<ApiCategoryResponse> {
  try {
    // 1) Fetch categories from DB
     const categories: ICategory[] = await Category.find().lean<ICategory[]>();

    // 2) Fetch product counts grouped by category
    const counts = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const countMap = new Map<string, number>();
    counts.forEach((c) => countMap.set(c._id.toString(), c.count));

    // 3) Merge counts into categories
    const categoriesWithCount: ICategoryWithCountPlain[] = categories.map((cat) => ({
      _id: cat._id.toString(),
      categoryName: cat.categoryName,
      categoryImage: cat.categoryImage || "",
      slug: cat.slug,
      parentId: cat.parentId?.toString() || null,
      isActive: cat.isActive,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
      productCount: countMap.get(cat._id.toString()) || 0,
    }));

    // 4) Map to frontend type
    const frontendCategories = categoriesWithCount.map(mapCategoryToFrontend);

    return {
      success: true,
      message: "Categories fetched successfully",
      data: frontendCategories,
      error: null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unexpected server error";
    console.error("Fetch Categories Error:", errorMessage);

    return {
      success: false,
      message: "Failed to fetch categories",
      data: null,
      error: errorMessage,
    };
  }
}