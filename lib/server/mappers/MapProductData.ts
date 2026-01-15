
import { IProduct } from "@/models/productModel";
import { productType } from "@/types/product";

// types/server/product-populated.ts
import { Types } from "mongoose";

import { ICategory } from "@/models/categoryModel";

export interface IProductPopulated
  extends Omit<IProduct, "category"> {
  category?: Types.ObjectId | ICategory;
}

export function isPopulatedCategory(
  value: Types.ObjectId | ICategory | undefined | null
): value is ICategory {
  return (
    typeof value === "object" &&
    value !== null &&
    "categoryName" in value
  );
}

export function mapProductToFrontend(product: IProduct): productType {
  const category = isPopulatedCategory(product.category)
    ? product.category
    : null;

  return {
    id: product._id.toString(),
    name: product.name,
    slug: product.slug,
    description: product.description || "",
    images: product.images || [],
    price: product.price,
    stock: product.stock,
    isActive: product.isActive,
    offeredPrice: product.offeredPrice || product.price,
    isOfferedPriceActive: product.isOfferedPriceActive || false,
    discountPercent: product.discountPercent || 0,
    totalSales: product.totalSales || 0,

    // Mongoose does not have these → return null or default
    offerStartDate: product.offerStartDate || null,
    offerEndDate: product.offerEndDate || null,

    userId: "",             
  categoryId: product.category?._id?.toString() || "",
  
  
    seoMetaId: "",
  
     brandName: product.brandName,

    // Large structures not in Mongoose model
    media: [],
    tags: product.tags?.map(t => ({
      id: t.id ||   "",
      name: t.name
    })) || [],
    seoMeta: {
      id: "",
      model: "",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      metaRobots: null,
      createdAt: "",
      updatedAt: ""
    },
   

    reviews: product.reviews?.map(r => ({
      id: r._id.toString(),
      user: {
        id: r.user?.toString() ?? "",
        name: "",
        email: ""
      },
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString()
    })) || [],

   
     category: {
      id: category?._id.toString() ?? "",
      categoryName: category?.categoryName ?? "",
      slug: category?.slug ?? "",
      categoryImage: category?.categoryImage ?? "",
      productCount: 0,
      isActive: category?.isActive ?? true,
      createdAt: category?.createdAt?.toISOString() ?? ""
    },

    avgRating: product.avgRating,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString()
  };
}
