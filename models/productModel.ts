import { Schema, Document, model, models, Types } from "mongoose";

export interface IProduct extends Document {
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
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface IReview extends Document {
    user: Types.ObjectId;   
    rating: number;           
    comment: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  const reviewSchema = new Schema<IReview>(
    {
      user: { type: Schema.Types.ObjectId, ref: "User", required: true },
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
      totalReviews: { type: Number, default: 0 },  
      isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
  );
  
  productSchema.pre("save", function (next) {
    if (this.isModified("name")) {
      this.slug = this.name.toLowerCase().replace(/\s+/g, "-");
    }
    next();
  });
  
  export const Product =
    models.Product || model<IProduct>("Product", productSchema);
  