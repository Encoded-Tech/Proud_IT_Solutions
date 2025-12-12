export interface productType {
  id: string;
  name: string;
  slug: string;
  description: string;
  images?: string[] | null;
  price: number;
  stock: number;
  offeredPrice: number;
  discountPercent: number;
  isOfferedPriceActive: boolean;
  offerStartDate: Date | null;
  offerEndDate: Date | null;
  isActive: boolean;
  userId: string;
  categoryId: string;
  createdAt: string; 
  updatedAt: string;
  isFeatured: boolean;
  seoMetaId: string;
  brandId: string;
  media: MediaType[];
  tags: TagType[];
  seoMeta: SeoMetaType;
  brand: BrandType;
  reviews: ReviewType[];
  category: CategoryType;
  user: UserType;
  avgRating: number;
}

export interface MediaType {
  id: string;
  productId: string;
  mediaType: "IMAGE" | "VIDEO"; 
  mediaUrl: string;
}

export interface TagType {
  id: string;
  name: string;
}

export interface SeoMetaType {
  id: string;
  model: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  metaRobots: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BrandType {
  id: string;
  name: string;
  image: string;
}

export interface ReviewType {
  id: string;
  user: UserType;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}


export interface AttributeDefinitionType {
  id: string;
  name: string;
  type: "STRING" | "INT" | "DECIMAL" | "BOOL" | "DATE"; // inferred
  unit: string;
  categoryId: string;
}

export interface StockAndPriceType {
  id: string;
  productAttributeValueId: string;
  stock: number;
  price: string;
  offeredPrice: number | null;
  isOfferedPriceActive: boolean;
  offerStartDate: Date | null;
  offerEndDate: Date | null;
}

export interface CategoryType {
  id: string;
  categoryName: string;
  slug: string;
  categoryImage: string;
  parentId?: string;
  productCount: number;
  isActive: boolean;
  createdAt: string;
}


export interface UserType {
  id: string;
  name: string;
  email: string;
}
