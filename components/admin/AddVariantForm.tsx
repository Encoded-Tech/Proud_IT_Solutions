"use client";

import { useState, useRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import Image from "next/image";
import {
  Loader2,
  Check,
  X,
  Upload,
  Cpu,
  DollarSign,
  Package,
  Calendar,
  Tag,
  ChevronDown,
  Sparkles,
  ImageIcon,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import { productType, ProductVariantType } from "@/types/product";
import {
  createProductVariantAction,
  updateProductVariantAction,
} from "@/lib/server/actions/admin/variants/variantsActions";

export interface VariantFormData {
  productId: string;
  cpu: string;
  ram: string;
  storage: string;
  color?: string;
  price: number;
  stock: number;
  reservedStock: number;
  discountPercent: number;
  offerStartDate?: string;
  offerEndDate?: string;
  isActive: boolean;
}

interface VariantFormProps {
  products: productType[];
  variant?: ProductVariantType;
}

export function VariantForm({ products, variant }: VariantFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [images, setImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [buttonState, setButtonState] = useState<"idle" | "loading" | "success">("idle");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const { register, handleSubmit, control, reset, setValue, watch } =
    useForm<VariantFormData>({
      defaultValues: {
        productId: variant?.productId ?? "",
        cpu: variant?.specs.cpu ?? "",
        ram: variant?.specs.ram ?? "",
        storage: variant?.specs.storage ?? "",
        color: variant?.specs.color ?? "",
        price: variant?.price ?? 0,
        stock: variant?.stock ?? 0,
        reservedStock: variant?.reservedStock ?? 0,
        discountPercent: variant?.discountPercent ?? 0,
        offerStartDate: variant?.offerStartDate
          ? new Date(variant.offerStartDate).toISOString().substring(0, 10)
          : undefined,
        offerEndDate: variant?.offerEndDate
          ? new Date(variant.offerEndDate).toISOString().substring(0, 10)
          : undefined,
        isActive: variant?.isActive ?? true,
      },
    });

  const watchedPrice = watch("price");
  const watchedDiscount = watch("discountPercent");
  const watchedProductId = watch("productId");

  const offeredPrice = watchedDiscount > 0 && watchedPrice > 0
    ? watchedPrice - (watchedPrice * watchedDiscount / 100)
    : null;

  useEffect(() => {
    if (variant?.images?.length) {
      setImagePreview(variant.images);
    }
  }, [variant]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleImageSelect = (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    setImages(prev => [...prev, ...fileArray]);
    setImagePreview(prev => [
      ...prev,
      ...fileArray.map(f => URL.createObjectURL(f)),
    ]);
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

  const onSubmit = async (data: VariantFormData) => {
    try {
      setButtonState("loading");

      const formData = new FormData();
      formData.append("productId", data.productId);
      formData.append("cpu", data.cpu);
      formData.append("ram", data.ram);
      formData.append("storage", data.storage);
      if (data.color) formData.append("color", data.color);
      formData.append("price", String(data.price));
      formData.append("stock", String(data.stock));
      formData.append("discountPercent", String(data.discountPercent));
      if (data.offerStartDate) formData.append("offerStartDate", data.offerStartDate);
      if (data.offerEndDate) formData.append("offerEndDate", data.offerEndDate);
      formData.append("isActive", String(data.isActive));
      images.forEach(img => formData.append("images", img));

      let res;
      if (variant) {
        formData.append("variantId", variant.id);
        res = await updateProductVariantAction(formData);
      } else {
        res = await createProductVariantAction(formData);
      }

      if (!res.success) {
        toast.error(res.message);
        setButtonState("idle");
        return;
      }

      toast.success(res.message);
      setButtonState("success");

      setTimeout(() => {
        reset();
        setImages([]);
        setImagePreview([]);

        router.push("/admin/variants");
        if (variant) {
          window.location.reload()
        }
      }, 600);

    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
      setButtonState("idle");
    }
  };

  const selectedProduct = products.find(p => p.id === watchedProductId);

  return (
  
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="relative bg-gradient-to-r from-red-600 via-red-700 to-red-800 px-8 py-10">
            <div className="absolute inset-0 bg-black opacity-5"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <Package className="w-8 h-8 text-white" />
                <h1 className="text-4xl font-bold text-white">
                  {variant ? "Edit Product Variant" : "Create New Variant"}
                </h1>
              </div>
              <p className="text-red-100 text-lg">
                Configure specifications, pricing, discounts, and promotional offers
              </p>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          </div>

          <div className="p-10 space-y-10">
         <div className="space-y-6 bg-gradient-to-br from-rose-50 to-red-50 p-8 rounded-2xl border border-rose-200">
  {/* Section Header */}
  <div className="flex items-center gap-3 pb-4 border-b-2 border-rose-300">
    <Package className="w-6 h-6 text-red-600" />
    <h3 className="text-2xl font-bold text-gray-800">
      Product Selection
    </h3>
  </div>

  {/* Product Select */}
  <div className="space-y-3">
    <Label
      htmlFor="productId"
      className="text-sm font-semibold text-gray-700 flex items-center gap-2"
    >
      Select Product <span className="text-red-500">*</span>
    </Label>

    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !variant && setIsDropdownOpen(!isDropdownOpen)}
        disabled={!!variant}
        className={`w-full h-14 rounded-xl px-5 text-left flex items-center justify-between transition-all border-2 ${
          isDropdownOpen
            ? "border-red-500 ring-4 ring-red-100"
            : "border-rose-300 hover:border-red-400"
        } ${
          variant
            ? "bg-gray-100 cursor-not-allowed"
            : "bg-white cursor-pointer"
        }`}
      >
        <span
          className={`truncate ${
            selectedProduct
              ? "text-gray-900 font-medium"
              : "text-gray-400"
          }`}
        >
          {selectedProduct ? selectedProduct.name : "Select a product"}
        </span>

        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isDropdownOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isDropdownOpen && !variant && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-rose-200 rounded-xl shadow-2xl overflow-hidden">
          <div className="max-h-80 overflow-y-auto">
            {products.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-500">
                No products available
              </div>
            ) : (
              products.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => {
                    setValue("productId", product.id);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full px-5 py-4 text-left transition-colors border-b border-gray-100 last:border-b-0 hover:bg-red-50 ${
                    watchedProductId === product.id
                      ? "bg-red-50 font-semibold text-red-700"
                      : "text-gray-700"
                  }`}
                >
                  {product.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>

    <input
      type="hidden"
      {...register("productId", { required: true })}
    />
  </div>
</div>


            <div className="space-y-6 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-200">
              <div className="flex items-center gap-3 pb-4 border-b-2 border-blue-300">
                <Cpu className="w-6 h-6 text-blue-600" />
                <h3 className="text-2xl font-bold text-gray-800">Technical Specifications</h3>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">CPU  <span className="text-red-500">*</span></Label>
                  <Input
                    {...register("cpu", { required: true })}
                    placeholder="Intel i7-12700H"
                    className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">RAM  <span className="text-red-500">*</span></Label>
                  <Input
                    {...register("ram", { required: true })}
                    placeholder="16GB DDR5"
                    className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">Storage  <span className="text-red-500">*</span></Label>
                  <Input
                    {...register("storage", { required: true })}
                    placeholder="512GB NVMe SSD"
                    className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">Color</Label>
                  <Input
                    {...register("color")}
                    placeholder="Space Gray"
                    className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6 bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-2xl border border-emerald-200">
              <div className="flex items-center gap-3 pb-4 border-b-2 border-emerald-300">
                <DollarSign className="w-6 h-6 text-emerald-600" />
                <h3 className="text-2xl font-bold text-gray-800">Pricing & Inventory</h3>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">Base Price (NPR)  <span className="text-red-500">*</span></Label>
                  <Input
                    type="number"
                    {...register("price", { required: true, valueAsNumber: true })}
                    placeholder="125000"
                    className="h-12 border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-xl text-lg font-semibold"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">Stock Quantity <span className="text-red-500">*</span></Label>
                  <Input
                    type="number"
                    {...register("stock", { required: true, valueAsNumber: true })}
                    placeholder="50"
                    className="h-12 border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">Discount (%)</Label>
                  <Input
                    type="number"
                    {...register("discountPercent", { valueAsNumber: true })}
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
                      <p className="text-black text-sm">Client Saves</p>
                      <p className="text-black text-xl font-bold">
                        NPR {(watchedPrice - offeredPrice).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {watchedDiscount > 0 && (
                <div className="space-y-4 bg-white p-6 rounded-xl border-2 border-dashed border-emerald-300">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                    <Label className="text-lg font-semibold text-gray-800">Promotional Period</Label>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-3 block">Start Date Options</Label>
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
                    <Label className="text-sm font-semibold text-gray-700 mb-3 block">Duration from Start</Label>
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
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">Offer Start Date</Label>
                      <Input
                        type="date"
                        {...register("offerStartDate")}
                        className="h-12 border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">Offer End Date</Label>
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
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={e => handleImageSelect(e.target.files)}
                />
              </div>

              {imagePreview.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {imagePreview.map((src, i) => (
                    <div key={i} className="relative aspect-square group">
                      <Image
                        src={src}
                        alt=""
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

            <div className="flex justify-between items-center bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-2xl border-2 border-amber-200">
              <div>
                <p className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-amber-600" />
                  Variant Status
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Enable to make this variant visible to customers
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

            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                onClick={() => {
                  router.push("/admin/variants");

                  if (variant) {
                    setTimeout(() => {
                      window.location.reload();
                    }, 100);
                  }
                }}
                className="flex-1 h-14 text-lg font-semibold bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-all"
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={buttonState === "loading"}
                className="flex-1 h-14 text-lg font-semibold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {buttonState === "idle" && (
                  <span className="flex items-center justify-center gap-2">
                    {variant ? "Update Variant" : "Create Variant"}
                  </span>
                )}
                {buttonState === "loading" && <Loader2 className="animate-spin w-6 h-6" />}
                {buttonState === "success" && <Check className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
  
  );
}