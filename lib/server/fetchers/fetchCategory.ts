"use server";
import { Category, Product } from "@/models";
import { ICategoryWithCountPlain, mapCategoryToFrontend } from "../mappers/MapCategory";
import { CategoryType } from "@/types/product";
import {ICategory } from "@/models/categoryModel";
import { connectDB } from "@/db";
import { cacheLife, cacheTag } from "next/cache";
import { Types } from "mongoose";



function sortCategoriesByName(categories: CategoryType[]): CategoryType[] {
  return [...categories].sort((a, b) =>
    a.categoryName.localeCompare(b.categoryName, undefined, { sensitivity: "base" })
  );
}

type CategoryPlain = {
  _id: Types.ObjectId;
  categoryName: string;
  categoryImage?: string;
  slug: string;
  parentId?: Types.ObjectId | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function buildCategoryCountAndPathData(
  categories: CategoryPlain[],
  directCountMap: Map<string, number>
) {
  const childrenByParent = new Map<string, CategoryPlain[]>();
  const categoryById = new Map<string, CategoryPlain>();

  for (const category of categories) {
    const id = category._id.toString();
    const parentKey = category.parentId?.toString() || "root";
    const children = childrenByParent.get(parentKey) || [];

    children.push(category);
    childrenByParent.set(parentKey, children);
    categoryById.set(id, category);
  }

  const descendantCountMap = new Map<string, number>();
  const pathMap = new Map<string, string>();

  const getDescendantCount = (category: CategoryPlain): number => {
    const id = category._id.toString();
    if (descendantCountMap.has(id)) return descendantCountMap.get(id) || 0;

    const childCount = (childrenByParent.get(id) || []).reduce(
      (total, child) => total + getDescendantCount(child),
      0
    );
    const total = (directCountMap.get(id) || 0) + childCount;

    descendantCountMap.set(id, total);
    return total;
  };

  const getPath = (category: CategoryPlain): string => {
    const id = category._id.toString();
    const existing = pathMap.get(id);
    if (existing) return existing;

    const parent = category.parentId
      ? categoryById.get(category.parentId.toString())
      : null;
    const path = parent ? `${getPath(parent)}/${category.slug}` : category.slug;

    pathMap.set(id, path);
    return path;
  };

  for (const category of categories) {
    getDescendantCount(category);
    getPath(category);
  }

  return { descendantCountMap, pathMap };
}

export interface ApiCategoryResponse {
  success: boolean;
  message: string;
  data: CategoryType[] | null;
  error?: string | null;
}

export interface ApiSingleCategoryResponse {
  success: boolean;
  message: string;
  data: CategoryType | null;
  error?: string | null;
}

async function queryPublicCategories(): Promise<ApiCategoryResponse> {
  await connectDB();

  const categories = await Category.find({ isActive: true })
    .select("categoryName categoryImage slug parentId isActive createdAt updatedAt")
    .lean<CategoryPlain[]>()
    .sort({ createdAt: -1 });

  const counts = await Product.aggregate([
    {
      $match: {
        isActive: true,
      },
    },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);

  const countMap = new Map<string, number>();
  counts.forEach((c) => countMap.set(c._id.toString(), c.count));
  const { descendantCountMap, pathMap } = buildCategoryCountAndPathData(categories, countMap);

  const categoriesWithCount: ICategoryWithCountPlain[] = categories
    .map((cat) => ({
      _id: cat._id.toString(),
      categoryName: cat.categoryName,
      categoryImage: cat.categoryImage || "",
      slug: cat.slug,
      path: pathMap.get(cat._id.toString()) || cat.slug,
      parentId: cat.parentId?.toString() || null,
      isActive: cat.isActive,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
      directProductCount: countMap.get(cat._id.toString()) || 0,
      productCount: descendantCountMap.get(cat._id.toString()) || 0,
    }))
    .filter((cat) => cat.productCount > 0);

  return {
    success: true,
    message: "Categories fetched successfully",
    data: sortCategoriesByName(categoriesWithCount.map(mapCategoryToFrontend)),
    error: null,
  };
}

export async function fetchPublicCategories(): Promise<ApiCategoryResponse> {
  "use cache";

  cacheLife("hours");
  cacheTag("categories");
  cacheTag("homepage");

  try {
    return await queryPublicCategories();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unexpected server error";
    console.error("Fetch Public Categories Error:", errorMessage);

    return {
      success: false,
      message: "Failed to fetch categories",
      data: null,
      error: errorMessage,
    };
  }
}

export async function fetchCategories(): Promise<ApiCategoryResponse> {

  try {
    await connectDB();
    const categories = await Category.find()
      .lean<CategoryPlain[]>()
      .sort({ createdAt: -1 });
    const counts = await Product.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]);
    const countMap = new Map<string, number>();
    counts.forEach((c) => countMap.set(c._id.toString(), c.count));
    const { descendantCountMap, pathMap } = buildCategoryCountAndPathData(categories, countMap);
    const categoriesWithCount: ICategoryWithCountPlain[] = categories.map((cat) => ({
      _id: cat._id.toString(),
      categoryName: cat.categoryName,
      categoryImage: cat.categoryImage || "",
      slug: cat.slug,
      path: pathMap.get(cat._id.toString()) || cat.slug,
      parentId: cat.parentId?.toString() || null,
      isActive: cat.isActive,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
      directProductCount: countMap.get(cat._id.toString()) || 0,
      productCount: descendantCountMap.get(cat._id.toString()) || 0,
    }));

    const frontendCategories = sortCategoriesByName(categoriesWithCount.map(mapCategoryToFrontend));

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
export async function fetchCategoryById(
  id: string
): Promise<ApiSingleCategoryResponse> {
  try {
    await connectDB();
    // 1) Fetch single category
    const category: ICategory | null = await Category.findById(id).lean<ICategory>();

    if (!category) {
      return {
        success: false,
        message: "Category not found",
        data: null,
        error: null,
      };
    }

    // 2) Count products in this category
    const productCount = await Product.countDocuments({
      category: category._id,
    });

    // 3) Build plain object with count
    const categoryWithCount = {
      _id: category._id.toString(),
      categoryName: category.categoryName,
      categoryImage: category.categoryImage || "",
      slug: category.slug,
      parentId: category.parentId?.toString() || null,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      productCount,
    };

    // 4) Map to frontend type
    const frontendCategory = mapCategoryToFrontend(categoryWithCount);

    return {
      success: true,
      message: "Category fetched successfully",
      data: frontendCategory,
      error: null,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unexpected server error";

    console.error("Fetch Category Error:", errorMessage);

    return {
      success: false,
      message: "Failed to fetch category",
      data: null,
      error: errorMessage,
    };
  }
}
