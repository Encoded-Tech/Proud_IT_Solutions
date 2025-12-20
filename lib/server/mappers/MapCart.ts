// lib/mappers/cartMapper.ts


import { IProduct } from "@/models/productModel";
import { IProductVariant } from "@/models/productVariantsModel";

export type ProductDocument = IProduct;
export type ProductVariantDocument = IProductVariant;

// Frontend-ready DTO
export interface CartItemDTO {
  _id: string;
  quantity: number;
  addedAt: Date;
  updatedAt: Date;
  selectedOptions?: Record<string, string> | null;
  product: {
    _id: string;
    name: string;
    price: number;
    stock: number;
    slug: string;
    images: string[];
  };
  variant?: {
    _id: string;
    price: number;
    stock: number;
    specs?: Record<string, string>;
    images?: string[];
  } | null;
}

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
export function mapSingleCartItemToDTO(item: ICartItemPopulated): CartItemDTO {
  const { product, variant } = item;

  return {
    _id: item._id.toString(),
    quantity: item.quantity,
    addedAt: item.addedAt,
    updatedAt: item.updatedAt,
  selectedOptions: item.selectedOptions || null,
   
    product: {
      _id: product._id.toString(),
      name: product.name,
      price: product.price,
      stock: product.stock,
      slug: product.slug,
      images: product.images || [],
    },
    variant: variant
      ? {
          _id: variant._id.toString(),
          price: variant.price,
          stock: variant.stock,
          specs: variant.specs || {},
          images: variant.images || [],
        }
      : null,
  };
}

// Array mapper
export function mapCartItemsArrayToDTO(items: ICartItemPopulated[]): CartItemDTO[] {
  return items.map(mapSingleCartItemToDTO);
}

