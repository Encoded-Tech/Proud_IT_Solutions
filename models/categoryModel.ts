import mongoose from "mongoose";

export interface CategoryData {
    categoryName: string;
    categoryImage: string;
}

const categorySchema = new mongoose.Schema<CategoryData>({
    categoryName: {
        type: String,
        required: true,
    },
    categoryImage: {
        type: String,
        default: "", // Default to empty string if not provided
      },
});

export const Category = mongoose.models.Category || mongoose.model<CategoryData>("Category", categorySchema);