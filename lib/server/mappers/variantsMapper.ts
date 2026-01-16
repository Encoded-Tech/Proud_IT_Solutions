import { IProductVariant } from "@/models/productVariantsModel";
import { ProductVariantType } from "@/types/product";


export function mapProductVariantToFrontend(
  variant: IProductVariant
): ProductVariantType {
  return {
    id: variant._id.toString(),
    productId: variant.product.toString(),

    specs: {
      cpu: variant.specs.cpu,
      ram: variant.specs.ram,
      storage: variant.specs.storage,
      color: variant.specs.color,
    },

    price: variant.price,
    stock: variant.stock,
    sku: variant.sku,

    images: variant.images ?? [],
    isActive: variant.isActive,

    createdAt: variant.createdAt.toISOString(),
    updatedAt: variant.updatedAt.toISOString(),
  };
}


export function mapProductVariantsToFrontend(
  variants: IProductVariant[]
): ProductVariantType[] {
  return variants.map(mapProductVariantToFrontend);
}