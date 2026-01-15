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
  
  productSchema.pre("save", function (next) {
    if (this.isModified("name")) {
      this.slug = this.name.toLowerCase().replace(/\s+/g, "-");
    }
    next();
  });
  
  export const Product =
    models.Product || model<IProduct>("Product", productSchema);
  

// import { Schema, Document, model, models, Types } from "mongoose";

// /* -------------------------------------------------------------------------- */
// /*                                   REVIEW                                   */
// /* -------------------------------------------------------------------------- */

// export interface IReview extends Document {
//   _id: Types.ObjectId;
//   user: Types.ObjectId;
//   rating: number;
//   comment: string;
//   createdAt: Date;
//   updatedAt: Date;
// }

// const reviewSchema = new Schema<IReview>(
//   {
//     user: { type: Schema.Types.ObjectId, ref: "User", required: false },
//     rating: { type: Number, required: true, min: 1, max: 5 },
//     comment: { type: String, required: true, trim: true },
//   },
//   { timestamps: true }
// );

// /* -------------------------------------------------------------------------- */
// /*                                   BRAND                                    */
// /* -------------------------------------------------------------------------- */

// export interface IBrand extends Document {
//   _id: Types.ObjectId;
//   name: string;
//   image: string;
//   isActive: boolean;
//   createdAt: Date;
//   updatedAt: Date;
// }

// const brandSchema = new Schema<IBrand>(
//   {
//     name: { type: String, required: true, trim: true, unique: true },
//     image: { type: String, default: "" },
//     isActive: { type: Boolean, default: true },
//   },
//   { timestamps: true }
// );

// export const Brand = models.Brand || model<IBrand>("Brand", brandSchema);

// /* -------------------------------------------------------------------------- */
// /*                                   PRODUCT                                  */
// /* -------------------------------------------------------------------------- */

// export interface IProduct extends Document {
//   _id: Types.ObjectId;

//   name: string;
//   slug: string;
//   description?: string;

//   price: number;
//   stock: number;
//   reservedStock: number;

//   category: Types.ObjectId;
//   brand: Types.ObjectId; // now references Brand

//   images: string[];
//   media?: Types.ObjectId[];

//   variants?: Types.ObjectId[];

//   reviews: IReview[];
//   avgRating: number;
//   totalReviews: number;
//   totalSales: number;

//   offeredPrice?: number;
//   isOfferedPriceActive?: boolean;
//   offerStartDate?: Date | null;
//   offerEndDate?: Date | null;
//   discountPercent?: number;

//   tags?: { id: string; name: string }[];

//   isFeatured: boolean;
//   isActive: boolean;

//   createdAt: Date;
//   updatedAt: Date;
// }

// const productSchema = new Schema<IProduct>(
//   {
//     name: { type: String, required: true, trim: true, unique: true },
//     slug: { type: String, lowercase: true, trim: true, unique: true },

//     description: String,

//     price: { type: Number, required: true },
//     stock: { type: Number, default: 0 },
//     reservedStock: { type: Number, default: 0 },

//     category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
//     brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true }, // ✅ now populated

//     images: [{ type: String }],
//     media: [{ type: Schema.Types.ObjectId, ref: "Media" }],

//     variants: [{ type: Schema.Types.ObjectId, ref: "ProductVariant" }],

//     reviews: [reviewSchema],
//     avgRating: { type: Number, default: 0 },
//     totalReviews: { type: Number, default: 0 },
//     totalSales: { type: Number, default: 0 },

//     offeredPrice: { type: Number, default: 0 },
//     isOfferedPriceActive: { type: Boolean, default: false },
//     offerStartDate: { type: Date, default: null },
//     offerEndDate: { type: Date, default: null },
//     discountPercent: { type: Number, default: 0 },

//     tags: [
//       {
//         id: { type: String },
//         name: { type: String, required: true },
//       },
//     ],

//     isFeatured: { type: Boolean, default: false },
//     isActive: { type: Boolean, default: true },
//   },
//   { timestamps: true }
// );

// /* -------------------------------------------------------------------------- */
// /*                                   SLUG                                     */
// /* -------------------------------------------------------------------------- */

// productSchema.pre("save", function (next) {
//   if (this.isModified("name")) {
//     this.slug = this.name.toLowerCase().replace(/\s+/g, "-");
//   }
//   next();
// });

// export const Product =
//   models.Product || model<IProduct>("Product", productSchema);
