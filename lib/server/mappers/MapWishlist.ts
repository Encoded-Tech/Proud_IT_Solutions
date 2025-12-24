// lib/mappers/wishlistMapper.ts
import { IWishlistItem } from "@/models/userModel";
import { Product, ProductVariant } from "@/models";
import mongoose from "mongoose";
import { IProduct } from "@/models/productModel";
import { IProductVariant } from "@/models/productVariantsModel";

// Frontend DTO for wishlist item
export interface WishlistItemDTO {
  _id: string;
  product: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    images: string[];
  };
  variant?: {
    _id: string;
    specs: {
      cpu: string;
      ram: string;
      storage: string;
      color?: string;
    };
    price: number;
    sku: string;
    images: string[];
  } | null;
  addedAt: string;
}


// Single item mapper
export async function mapWishlistItem(item: IWishlistItem): Promise<WishlistItemDTO> {
  let productDoc: IProduct | null;
  let variantDoc: IProductVariant | null = null;

  // Resolve product
  if (mongoose.isValidObjectId(item.product) && typeof item.product === "string") {
    productDoc = await Product.findById(item.product).lean<IProduct>();
  } else {
    productDoc = item.product as unknown as IProduct;
  }

  if (!productDoc) throw new Error("Product not found");

  // Resolve variant
  if (item.variant) {
    if (mongoose.isValidObjectId(item.variant) && typeof item.variant === "string") {
      variantDoc = await ProductVariant.findById(item.variant).lean<IProductVariant>();
    } else {
      variantDoc = item.variant as unknown as IProductVariant;
    }
  }

  return {
    _id: item._id.toString(),
    product: {
      _id: productDoc._id.toString(),
      name: productDoc.name,
      slug: productDoc.slug,
      price: productDoc.price,
      images: productDoc.images ?? [],
    },
    variant: variantDoc
      ? {
          _id: variantDoc._id.toString(),
          specs: variantDoc.specs ?? "",
          price: variantDoc.price,
          sku: variantDoc.sku,
          images: variantDoc.images ?? [],
        }
      : null,
    addedAt: item.addedAt.toISOString(),
  };
}

// Mapper for multiple items
export async function mapWishlistArray(items: IWishlistItem[]): Promise<WishlistItemDTO[]> {
  return Promise.all(items.map(mapWishlistItem));
}
