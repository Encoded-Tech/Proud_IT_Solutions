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
import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

 // your new TS interface
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
  

// ---------------- ZOD SCHEMA ----------------
const categorySchema = z.object({
  categoryName: z.string().min(1, "Category name is required"),
  parentId: z.string().optional(),
  categoryImage: z
    .instanceof(File, { message: "Image file is required" })
    .optional(),
});

// -------------- SWR Fetcher ------------------
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AddCategoryPage() {
  const [imagePreview, setImagePreview] = useState<string>("");
  const [buttonState, setButtonState] = useState<'idle' | 'loading' | 'success'>('idle');


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

  // ---------------- HANDLE SUBMIT ----------------
  const onSubmit = async (values: z.infer<typeof categorySchema>) => {
    try {
      setButtonState('loading'); // start loading
  
      const formData = new FormData();
      formData.append("categoryName", values.categoryName);
      if (values.categoryImage) formData.append("categoryImage", values.categoryImage);
      formData.append("parentId", values.parentId || "");
  
      const res = await fetch("/api/category", { method: "POST", body: formData });
      const result = await res.json();
  
      if (!res.ok || !result.success) {
        const errorMessage =
        result.message || result.error || // from `errorHandler`
           // in case backend sends raw messages
          "Failed to create category";
  
      
  
        toast.error(errorMessage);
        setButtonState("idle");
        return;
      }
  
      toast.success(result.message);
      setButtonState('success'); // success state
  
      // reset form after a short delay to show success animation
      setTimeout(() => {
        form.reset({
            categoryName: "",
            parentId: "", // <-- reset parentId
            categoryImage: undefined, // <-- reset image file
          });
          
        setImagePreview("");
          // Clear file input manually
  if (fileInputRef.current) {
    fileInputRef.current.value = "";
  }

        setButtonState('idle');
        mutate(); // refresh categories in dropdown 
        router.push("/admin/category"); 
      }, 1200);
  
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
      setButtonState('idle');
    }
  };
  

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-start py-10 px-4">
      <div className="w-full max-w-5xl bg-white p-8 rounded-xl shadow-md border">

        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Add New Category
        </h1>

        <p className="text-gray-500 mb-6">
          Create a new category, assign an optional parent category, and upload a category image.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* CATEGORY NAME */}
            <FormField
              control={form.control}
              name="categoryName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter category name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* PARENT CATEGORY */}
            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Category (Optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent category" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      <SelectItem value="null">None (Top Level)</SelectItem>

                      {categories.map((cat: Category) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.categoryName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* CATEGORY IMAGE */}
            <FormField
              control={form.control}
              name="categoryImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Image</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          field.onChange(file);
                          setImagePreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* IMAGE PREVIEW */}
            {imagePreview && (
              <div className="mt-3">
                <p className="text-sm text-gray-500 mb-1">Preview:</p>
                <Image
                  src={imagePreview}
                  alt="Preview"
                  width={200}
                  height={200}
                  className="rounded-md border object-cover"
                />
              </div>
            )}

<Button
  type="submit"
  className={`w-full h-11 text-lg transition-all flex items-center justify-center gap-2`}
  disabled={buttonState === 'loading'}
>
  {buttonState === 'idle' && 'Add Category'}

  {buttonState === 'loading' && (
    <Loader2 className="w-5 h-5 animate-spin" />
  )}

  {buttonState === 'success' && (
    <div className="flex items-center gap-2">
      <Check className="w-5 h-5 text-green-500" />
      Success
    </div>
  )}
</Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
