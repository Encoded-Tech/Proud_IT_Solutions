// mappers/MapCategory.ts

import { CategoryType } from "@/types/product";
export interface ICategoryWithCountPlain {
  _id: string;
  categoryName: string;
  categoryImage?: string;
  slug: string;
  parentId?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  productCount: number;
}


export function mapCategoryToFrontend(category: ICategoryWithCountPlain): CategoryType {
  return {
    id: category._id.toString(), // ObjectId -> string
    categoryName: category.categoryName,
    slug: category.slug,
    categoryImage: category.categoryImage || "",
    parentId: category.parentId?.toString() || undefined,
    productCount: category.productCount || 0,
    isActive: category.isActive,
    createdAt: category.createdAt.toISOString(),
  };
}
