import { Schema, Document, model, models, Types, deleteModel } from "mongoose";
import type { ProductHighlight } from "@/types/product";

const PRODUCT_SLUG_BASE_LIMIT = 70;

function buildShortProductSlug(name: string, id: Types.ObjectId) {
  const slugName =
    name
      .split("|")
      .map((part) => part.trim())
      .find(Boolean) || name.trim();

  const base = slugName
    .toLowerCase()
    .trim()
    .replace(/%/g, "percent")
    .replace(/&/g, "and")
    .replace(/@/g, "at")
    .replace(/~/g, "-to-")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, PRODUCT_SLUG_BASE_LIMIT)
    .replace(/-+$/g, "");

  return base || `product-${id.toString().slice(-6)}`;
}

export interface IProduct extends Document {
  _id: Types.ObjectId;
    name: string;
    slug: string;
    description?: string;
    highlights?: ProductHighlight[] | null;
    price: number;
    stock: number;
    reservedStock:  number;
    category: Types.ObjectId; 
    images: string[];
    variants?: Types.ObjectId[]; 
    reviews: IReview[];
    avgRating: number;
    totalReviews: number;
    totalSales: number;
    offeredPrice?: number;
    tags?: { id: string; name: string }[];
    brandName: string;
    isOfferedPriceActive?: boolean;
    discountPercent?: number;
    offerStartDate?: Date | null;
    offerEndDate?: Date | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface IReview extends Document {
    _id: Types.ObjectId;
    user: Types.ObjectId;   
    rating: number;           
    comment: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  const reviewSchema = new Schema<IReview>(
    {
      user: { type: Schema.Types.ObjectId, ref: "User", required: false },
      rating: { type: Number, required: true, min: 1, max: 5 },
      comment: { type: String, required: true, trim: true },
    },
    { timestamps: true }
  );
  
  const productSchema = new Schema<IProduct>(
    {
      name: { type: String, required: true, trim: true, unique: true  },
      slug: { type: String, lowercase: true, trim: true, unique: true },
      description: { type: String },
      highlights: {
        type: [
          {
            label: { type: String, trim: true },
            specs: { type: String, trim: true },
          },
        ],
        default: [],
      },
      price: { type: Number, required: true },
      stock: { type: Number, required: true, default: 0 },
      reservedStock: { type: Number, default: 0 },
      category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
      images: [{ type: String }],
      variants: [{ type: Schema.Types.ObjectId, ref: "ProductVariant" }],
      reviews: [reviewSchema],
      avgRating: { type: Number, default: 0 },   
      totalSales: { type: Number, default: 0 },  
      offeredPrice: { type: Number, default: 0 },            
isOfferedPriceActive: { type: Boolean, default: false },
offerEndDate: { type: Date, default: null },
offerStartDate: { type: Date, default: null },
tags: [
    {
      id: { type: String },
      name: { type: String, required: true }
    }
  ], 
   brandName: { type: String, required: true },
discountPercent: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 },  
      isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
  );
  
  // productSchema.pre("save", function (next) {
  //   if (this.isModified("name")) {
  //     this.slug = this.name.toLowerCase().replace(/\s+/g, "-");
  //   }

  productSchema.pre("save", async function (next) {
  if (this.isModified("name")) {
    // Generate URL-safe slug from name
    this.slug = this.name
      .toLowerCase()
      .trim()
      // Replace degree symbols and special temp/humidity characters
      .replace(/[°℃℉]/g, '')
      // Replace percentage signs
      .replace(/%/g, 'percent')
      // Replace ampersands
      .replace(/&/g, 'and')
      // Replace @ symbol
      .replace(/@/g, 'at')
      // Replace tilde ranges (e.g., 10%~85% becomes 10percent-85percent)
      .replace(/~/g, '-to-')
      // Remove all other special characters and punctuation
      .replace(/[^a-z0-9\s-]/g, '')
      // Replace multiple spaces with single hyphen
      .replace(/\s+/g, '-')
      // Replace multiple hyphens with single hyphen
      .replace(/-+/g, '-')
      // Remove leading/trailing hyphens
      .replace(/^-+|-+$/g, '');

    // Ensure slug is not empty (fallback to ID-based slug)
    if (!this.slug || this.slug.length === 0) {
      this.slug = 'product-' + this._id.toString();
    }
    
    // Limit slug length to prevent database issues (optional but recommended)
    if (this.slug.length > 100) {
      this.slug = this.slug.substring(0, 100).replace(/-+$/, '');
    }

    const slug = buildShortProductSlug(this.name, this._id);
    const existingProduct = await (this.constructor as typeof Product).exists({
      _id: { $ne: this._id },
      slug,
    });

    this.slug = existingProduct ? `${slug}-${this._id.toString().slice(-6)}` : slug;
  }
    next();
  });

  productSchema.index({ isActive: 1, createdAt: -1 });
  productSchema.index({ category: 1, isActive: 1, createdAt: -1 });
  productSchema.index({ brandName: 1, isActive: 1 });
  productSchema.index({ totalSales: -1, isActive: 1 });
  productSchema.index({ discountPercent: -1, isActive: 1 });
  
  if (models.Product && !models.Product.schema.path("highlights")) {
    deleteModel("Product");
  }

  export const Product =
    models.Product || model<IProduct>("Product", productSchema);
  
