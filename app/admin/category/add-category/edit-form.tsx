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
import Image from "next/image";
import { Upload, X, Loader2, Check } from "lucide-react";
import toast from "react-hot-toast";
import { CategoryType } from "@/types/product";



const categorySchema = z.object({
  categoryName: z.string().min(1, "Category name is required"),
  parentId: z.string().optional(),
  categoryImage: z.instanceof(File).optional(),
});

interface EditCategoryFormProps {
  category: CategoryType;
  categories: CategoryType[]; // parent dropdown
  onSubmit: (formData: FormData) => Promise<{ success: boolean; message: string }>;
  onCancel?: () => void;
}

export default function EditCategoryForm({
  category,
  categories,
  onSubmit,
  onCancel,
}: EditCategoryFormProps) {
  const [imagePreview, setImagePreview] = useState(category.categoryImage || "");
  const [buttonState, setButtonState] = useState<"idle" | "loading" | "success">("idle");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      categoryName: category.categoryName,
   parentId: category.parentId || "",

      categoryImage: undefined,
    },
  });

  const handleFileChange = (file?: File) => {
    if (!file) return;
    form.setValue("categoryImage", file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImagePreview("");
    form.setValue("categoryImage", undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
    if (file && file.type.startsWith("image/")) handleFileChange(file);
  };

  const submitForm = async (values: z.infer<typeof categorySchema>) => {
    try {
      setButtonState("loading");
      const formData = new FormData();
      formData.append("categoryName", values.categoryName);
      formData.append("parentId", values.parentId || "");
      if (values.categoryImage) formData.append("categoryImage", values.categoryImage);

      const res = await onSubmit(formData);
      if (!res.success) {
        toast.error(res.message);
        setButtonState("idle");
        return;
      }

      toast.success(res.message);
      setButtonState("success");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
      setButtonState("idle");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submitForm)} className="space-y-4">
          <FormField
            control={form.control}
            name="categoryName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category Name</FormLabel>
                <FormControl>
                  <Input {...field} className="h-12" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="parentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent Category (Optional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select a parent category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="null">None (Top Level)</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.categoryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Image */}
          <FormField
            control={form.control}
            name="categoryImage"
            render={() => (
              <FormItem>
                <FormLabel>Category Image (Optional)</FormLabel>
                <FormControl>
                  {!imagePreview ? (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-6 cursor-pointer text-center ${
                        isDragging ? "border-red-500 bg-red-50" : "border-gray-300 bg-gray-50"
                      }`}
                    >
                      <Upload className="w-8 h-8 mx-auto mb-2 text-red-500" />
                      <p className="text-sm text-gray-500">Drop or select an image</p>
                      <Input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange(e.target.files?.[0])}
                      />
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden border-2 border-gray-200">
                      <div className="relative aspect-video">
                        <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                      </div>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Buttons */}
          <div className="flex gap-3 justify-end mt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={buttonState === "loading"}>
              {buttonState === "idle" && "Update"}
              {buttonState === "loading" && <Loader2 className="w-4 h-4 animate-spin" />}
              {buttonState === "success" && <Check className="w-4 h-4" />}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
