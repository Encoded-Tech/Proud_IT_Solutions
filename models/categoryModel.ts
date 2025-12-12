
import { Schema, Document, model, models, Types } from "mongoose";

export interface ICategory extends Document {
  _id: Types.ObjectId;
  categoryName: string;
  categoryImage?: string;
  slug: string;
  parentId?: Types.ObjectId | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
}

export interface ICategoryWithCount extends ICategory {
  productCount: number;
}

const categorySchema = new Schema<ICategory>(
  {
    categoryName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    categoryImage: {
      type: String,
      default: "",
    },
    slug: {
      type: String,
      lowercase: true,
      unique: true,
      trim: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Category", // self-reference
      default: null,   // null = top-level
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, 
    versionKey: false, 
  }
);

// Pre-save Middleware (auto-generate slug)
categorySchema.pre("save", function (next) {
  if (this.isModified("categoryName")) {
    this.slug = this.categoryName.toLowerCase().replace(/\s+/g, "-");
  }
  next();
});


export const Category =
  models.Category || model<ICategory>("Category", categorySchema);

