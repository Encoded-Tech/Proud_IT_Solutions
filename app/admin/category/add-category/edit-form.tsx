"use client";

import { X } from "lucide-react";
import { CategoryType } from "@/types/product";
import { CategoryForm } from "./category-form";

interface EditCategoryFormProps {
  category: CategoryType;
  categories: CategoryType[];
  onSubmit: (formData: FormData) => Promise<{ success: boolean; message: string }>;
  onCancel?: () => void;
}

export default function EditCategoryForm({
  category,
  categories,
  onSubmit,
  onCancel,
}: EditCategoryFormProps) {
  return (
    <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto">
      <button
        type="button"
        onClick={onCancel}
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-red-600 shadow-lg ring-1 ring-red-100 transition hover:bg-red-50 hover:text-red-700"
        aria-label="Close edit category form"
      >
        <X className="h-5 w-5" />
      </button>
      <CategoryForm
        editCategory={category}
        categories={categories}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    </div>
  );
}
