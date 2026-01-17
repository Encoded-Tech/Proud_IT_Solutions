"use client";

import { useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import Image from "next/image";
import { 
  Loader2, 
  Check, 
  Plus, 
  X, 
  Upload, 
  Package,
  DollarSign,
  Calendar,
  Tag,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { 
  createProductAction, 
  updateProductAction, 
} from "@/lib/server/actions/admin/product/productActions";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

// Types
interface Category {
  id: string;
  categoryName: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  description: string;
  category: {
    id: string;
    categoryName: string;
  };
  images?: string[] | null;
  variants?: string[] | null;
  tags: Array<{ id: string; name: string }>;
  brandName: string;
  discountPercent: number;
  offeredPrice: number;
  isOfferedPriceActive: boolean;
  offerStartDate: string;
  offerEndDate: string;
  isActive: boolean;
  createdAt: string;
  totalSales: number;
  avgRating: number;
}

interface ProductFormData {
  name: string;
  price: number;
  stock: number;
  description: string;
  category: string;
  images: File[];
  variants: string[];
  tags: string[];
  brandName: string;
  discountPercent: number;
  offerStartDate: string;
  offerEndDate: string;
  isActive: boolean;
}

// Product Form Component
export function AddProductForm({ 
  categories, 
  editProduct = null,
}: { 
  categories: Category[];
  editProduct?: Product | null;
}) {
  const [images, setImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>(editProduct?.images || []);
  const [buttonState, setButtonState] = useState<"idle" | "loading" | "success">("idle");
  const [tagsList, setTagsList] = useState<string[]>(
    editProduct?.tags?.map(t => t.name) || []
  );
  const [tagInput, setTagInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { register, handleSubmit, watch, setValue, control, reset } = useForm<ProductFormData>({
    defaultValues: {
      name: editProduct?.name || "",
      price: editProduct?.price || 0,
      stock: editProduct?.stock || 0,
      description: editProduct?.description || "",
      category: editProduct?.category?.id || "",
      images: [],
      variants: editProduct?.variants || [],
      tags: editProduct?.tags?.map(t => t.name) || [],
      brandName: editProduct?.brandName || "",
      discountPercent: editProduct?.discountPercent || 0,
      offerStartDate: editProduct?.offerStartDate || "",
      offerEndDate: editProduct?.offerEndDate || "",
      isActive: editProduct?.isActive ?? true,
    },
  });

  const watchDiscount = watch("discountPercent");
  const watchPrice = watch("price");

  const calculateOfferedPrice = () => {
    if (watchDiscount && watchPrice) {
      return Math.round(Number(watchPrice) - (Number(watchPrice) * Number(watchDiscount)) / 100);
    }
    return 0;
  };

  const setOfferDates = (startOption: "today" | "tomorrow", daysFromStart: number) => {
    const today = new Date();
    let start: Date;
    
    if (startOption === "today") {
      start = today;
    } else {
      start = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    }

    const end = new Date(start.getTime() + daysFromStart * 24 * 60 * 60 * 1000);

    setValue("offerStartDate", start.toISOString().substring(0, 10));
    setValue("offerEndDate", end.toISOString().substring(0, 10));
  };

  const handleImageSelect = (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    setImages(prev => [...prev, ...fileArray]);
    const newPreviews = fileArray.map(f => URL.createObjectURL(f));
    setImagePreview(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleImageSelect(files);
    }
  };

  const addTag = () => {
    const val = tagInput.trim();
    if (val && !tagsList.includes(val)) {
      setTagsList([...tagsList, val]);
      setTagInput("");
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      setButtonState("loading");

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("price", String(data.price));
      formData.append("stock", String(data.stock));
      formData.append("description", data.description || "");
      formData.append("category", data.category);
      formData.append("tags", JSON.stringify(tagsList.map(t => ({ name: t }))));
      formData.append("brandName", data.brandName || "");
      formData.append("discountPercent", String(data.discountPercent));
      formData.append("offerStartDate", data.offerStartDate || "");
      formData.append("offerEndDate", data.offerEndDate || "");
      formData.append("isActive", data.isActive ? "true" : "false");

      images.forEach(img => formData.append("images", img));

      let res;
      if (editProduct) {
        res = await updateProductAction({ 
          productId: editProduct.id, 
          formData 
        });
      } else {
        res = await createProductAction(formData);
      }

      if (!res.success) {
        toast.error(res.message);
        setButtonState("idle");
        return;
      }

      if (res.success) {
        toast.success(res.message);

        if (editProduct) {
          window.location.reload();
        } else {
          router.push("/admin/product");
        }

        setButtonState("success");
        setTimeout(() => {
          if (!editProduct) {
            reset();
            setImages([]);
            setImagePreview([]);
            setTagsList([]);
          }
          setButtonState("idle");
        }, 1200);
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
      setButtonState("idle");
    }
  };

  const offeredPrice = watchDiscount > 0 && watchPrice > 0 ? calculateOfferedPrice() : null;

  return (
    <div className="bg-white overflow-auto rounded-2xl max-w-6xl mx-auto shadow-2xl border border-red-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white">
              {editProduct ? "Edit Product" : "Add New Product"}
            </h2>
            <p className="text-red-100 mt-1">
              {editProduct ? "Update product information" : "Fill in the details to create a new product"}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
        {/* Basic Information */}
        <div className="space-y-6 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-200">
          <div className="flex items-center gap-3 pb-4 border-b-2 border-blue-300">
            <Package className="w-6 h-6 text-blue-600" />
            <h3 className="text-2xl font-bold text-gray-800">Basic Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Product Name  <span className="text-red-500">*</span></label>
              <Input 
                {...register("name", { required: true })} 
                placeholder="Enter product name"
                className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Brand Name  <span className="text-red-500">*</span></label>
              <Input 
                {...register("brandName")} 
                placeholder="Enter brand name"
                className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Category  <span className="text-red-500">*</span></label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <SelectTrigger className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.categoryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Description</label>
            <Textarea 
              {...register("description")} 
              placeholder="Enter product description"
              rows={4}
              className="border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl"
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-6 bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-2xl border border-emerald-200">
          <div className="flex items-center gap-3 pb-4 border-b-2 border-emerald-300">
            <DollarSign className="w-6 h-6 text-emerald-600" />
            <h3 className="text-2xl font-bold text-gray-800">Pricing & Inventory</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Base Price (NPR)  <span className="text-red-500">*</span></label>
              <Input 
                type="number" 
                {...register("price", { required: true })}
                placeholder="125000"
                className="h-12 border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-xl text-lg font-semibold"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Stock Quantity  <span className="text-red-500">*</span></label>
              <Input 
                type="number" 
                {...register("stock")}
                placeholder="50"
                className="h-12 border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-xl"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Discount (%)</label>
              <Input 
                type="number" 
                {...register("discountPercent")}
                placeholder="15"
                min="0"
                max="100"
                className="h-12 border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-xl"
              />
            </div>
          </div>

          {offeredPrice !== null && (
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-2xl shadow-lg">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-white animate-pulse" />
                <div>
                  <p className="text-white text-sm font-medium">Special Offer Price</p>
                  <p className="text-white text-3xl font-bold">NPR {offeredPrice.toLocaleString()}</p>
                </div>
                <div className="ml-auto bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                  <p className="text-black text-sm">Customer Saves</p>
                  <p className="text-black text-xl font-bold">
                    NPR {(watchPrice - offeredPrice).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {watchDiscount > 0 && (
            <div className="space-y-4 bg-white p-6 rounded-xl border-2 border-dashed border-emerald-300">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <label className="text-lg font-semibold text-gray-800">Promotional Period</label>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 block">Start Date Options</label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setOfferDates("today", 0)}
                    className="border-2 border-emerald-300 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all"
                  >
                    Today
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setOfferDates("tomorrow", 0)}
                    className="border-2 border-emerald-300 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all"
                  >
                    Tomorrow
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 block">Duration from Start</label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setOfferDates("today", 1)}
                    className="border-2 border-purple-300 hover:bg-purple-500 hover:text-white hover:border-purple-500 transition-all"
                  >
                    1 Day
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setOfferDates("today", 5)}
                    className="border-2 border-purple-300 hover:bg-purple-500 hover:text-white hover:border-purple-500 transition-all"
                  >
                    5 Days
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setOfferDates("today", 7)}
                    className="border-2 border-purple-300 hover:bg-purple-500 hover:text-white hover:border-purple-500 transition-all"
                  >
                    1 Week
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setOfferDates("today", 14)}
                    className="border-2 border-purple-300 hover:bg-purple-500 hover:text-white hover:border-purple-500 transition-all"
                  >
                    2 Weeks
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setOfferDates("today", 30)}
                    className="border-2 border-purple-300 hover:bg-purple-500 hover:text-white hover:border-purple-500 transition-all"
                  >
                    1 Month
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setOfferDates("today", 60)}
                    className="border-2 border-purple-300 hover:bg-purple-500 hover:text-white hover:border-purple-500 transition-all"
                  >
                    2 Months
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setOfferDates("today", 90)}
                    className="border-2 border-purple-300 hover:bg-purple-500 hover:text-white hover:border-purple-500 transition-all"
                  >
                    3 Months
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setOfferDates("today", 180)}
                    className="border-2 border-purple-300 hover:bg-purple-500 hover:text-white hover:border-purple-500 transition-all"
                  >
                    6 Months
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setOfferDates("today", 365)}
                    className="border-2 border-purple-300 hover:bg-purple-500 hover:text-white hover:border-purple-500 transition-all"
                  >
                    1 Year
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Offer Start Date</label>
                  <Input
                    type="date"
                    {...register("offerStartDate")}
                    className="h-12 border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Offer End Date</label>
                  <Input
                    type="date"
                    {...register("offerEndDate")}
                    className="h-12 border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="space-y-6 bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-2xl border border-amber-200">
          <div className="flex items-center gap-3 pb-4 border-b-2 border-amber-300">
            <Tag className="w-6 h-6 text-amber-600" />
            <h3 className="text-2xl font-bold text-gray-800">Tags</h3>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2 flex-wrap min-h-[60px] p-4 bg-white rounded-xl border-2 border-amber-200">
              {tagsList.map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-semibold shadow-sm"
                >
                  {tag}
                  <X 
                    className="w-4 h-4 cursor-pointer hover:text-amber-900 transition-colors" 
                    onClick={() => setTagsList(tagsList.filter((_, idx) => idx !== i))}
                  />
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                placeholder="Add tag and press Enter"
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                className="h-12 border-2 border-amber-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 rounded-xl"
              />
              <Button 
                type="button" 
                onClick={addTag}
                className="h-12 px-6 bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="space-y-6 bg-gradient-to-br from-violet-50 to-purple-50 p-8 rounded-2xl border border-violet-200">
          <div className="flex items-center gap-3 pb-4 border-b-2 border-violet-300">
            <ImageIcon className="w-6 h-6 text-violet-600" />
            <h3 className="text-2xl font-bold text-gray-800">Product Images</h3>
          </div>

          <div
            className={`border-4 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all group ${
              isDragging 
                ? 'border-violet-600 bg-violet-200 scale-105' 
                : 'border-violet-300 hover:border-violet-500 hover:bg-violet-100'
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className={`w-16 h-16 mx-auto mb-4 transition-colors ${
              isDragging ? 'text-violet-600 animate-bounce' : 'text-violet-400 group-hover:text-violet-600'
            }`} />
            <p className="text-xl font-semibold text-gray-700 mb-2">
              {isDragging ? 'Drop images here!' : 'Click to upload or drag & drop'}
            </p>
            <p className="text-sm text-gray-500">PNG, JPG up to 5MB each</p>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              ref={fileInputRef}
              onChange={e => handleImageSelect(e.target.files)}
            />
          </div>

          {imagePreview.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {imagePreview.map((src, i) => (
                <div key={i} className="relative aspect-square group">
                  <Image 
                    src={src} 
                    alt={`preview ${i}`} 
                    fill 
                    className="object-cover rounded-xl border-2 border-violet-200 group-hover:border-violet-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg transition-all hover:scale-110"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status */}
     <div className="flex justify-between items-center bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-2xl border-2 border-amber-200">
          <div>
            <p className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-600" />
              Product Status
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Enable to make this product visible to customers
            </p>
          </div>
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <Switch 
                checked={field.value} 
                onCheckedChange={field.onChange}
                className="data-[state=checked]:bg-green-600"
              />
            )}
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-4 pt-6">
          <Button
            type="button"
            onClick={() => {
              if (editProduct) {
                window.location.reload();
              } else {
                router.push("/admin/product");
              }
            }}
            className="flex-1 h-14 text-lg font-semibold bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-all"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            className="flex-1 h-14 text-lg font-semibold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
            disabled={buttonState === "loading"}
          >
            {buttonState === "idle" && (editProduct ? "Update Product" : "Create Product")}
            {buttonState === "loading" && <Loader2 className="animate-spin w-6 h-6" />}
            {buttonState === "success" && <Check className="w-6 h-6" />}
          </Button>
        </div>
      </form>
    </div>
  );
}