import { Schema, Document, model, models, Types } from "mongoose";

import { IProduct } from "@/models/productModel";


export interface IProductVariant extends Document {
  _id: Types.ObjectId;

  product: Types.ObjectId | IProduct; 

  specs: {
    cpu: string;
    ram: string;
    storage: string;
    color?: string;
  };

  price: number;
  discountPercent?: number;
  offeredPrice?: number;
  isOfferActive?: boolean;
  offerStartDate?: Date;
  offerEndDate?: Date;

  stock: number;
  reservedStock: number;
  sku: string;
  images?: string[];
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const variantSchema = new Schema<IProductVariant>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },


 sku: { type: String, unique: true},


    specs: {
      cpu: { type: String, required: true },
      ram: { type: String, required: true },
      storage: { type: String, required: true },
      color: String,
    },

    price: { type: Number, required: true },


    discountPercent: { type: Number, default: 0 },
    offeredPrice: { type: Number, default: 0 },
    isOfferActive: { type: Boolean, default: false },
    offerStartDate: Date,
    offerEndDate: Date,

    stock: { type: Number, default: 0 },
    reservedStock: { type: Number, default: 0 },

    images: [String],


    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// 🔹 Auto-generate SKU before saving
variantSchema.pre("save", async function (next) {


  const Product = models.Product;
  const product = await Product.findById(this.product);
  if (!product) return next(new Error("Product not found"));

  const productCode = product.slug.toUpperCase();

  const newSku = [
    productCode,
    this.specs.cpu,
    this.specs.ram,
    this.specs.storage,
    this.specs.color,
  ]
    .filter(Boolean)
    .map(v => v.replace(/\s+/g, "").toUpperCase())
    .join("-");



  this.sku = newSku;
  next();
});





export const ProductVariant =
  models.ProductVariant || model<IProductVariant>("ProductVariant", variantSchema);
