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
import { Check, Loader2, Upload, X, FolderTree, ImageIcon, Tag } from "lucide-react";
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
    <div className="min-h-screen  py-8 px-4">
      <div className="max-w-5xl mx-auto">
        
        {/* Main Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
          
          {/* Header */}
          <div className="relative bg-gradient-to-r from-red-600 via-red-700 to-red-800 px-8 py-10">
            <div className="absolute inset-0 bg-black opacity-5"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <FolderTree className="w-8 h-8 text-white" />
                <h1 className="text-4xl font-bold text-white">Add New Category</h1>
              </div>
              <p className="text-red-100 text-lg">
                Create and organize your product categories with ease
              </p>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          </div>

          <div className="p-10 space-y-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                {/* Category Information Section */}
                <div className="space-y-6 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-200">
                  <div className="flex items-center gap-3 pb-4 border-b-2 border-blue-300">
                    <Tag className="w-6 h-6 text-blue-600" />
                    <h3 className="text-2xl font-bold text-gray-800">Category Information</h3>
                  </div>

                  {/* Category Name Field */}
                  <FormField
                    control={form.control}
                    name="categoryName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700 mb-2 block">
                          Category Name *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Electronics, Fashion, Home & Garden"
                            className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-sm" />
                        <p className="text-sm text-gray-600 mt-1">
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
                        <FormLabel className="text-sm font-semibold text-gray-700 mb-2 block">
                          Parent Category <span className="text-gray-500 font-normal">(Optional)</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl text-base">
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
                        <p className="text-sm text-gray-600 mt-1">
                          Select a parent to create a subcategory, or leave empty for a top-level category
                        </p>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Category Image Section */}
                <div className="space-y-6 bg-gradient-to-br from-violet-50 to-purple-50 p-8 rounded-2xl border border-violet-200">
                  <div className="flex items-center gap-3 pb-4 border-b-2 border-violet-300">
                    <ImageIcon className="w-6 h-6 text-violet-600" />
                    <h3 className="text-2xl font-bold text-gray-800">Category Image</h3>
                  </div>

                  <FormField
                    control={form.control}
                    name="categoryImage"
                    render={({ }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700 mb-2 block">
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
                              className={`
                                border-4 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all group
                                ${isDragging 
                                  ? 'border-violet-600 bg-violet-200 scale-105' 
                                  : 'border-violet-300 hover:border-violet-500 hover:bg-violet-100'
                                }
                              `}
                            >
                              <Upload className={`w-16 h-16 mx-auto mb-4 transition-colors ${
                                isDragging ? 'text-violet-600 animate-bounce' : 'text-violet-400 group-hover:text-violet-600'
                              }`} />
                              <p className="text-xl font-semibold text-gray-700 mb-2">
                                {isDragging ? 'Drop image here!' : 'Click to upload or drag & drop'}
                              </p>
                              <p className="text-sm text-gray-500">
                               PNG, JPG up to 5MB each
                              </p>
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
                        <p className="text-sm text-gray-600 mt-1">
                          High-quality images help customers navigate your store more easily
                        </p>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    onClick={() => router.push("/admin/category")}
                    className="flex-1 h-14 text-lg font-semibold bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-all"
                    disabled={buttonState === 'loading'}
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    type="submit"
                    className="flex-1 h-14 text-lg font-semibold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                    disabled={buttonState === 'loading'}
                  >
                    {buttonState === 'idle' && (
                      <span className="flex items-center justify-center gap-2">
                        <FolderTree className="w-5 h-5" />
                        Create Category
                      </span>
                    )}

                    {buttonState === 'loading' && (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating...
                      </span>
                    )}

                    {buttonState === 'success' && (
                      <span className="flex items-center justify-center gap-2">
                        <Check className="w-5 h-5" />
                        Category Created!
                      </span>
                    )}
                  </Button>
                </div>

              </form>
            </Form>
          </div>
        </div>

      </div>
    </div>
  );
}