import { Schema, Document, model, models, Types } from "mongoose";

export interface IProductVariant extends Document {
  product: Types.ObjectId;
  specs: {
    cpu: string;
    ram: string;
    storage: string;
    color?: string;
  };
  price: number;
  stock: number;
  sku: string;
  images?: string[];
  isActive: boolean;
}

const variantSchema = new Schema<IProductVariant>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    specs: {
      cpu: { type: String, required: true },
      ram: { type: String, required: true },
      storage: { type: String, required: true },
      color: String,
    },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    sku: { type: String, unique: true },
    images: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// 🔹 Auto-generate SKU before saving
variantSchema.pre("save", async function (next) {
  if (!this.sku) {
    // Fetch the product to get product code or name
    const Product = models.Product;
    const product = await Product.findById(this.product);

    if (!product) return next(new Error("Product not found"));

    // Create a short product code (use slug or first letters)
    const productCode = product.slug.toUpperCase(); // e.g., NITROV15

    // Build SKU from specs
    const cpu = this.specs.cpu.replace(/\s+/g, "").toUpperCase();
    const ram = this.specs.ram.replace(/\s+/g, "").toUpperCase();
    const storage = this.specs.storage.replace(/\s+/g, "").toUpperCase();
    const color = this.specs.color ? this.specs.color.replace(/\s+/g, "").toUpperCase() : "";

    // Combine into SKU
    this.sku = [productCode, cpu, ram, storage, color].filter(Boolean).join("-");
  }
  next();
});

export const ProductVariant =
  models.ProductVariant || model<IProductVariant>("ProductVariant", variantSchema);
