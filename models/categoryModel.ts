
import { Schema, Document, model, models, Types } from "mongoose";
import { createCategorySlug, normalizeCategoryName } from "@/lib/helpers/category";

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
      set: normalizeCategoryName,
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
    this.categoryName = normalizeCategoryName(this.categoryName);
    this.slug = createCategorySlug(this.categoryName);
  }
  next();
});

categorySchema.index({ isActive: 1, createdAt: -1 });
categorySchema.index({ categoryName: 1, isActive: 1 });
categorySchema.index({ slug: 1, isActive: 1 });
categorySchema.index({ parentId: 1, isActive: 1 });


export const Category =
  models.Category || model<ICategory>("Category", categorySchema);

