// lib/mappers/cartMapper.ts


import { IProduct } from "@/models/productModel";
import { IProductVariant } from "@/models/productVariantsModel";
import { CartItem } from "@/types/product";

export type ProductDocument = IProduct;
export type ProductVariantDocument = IProductVariant;


// Populated cart item type
export interface ICartItemPopulated {
  _id: string; // cart item id
  quantity: number;
  addedAt: Date;
  updatedAt: Date;
  selectedOptions?: Record<string, string> | null;
  product: IProduct;               // populated product
  variant?: IProductVariant | null; // populated variant
}


// Single item mapper
export function mapSingleCartItemToDTO(item: ICartItemPopulated): CartItem {
  const { product, variant } = item;

  const remainingStock = variant?.stock ?? product.stock;

  return {
    _id: item._id.toString(),
    product: {
      _id: product._id.toString(),
      name: product.name,
      price: product.price,
      stock: product.stock,
      images: Array.isArray(product.images) ? product.images : [],
      slug: product.slug,
    },
    variant: variant
      ? {
          id: variant._id.toString(),
          price: variant.price,
          stock: variant.stock,
          specs: variant.specs, // string
          isActive: variant.isActive ?? true,
          images: Array.isArray(variant.images) ? variant.images : [], // string[]
        }
      : null,
    quantity: item.quantity,
    addedAt: item.addedAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    remainingStock,
    selectedOptions: item.selectedOptions || {},
  };
}

export function mapCartItemsArrayToDTO(items: ICartItemPopulated[]): CartItem[] {
  return items.map(mapSingleCartItemToDTO);
}


// Array mapper

