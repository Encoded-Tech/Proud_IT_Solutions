import { IProduct } from "@/models/productModel";
import { productType } from "@/types/product";

export function mapProductToFrontend(product: IProduct): productType {
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

    // Mongoose does not have these → return null or default
    offerStartDate: null,
    offerEndDate: null,
    userId: "",             
    categoryId: product.category?.toString() || "",
    isFeatured: false,
    seoMetaId: "",
    brandId: "",

    // Large structures not in Mongoose model
    media: [],
    tags: [],
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
    brand: {
      id: "",
      name: "",
      image: ""
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
      id: product.category?.toString() ?? "",
      categoryName: "",
      slug: "",
      categoryImage: "",
      productCount: 0,
      isActive: true,
      createdAt: ""
    },

    user: {
      id: "",
      name: "",
      email: ""
    },

    avgRating: product.avgRating,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString()
  };
}
