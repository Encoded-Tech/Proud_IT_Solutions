import { Schema, Document, model, models, Types } from "mongoose";

export interface IProduct extends Document {
  _id: Types.ObjectId;
    name: string;
    slug: string;
    description?: string;
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

  productSchema.pre("save", function (next) {
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
  }
    next();
  });
  
  export const Product =
    models.Product || model<IProduct>("Product", productSchema);
  
