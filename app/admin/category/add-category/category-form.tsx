"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import Image from "@/components/ui/optimized-image";

import { Check, FolderTree, ImageIcon, Loader2, Package, Tag, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { CategoryType } from "@/types/product";
import {
  formatCategoryDisplayName,
  isValidCategoryName,
  normalizeCategoryName,
} from "@/lib/helpers/category";
import {
  buildCategoryPathOptions,
} from "@/lib/helpers/categorySelection";
import { createCategory, getCategories } from "@/lib/server/actions/admin/category/categoryAction";

export interface Category {
  _id: string;
  categoryName: string;
  slug?: string;
  categoryImage?: string;
  parentId?: {
    _id: string;
    categoryName: string;
  } | null;
  createdAt?: string;
  updatedAt?: string;
}

type ParentCategory = Category | CategoryType;

const NO_PARENT = "__NO_PARENT__";

const categorySchema = z.object({
  categoryName: z
    .string()
    .refine((value) => normalizeCategoryName(value).length > 0, "Category name is required")
    .refine(
      (value) => isValidCategoryName(normalizeCategoryName(value)),
      "Category name contains unsupported characters"
    ),
  parentId: z.string().optional(),
  categoryImage: z.instanceof(File).optional(),
  isActive: z.boolean(),
});

function getCategoryId(category: ParentCategory) {
  return "id" in category ? category.id : category._id;
}

function getParentId(category?: CategoryType | null) {
  return category?.parentId || undefined;
}

interface CategoryFormProps {
  editCategory?: CategoryType | null;
  categories?: ParentCategory[];
  onSubmit?: (formData: FormData) => Promise<{ success: boolean; message: string }>;
  onCancel?: () => void;
}

export function CategoryForm({
  editCategory = null,
  categories: categoriesProp,
  onSubmit,
  onCancel,
}: CategoryFormProps) {
  const [imagePreview, setImagePreview] = useState<string>(editCategory?.categoryImage || "");
  const [buttonState, setButtonState] = useState<"idle" | "loading" | "success">("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [categories, setCategories] = useState<ParentCategory[]>(categoriesProp || []);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const isEditMode = Boolean(editCategory);

  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      categoryName: editCategory ? formatCategoryDisplayName(editCategory.categoryName) : "",
      parentId: getParentId(editCategory),
      categoryImage: undefined,
      isActive: editCategory?.isActive ?? true,
    },
  });

  useEffect(() => {
    if (categoriesProp) {
      setCategories(categoriesProp);
      return;
    }

    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        if (res.success) {
          setCategories(res.data);
        } else {
          console.error("Failed to fetch categories");
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchCategories();
  }, [categoriesProp]);

  useEffect(() => {
    form.reset({
      categoryName: editCategory ? formatCategoryDisplayName(editCategory.categoryName) : "",
      parentId: getParentId(editCategory),
      categoryImage: undefined,
      isActive: editCategory?.isActive ?? true,
    });
    setImagePreview(editCategory?.categoryImage || "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [editCategory, form]);

  const handleFileChange = (file: File | undefined) => {
    if (!file) return;
    form.setValue("categoryImage", file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleFileChange(file);
    }
  };

  const removeImage = () => {
    setImagePreview("");
    form.setValue("categoryImage", undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const submitForm = async (values: z.infer<typeof categorySchema>) => {
    try {
      setButtonState("loading");

      const formData = new FormData();
      formData.append("categoryName", normalizeCategoryName(values.categoryName));
      formData.append("isActive", values.isActive ? "true" : "false");
      if (values.categoryImage) formData.append("categoryImage", values.categoryImage);
      if (values.parentId && values.parentId !== NO_PARENT) {
        formData.append("parentId", values.parentId);
      } else if (isEditMode) {
        formData.append("parentId", "");
      }

      const result = onSubmit ? await onSubmit(formData) : await createCategory(formData);

      if (!result.success) {
        toast.error(result.message || `Failed to ${isEditMode ? "update" : "create"} category`);
        setButtonState("idle");
        return;
      }

      toast.success(result.message);
      setButtonState("success");

      if (!isEditMode) {
        form.reset({
          categoryName: "",
          parentId: undefined,
          categoryImage: undefined,
          isActive: true,
        });
        setImagePreview("");
        if (fileInputRef.current) fileInputRef.current.value = "";

        router.push("/admin/category");
        router.refresh();

        const updatedRes = await getCategories();
        if (updatedRes.success) {
          setCategories(updatedRes.data);
        }
      }

      setButtonState("idle");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
      setButtonState("idle");
    }
  };

  const visibleParentCategories = categories.filter((category) => {
    if (!editCategory) return true;
    return getCategoryId(category) !== editCategory.id;
  });
  const parentCategoryOptions = useMemo(
    () => buildCategoryPathOptions(visibleParentCategories),
    [visibleParentCategories]
  );

  return (
    <div className="bg-white overflow-auto rounded-2xl w-full mx-auto shadow-2xl border border-red-100">
      <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <FolderTree className="w-8 h-8 text-white" />
          <div>
            <h2 className="text-3xl font-bold text-white">
              {isEditMode ? "Edit Category" : "Add New Category"}
            </h2>
            <p className="text-red-100 mt-1">
              {isEditMode
                ? "Update category information"
                : "Fill in the details to create a new category"}
            </p>
          </div>
        </div>
      </div>

      <div className="p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submitForm)} className="space-y-8">
            <div className="space-y-6 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-200">
              <div className="flex items-center gap-3 pb-4 border-b-2 border-blue-300">
                <Tag className="w-6 h-6 text-blue-600" />
                <h3 className="text-2xl font-bold text-gray-800">Category Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="categoryName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        Category Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Electronics, Fashion, Home & Garden"
                          className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        Parent Category <span className="text-gray-500 font-normal">(Optional)</span>
                      </FormLabel>
                      <Select
                        value={field.value ?? NO_PARENT}
                        onValueChange={(value) => {
                          field.onChange(value === NO_PARENT ? undefined : value);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl text-base">
                            <SelectValue placeholder="Select a parent category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-w-[min(42rem,calc(100vw-2rem))]">
                          <SelectItem value={NO_PARENT}>None (Top Level Category)</SelectItem>
                          {parentCategoryOptions.length > 0 && (
                            <SelectGroup>
                              <SelectLabel>Exact Category Paths</SelectLabel>
                              {parentCategoryOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                  title={option.label}
                                  className="whitespace-normal"
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-6 bg-gradient-to-br from-violet-50 to-purple-50 p-8 rounded-2xl border border-violet-200">
              <div className="flex items-center gap-3 pb-4 border-b-2 border-violet-300">
                <ImageIcon className="w-6 h-6 text-violet-600" />
                <h3 className="text-2xl font-bold text-gray-800">Category Image</h3>
              </div>

              <FormField
                control={form.control}
                name="categoryImage"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-700">
                      Upload Image <span className="text-gray-500 font-normal">(Optional)</span>
                    </FormLabel>
                    <FormControl>
                      <div>
                        <div
                          onDragEnter={handleDragEnter}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className={`border-4 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all group ${
                            isDragging
                              ? "border-violet-600 bg-violet-200 scale-105"
                              : "border-violet-300 hover:border-violet-500 hover:bg-violet-100"
                          }`}
                        >
                          <Upload
                            className={`w-16 h-16 mx-auto mb-4 transition-colors ${
                              isDragging
                                ? "text-violet-600 animate-bounce"
                                : "text-violet-400 group-hover:text-violet-600"
                            }`}
                          />
                          <p className="text-xl font-semibold text-gray-700 mb-2">
                            {isDragging ? "Drop image here!" : "Click to upload or drag & drop"}
                          </p>
                          <p className="text-sm text-gray-500">PNG, JPG up to 5MB each</p>
                          <Input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileChange(e.target.files?.[0])}
                          />
                        </div>

                        {imagePreview && (
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
                            <div className="relative aspect-square group">
                              <Image
                                src={imagePreview}
                                alt="Category preview"
                                fill
                                className="object-cover rounded-xl border-2 border-violet-200 group-hover:border-violet-500 transition-all"
                              />
                              <button
                                type="button"
                                onClick={removeImage}
                                className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg transition-all hover:scale-110"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage className="text-sm" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-2xl border-2 border-amber-200">
                    <div>
                      <p className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Package className="w-5 h-5 text-amber-600" />
                        Category Status
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Enable to make this category visible to customers
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-green-600"
                      />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                onClick={onCancel || (() => router.push("/admin/category"))}
                className="flex-1 h-14 text-lg font-semibold bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-all"
                disabled={buttonState === "loading"}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="flex-1 h-14 text-lg font-semibold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                disabled={buttonState === "loading"}
              >
                {buttonState === "idle" && (
                  <span className="flex items-center justify-center gap-2">
                    <FolderTree className="w-5 h-5" />
                    {isEditMode ? "Update Category" : "Create Category"}
                  </span>
                )}

                {buttonState === "loading" && (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isEditMode ? "Updating..." : "Creating..."}
                  </span>
                )}

                {buttonState === "success" && (
                  <span className="flex items-center justify-center gap-2">
                    <Check className="w-5 h-5" />
                    {isEditMode ? "Category Updated!" : "Category Created!"}
                  </span>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default function AddCategoryPage() {
  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <CategoryForm />
      </div>
    </div>
  );
}
