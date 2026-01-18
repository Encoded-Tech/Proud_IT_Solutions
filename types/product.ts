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
  offerStartDate?: Date | null;
  offerEndDate?: Date | null;
  isActive: boolean;
  userId?: string;
  categoryId: string;
  createdAt: string; 
  updatedAt: string;
  totalSales?: number;

  seoMetaId?: string;

  media: MediaType[];
  tags: TagType[];
  seoMeta?: SeoMetaType;
brandName: string;
  reviews: ReviewType[];
  category: CategoryType;

  avgRating: number;
  variants?: VariantType[] | null;
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


export interface ReviewType {
  id: string;
  user: UserType;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string;
}

export interface VariantType {
  _id?: string;
  id: string;
  price: number;
  stock: number;
  
  specs: {
    cpu: string;
    ram: string;
    storage: string;
    color?: string;
  };
  images: string[];
  isActive: boolean;
}




export interface ReviewState {
  reviews: ReviewType[];
  totalReviews: number;
  avgRating: number;
  currentUserId?: string;
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
  image?: string | null;
}


export interface CartProduct {
  _id: string;
  name: string;
  price: number;
  stock: number;
  images: string[];
  slug: string;
}

export interface CartVariant {
  _id: string;
  specs: string;
  price: number;
  stock: number;
  images: string[];
  sku: string;
}


export interface CartItem {
  _id: string;
  product: CartProduct;
  variant: VariantType | null;
  quantity: number;
  addedAt: string;
  updatedAt: string;
  remainingStock: number;
  selectedOptions?: Record<string, string>;
}



// Frontend-safe Product Variant types

export interface ProductVariantSpecs {
  cpu: string;
  ram: string;
  storage: string;
  color?: string;
}

export interface ProductVariantType {
  id: string;
  productId: string;
  productName: string;
  specs: ProductVariantSpecs;

  price: number;
  discountPercent: number;
  offeredPrice: number;
  isOfferActive: boolean;
  offerStartDate: string | null;
  offerEndDate: string | null;

  stock: number;
  reservedStock: number;
  sku: string;

  images: string[];
  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}



