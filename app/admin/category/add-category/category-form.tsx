"use client";
import { useRef, useState } from "react";
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
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Image from "next/image";
import useSWR from "swr";
import { Check, Loader2, Upload, X, FolderTree, Info, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

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

const categorySchema = z.object({
  categoryName: z.string().min(1, "Category name is required"),
  parentId: z.string().optional(),
  categoryImage: z
    .instanceof(File, { message: "Image file is required" })
    .optional(),
});

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AddCategoryPage() {
  const [imagePreview, setImagePreview] = useState<string>("");
  const [buttonState, setButtonState] = useState<'idle' | 'loading' | 'success'>('idle');
  const [isDragging, setIsDragging] = useState(false);

  const { data, mutate } = useSWR("/api/category/", fetcher);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const categories: Category[] = data?.data || [];
  const router = useRouter();

  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      categoryName: "",
      parentId: "",
      categoryImage: undefined,
    },
  });

  const onSubmit = async (values: z.infer<typeof categorySchema>) => {
    try {
      setButtonState('loading');
  
      const formData = new FormData();
      formData.append("categoryName", values.categoryName);
      if (values.categoryImage) formData.append("categoryImage", values.categoryImage);
      formData.append("parentId", values.parentId || "");
  
      const res = await fetch("/api/category", { method: "POST", body: formData });
      const result = await res.json();
  
      if (!res.ok || !result.success) {
        const errorMessage = result.message || result.error || "Failed to create category";
        toast.error(errorMessage);
        setButtonState("idle");
        return;
      }
  
      toast.success(result.message);
      setButtonState('success');
  
      setTimeout(() => {
        form.reset({
          categoryName: "",
          parentId: "",
          categoryImage: undefined,
        });
        setImagePreview("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setButtonState('idle');
        mutate();
        router.push("/admin/category");
      }, 1200);
  
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
      setButtonState('idle');
    }
  };

  const handleFileChange = (file: File | undefined) => {
    if (file) {
      form.setValue("categoryImage", file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
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

  return (
    <div className="min-h-screen  py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/admin/category")}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Categories</span>
          </button>
          
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
              <FolderTree className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Category</h1>
              <p className="text-gray-500 mt-1">Create and organize your product categories</p>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          
          {/* Progress Indicator */}
          <div className="h-1 bg-gray-100">
            <div 
              className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500"
              style={{ width: buttonState === 'success' ? '100%' : buttonState === 'loading' ? '60%' : '0%' }}
            />
          </div>

          <div className="p-8 lg:p-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                {/* Category Name Field */}
                <FormField
                  control={form.control}
                  name="categoryName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-gray-900 flex items-center gap-2">
                        Category Name
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="e.g., Electronics, Fashion, Home & Garden"
                            className="h-12 pl-4 pr-4 text-base border-gray-300 focus:border-red-500 focus:ring-red-500"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-sm" />
                      <p className="text-sm text-gray-500 mt-1">
                        Choose a clear, descriptive name for your category
                      </p>
                    </FormItem>
                  )}
                />

                {/* Parent Category Field */}
                <FormField
                  control={form.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-gray-900 flex items-center gap-2">
                        Parent Category
                        <span className="text-xs font-normal text-gray-500">(Optional)</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 text-base border-gray-300 focus:border-red-500 focus:ring-red-500">
                            <SelectValue placeholder="Select a parent category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="null">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-gray-400" />
                              <span>None (Top Level Category)</span>
                            </div>
                          </SelectItem>
                          {categories.map((cat: Category) => (
                            <SelectItem key={cat._id} value={cat._id}>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500" />
                                <span>{cat.categoryName}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-sm" />
                      <p className="text-sm text-gray-500 mt-1">
                        Select a parent to create a subcategory, or leave empty for a top-level category
                      </p>
                    </FormItem>
                  )}
                />

                {/* Category Image Field */}
                <FormField
                  control={form.control}
                  name="categoryImage"
                  render={({ }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-gray-900 flex items-center gap-2">
                        Category Image
                        <span className="text-xs font-normal text-gray-500">(Optional)</span>
                      </FormLabel>
                      <FormControl>
                        <div>
                          {!imagePreview ? (
                            <div
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={handleDrop}
                              onClick={() => fileInputRef.current?.click()}
                              className={`
                                relative border-2 border-dashed rounded-xl p-8 cursor-pointer
                                transition-all duration-200 hover:border-red-400 hover:bg-red-50/50
                                ${isDragging ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'}
                              `}
                            >
                              <div className="flex flex-col items-center justify-center gap-3">
                                <div className="p-4 bg-white rounded-full shadow-sm">
                                  <Upload className="w-8 h-8 text-red-500" />
                                </div>
                                <div className="text-center">
                                  <p className="text-base font-medium text-gray-900 mb-1">
                                    Drop your image here, or <span className="text-red-600">browse</span>
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Supports: JPG, PNG, GIF (Max 5MB)
                                  </p>
                                </div>
                              </div>
                              <Input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  handleFileChange(file);
                                }}
                              />
                            </div>
                          ) : (
                            <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50">
                              <div className="relative aspect-video">
                                <Image
                                  src={imagePreview}
                                  alt="Category preview"
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="absolute top-3 right-3">
                                <button
                                  type="button"
                                  onClick={removeImage}
                                  className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                                <p className="text-white text-sm font-medium">Image uploaded successfully</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )}
                />

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/admin/category")}
                    className="h-12 px-6 text-base font-medium border-gray-300 hover:bg-gray-50"
                    disabled={buttonState === 'loading'}
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    type="submit"
                    className={`
                      flex-1 h-12 text-base font-semibold transition-all
                      ${buttonState === 'success' 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                      }
                      shadow-lg hover:shadow-xl
                    `}
                    disabled={buttonState === 'loading'}
                  >
                    {buttonState === 'idle' && (
                      <span className="flex items-center gap-2">
                        <FolderTree className="w-5 h-5" />
                        Create Category
                      </span>
                    )}

                    {buttonState === 'loading' && (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating...
                      </span>
                    )}

                    {buttonState === 'success' && (
                      <span className="flex items-center gap-2">
                        <Check className="w-5 h-5" />
                        Category Created!
                      </span>
                    )}
                  </Button>
                </div>

              </form>
            </Form>
          </div>

          {/* Footer Info */}
          <div className="px-8 lg:px-10 pb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Info className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">Pro Tip</h4>
                  <p className="text-sm text-blue-700">
                    Use high-quality images with a 16:9 aspect ratio for best results. Category images help customers navigate your store more easily.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
