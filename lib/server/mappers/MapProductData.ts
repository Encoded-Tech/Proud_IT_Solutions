
import { IProduct } from "@/models/productModel";
import { productType, VariantType } from "@/types/product";

// types/server/product-populated.ts
import { Types } from "mongoose";

import { ICategory } from "@/models/categoryModel";
import { IProductVariant } from "@/models/productVariantsModel";



export function isPopulatedCategory(
  value: Types.ObjectId | ICategory | undefined | null
): value is ICategory {
  return (
    typeof value === "object" &&
    value !== null &&
    "categoryName" in value
  );
}
export interface IProductPopulated extends Omit<IProduct, "variants" | "category"> {
  variants?: (Types.ObjectId | IProductVariant)[];
  category?: Types.ObjectId | ICategory;
}

export function isPopulatedVariant(
  value: Types.ObjectId | IProductVariant | undefined | null
): value is IProductVariant {
  return typeof value === "object" && value !== null && "price" in value;
}


export function mapProductToFrontend(
  product: IProductPopulated
): productType {
  const category = isPopulatedCategory(product.category) ? product.category : null;

  const variants: VariantType[] =
    product.variants?.filter(isPopulatedVariant).map((v) => ({
      id: v._id.toString(),
      price: v.price,
      stock: v.stock,
      specs: v.specs || [],
      images: v.images || [],
      isActive: v.isActive,
    })) || [];

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
    offerStartDate: product.offerStartDate || null,
    offerEndDate: product.offerEndDate || null,
    userId: "",
    categoryId: product.category?._id?.toString() || "",
    seoMetaId: "",
    brandName: product.brandName,
    media: [],
    tags: product.tags?.map((t) => ({ id: t.id || "", name: t.name })) || [],
    seoMeta: {
      id: "",
      model: "",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      metaRobots: null,
      createdAt: "",
      updatedAt: "",
    },
    reviews:
      product.reviews?.map((r) => ({
        id: r._id.toString(),
        user: {
          id: r.user?.toString() ?? "",
          name: "",
          email: "",
        },
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })) || [],
    category: {
      id: category?._id.toString() ?? "",
      categoryName: category?.categoryName ?? "",
      slug: category?.slug ?? "",
      categoryImage: category?.categoryImage ?? "",
      productCount: 0,
      isActive: category?.isActive ?? true,
      createdAt: category?.createdAt?.toISOString() ?? "",
    },
    variants,
    avgRating: product.avgRating,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

