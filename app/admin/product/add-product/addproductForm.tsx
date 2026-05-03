"use client";

import { useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import Image from "@/components/ui/optimized-image";
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
  ListChecks,
} from "lucide-react";

import { Input } from "@/components/ui/input";
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
import { ProductHighlight, VariantType } from "@/types/product";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { MAX_PRODUCT_HIGHLIGHTS, sanitizeProductHighlights } from "@/lib/helpers/productHighlights";

// ─── Shared utility ───────────────────────────────────────────────────────────
// Use this wherever you render product.description on the frontend too
export function sanitizeDescription(html: string) {
  return html
    .replace(/color:\s*lab\([^)]+\)/g, "color: #1e293b")
    .replace(/color:\s*oklch\([^)]+\)/g, "color: #1e293b")
    .replace(/color:\s*color\([^)]+\)/g, "color: #1e293b");
}

function parseBulkTags(value: string) {
  return value
    .split(/[\s,]+/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function normalizeAdminLabel(value: string) {
  return value.trim().toUpperCase();
}

// ─── Types ────────────────────────────────────────────────────────────────────
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
  highlights?: ProductHighlight[] | null;
  category: {
    id: string;
    categoryName: string;
  };
  images?: string[] | null;
  variants?: VariantType[] | null;
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
  variants: VariantType[];
  tags: string[];
  brandName: string;
  discountPercent: number;
  offerStartDate: string;
  offerEndDate: string;
  isActive: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
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
  const [highlights, setHighlights] = useState<ProductHighlight[]>(
    sanitizeProductHighlights(editProduct?.highlights)
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
    const start = startOption === "today"
      ? today
      : new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const end = new Date(start.getTime() + daysFromStart * 24 * 60 * 60 * 1000);
    setValue("offerStartDate", start.toISOString().substring(0, 10));
    setValue("offerEndDate", end.toISOString().substring(0, 10));
  };

  const handleImageSelect = (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    setImages(prev => [...prev, ...fileArray]);
    setImagePreview(prev => [...prev, ...fileArray.map(f => URL.createObjectURL(f))]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragEnter = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDragOver  = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (e.dataTransfer.files?.length) handleImageSelect(e.dataTransfer.files);
  };

  const addTag = () => {
    const incomingTags = parseBulkTags(tagInput);
    if (incomingTags.length === 0) return;

    setTagsList((current) => {
      const existing = new Set(current.map((tag) => tag.toLowerCase()));
      const next = [...current];

      incomingTags.forEach((tag) => {
        const normalized = tag.toLowerCase();
        if (!existing.has(normalized)) {
          existing.add(normalized);
          next.push(tag);
        }
      });

      return next;
    });

    setTagInput("");
  };

  const updateHighlight = (
    index: number,
    field: keyof ProductHighlight,
    value: string
  ) => {
    setHighlights((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  };

  const addHighlight = () => {
    setHighlights((current) =>
      current.length >= MAX_PRODUCT_HIGHLIGHTS
        ? current
        : [...current, { label: "", specs: "" }]
    );
  };

  const removeHighlight = (index: number) => {
    setHighlights((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      setButtonState("loading");

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("price", String(data.price));
      formData.append("stock", String(data.stock));
      // Sanitize description before saving — removes unsupported LAB/oklch colors
      formData.append("description", sanitizeDescription(data.description || ""));
      formData.append("highlights", JSON.stringify(sanitizeProductHighlights(highlights)));
      formData.append("category", data.category);
      formData.append("tags", JSON.stringify(tagsList.map(t => ({ name: t }))));
      formData.append("brandName", normalizeAdminLabel(data.brandName || ""));
      formData.append("discountPercent", String(data.discountPercent));
      formData.append("offerStartDate", data.offerStartDate || "");
      formData.append("offerEndDate", data.offerEndDate || "");
      formData.append("isActive", data.isActive ? "true" : "false");
      images.forEach(img => formData.append("images", img));

      const res = editProduct
        ? await updateProductAction({ productId: editProduct.id, formData })
        : await createProductAction(formData);

      if (!res.success) {
        toast.error(res.message);
        setButtonState("idle");
        return;
      }

      toast.success(res.message);
      setButtonState("success");

      if (editProduct) {
        window.location.reload();
      } else {
        router.push("/admin/product");
      }

      setTimeout(() => {
        if (!editProduct) {
          reset();
          setImages([]);
          setImagePreview([]);
          setTagsList([]);
          setHighlights([]);
        }
        setButtonState("idle");
      }, 1200);

    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
      setButtonState("idle");
    }
  };

  const offeredPrice = watchDiscount > 0 && watchPrice > 0 ? calculateOfferedPrice() : null;

  return (
    <div className="bg-white overflow-auto rounded-2xl w-full mx-auto shadow-2xl border border-red-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6 rounded-t-2xl">
        <h2 className="text-3xl font-bold text-white">
          {editProduct ? "Edit Product" : "Add New Product"}
        </h2>
        <p className="text-red-100 mt-1">
          {editProduct ? "Update product information" : "Fill in the details to create a new product"}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">

        {/* ── Basic Information ── */}
        <div className="space-y-6 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-200">
          <div className="flex items-center gap-3 pb-4 border-b-2 border-blue-300">
            <Package className="w-6 h-6 text-blue-600" />
            <h3 className="text-2xl font-bold text-gray-800">Basic Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Product Name <span className="text-red-500">*</span></label>
              <Input 
                {...register("name", { required: true })} 
                placeholder="Enter product name"
                className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Brand Name <span className="text-red-500">*</span></label>
              <Input 
                {...register("brandName", {
                  onChange: (event) => {
                    event.target.value = normalizeAdminLabel(event.target.value);
                  },
                })} 
                placeholder="Enter brand name"
                className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Category <span className="text-red-500">*</span></label>
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
                      <SelectItem key={cat.id} value={cat.id}>{cat.categoryName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Description</label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value || ""}
                  onChange={(html) => field.onChange(sanitizeDescription(html))}
                />
              )}
            />
          </div>
        </div>

        {/* Product Highlights */}
        <div className="space-y-6 bg-gradient-to-br from-rose-50 via-white to-slate-50 p-8 rounded-2xl border border-rose-200">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-rose-200">
            <div className="flex items-center gap-3">
              <ListChecks className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Product Highlights</h3>
                <p className="text-sm text-gray-500">Add up to 6 quick specifications for the product page.</p>
              </div>
            </div>
            <Button
              type="button"
              onClick={addHighlight}
              disabled={highlights.length >= MAX_PRODUCT_HIGHLIGHTS}
              className="h-11 bg-red-600 hover:bg-red-700 text-white rounded-xl disabled:opacity-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Highlight
            </Button>
          </div>

          <div className="space-y-3">
            {highlights.length === 0 && (
              <div className="rounded-xl border-2 border-dashed border-rose-200 bg-white p-5 text-sm text-gray-500">
                No highlights added yet.
              </div>
            )}

            {highlights.map((highlight, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr_auto] gap-3 rounded-xl border border-rose-100 bg-white p-4 shadow-sm"
              >
                <Input
                  value={highlight.label}
                  onChange={(event) => updateHighlight(index, "label", event.target.value)}
                  placeholder="Label e.g. Memory"
                  className="h-12 border-2 border-rose-100 focus:border-red-500 focus:ring-4 focus:ring-red-100 rounded-xl"
                />
                <Input
                  value={highlight.specs}
                  onChange={(event) => updateHighlight(index, "specs", event.target.value)}
                  placeholder="Specs e.g. 16GB DDR4 RAM"
                  className="h-12 border-2 border-rose-100 focus:border-red-500 focus:ring-4 focus:ring-red-100 rounded-xl"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => removeHighlight(index)}
                  className="h-12 rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                  aria-label={`Remove highlight ${index + 1}`}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}

            <p className="text-xs text-gray-500">
              Empty rows and incomplete rows are removed automatically before saving.
            </p>
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="space-y-6 bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-2xl border border-emerald-200">
          <div className="flex items-center gap-3 pb-4 border-b-2 border-emerald-300">
            <DollarSign className="w-6 h-6 text-emerald-600" />
            <h3 className="text-2xl font-bold text-gray-800">Pricing & Inventory</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Base Price (NPR) <span className="text-red-500">*</span></label>
              <Input 
                type="number" 
                {...register("price", { required: true })}
                placeholder="125000"
                className="h-12 border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-xl text-lg font-semibold"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Stock Quantity <span className="text-red-500">*</span></label>
              <Input 
                type="number" 
                {...register("stock")}
                placeholder="50"
                onWheel={(event) => event.currentTarget.blur()}
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
                onWheel={(event) => event.currentTarget.blur()}
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
                  <p className="text-black text-xl font-bold">NPR {(watchPrice - offeredPrice).toLocaleString()}</p>
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
                  {[
                    { label: "Today",    fn: () => setOfferDates("today", 0) },
                    { label: "Tomorrow", fn: () => setOfferDates("tomorrow", 0) },
                  ].map(({ label, fn }) => (
                    <Button key={label} type="button" variant="outline" size="sm" onClick={fn}
                      className="border-2 border-emerald-300 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all">
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 block">Duration from Start</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "1 Day",    days: 1   },
                    { label: "5 Days",   days: 5   },
                    { label: "1 Week",   days: 7   },
                    { label: "2 Weeks",  days: 14  },
                    { label: "1 Month",  days: 30  },
                    { label: "2 Months", days: 60  },
                    { label: "3 Months", days: 90  },
                    { label: "6 Months", days: 180 },
                    { label: "1 Year",   days: 365 },
                  ].map(({ label, days }) => (
                    <Button key={label} type="button" variant="outline" size="sm"
                      onClick={() => setOfferDates("today", days)}
                      className="border-2 border-purple-300 hover:bg-purple-500 hover:text-white hover:border-purple-500 transition-all">
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Offer Start Date</label>
                  <Input type="date" {...register("offerStartDate")}
                    className="h-12 border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-xl" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Offer End Date</label>
                  <Input type="date" {...register("offerEndDate")}
                    className="h-12 border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-xl" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Tags ── */}
        <div className="space-y-6 bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-2xl border border-amber-200">
          <div className="flex items-center gap-3 pb-4 border-b-2 border-amber-300">
            <Tag className="w-6 h-6 text-amber-600" />
            <h3 className="text-2xl font-bold text-gray-800">Tags</h3>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2 flex-wrap min-h-[60px] p-4 bg-white rounded-xl border-2 border-amber-200">
              {tagsList.map((tag, i) => (
                <span key={i} className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
                  {tag}
                  <X className="w-4 h-4 cursor-pointer hover:text-amber-900 transition-colors" 
                    onClick={() => setTagsList(tagsList.filter((_, idx) => idx !== i))} />
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                placeholder="Type one or many tags, separated by spaces"
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                className="h-12 border-2 border-amber-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 rounded-xl"
              />
              <Button type="button" onClick={addTag}
                className="h-12 px-6 bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-all shadow-md hover:shadow-lg">
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* ── Images ── */}
        <div className="space-y-6 bg-gradient-to-br from-violet-50 to-purple-50 p-8 rounded-2xl border border-violet-200">
          <div className="flex items-center gap-3 pb-4 border-b-2 border-violet-300">
            <ImageIcon className="w-6 h-6 text-violet-600" />
            <h3 className="text-2xl font-bold text-gray-800">Product Images</h3>
          </div>

          <div
            className={`border-4 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all group ${
              isDragging ? "border-violet-600 bg-violet-200 scale-105" : "border-violet-300 hover:border-violet-500 hover:bg-violet-100"
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className={`w-16 h-16 mx-auto mb-4 transition-colors ${
              isDragging ? "text-violet-600 animate-bounce" : "text-violet-400 group-hover:text-violet-600"
            }`} />
            <p className="text-xl font-semibold text-gray-700 mb-2">
              {isDragging ? "Drop images here!" : "Click to upload or drag & drop"}
            </p>
            <p className="text-sm text-gray-500">PNG, JPG up to 5MB each</p>
            <input type="file" accept="image/*" multiple className="hidden"
              ref={fileInputRef} onChange={e => handleImageSelect(e.target.files)} />
          </div>

          {imagePreview.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {imagePreview.map((src, i) => (
                <div key={i} className="relative aspect-square group">
                  <Image src={src} alt={`preview ${i}`} fill
                    className="object-cover rounded-xl border-2 border-violet-200 group-hover:border-violet-500 transition-all" />
                  <button type="button" onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg transition-all hover:scale-110">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Status ── */}
        <div className="flex justify-between items-center bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-2xl border-2 border-amber-200">
          <div>
            <p className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-600" />
              Product Status
            </p>
            <p className="text-sm text-gray-600 mt-1">Enable to make this product visible to customers</p>
          </div>
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange}
                className="data-[state=checked]:bg-green-600" />
            )}
          />
        </div>

        {/* ── Submit ── */}
        <div className="flex gap-4 pt-6">
          <Button type="button"
            onClick={() => editProduct ? window.location.reload() : router.push("/admin/product")}
            className="flex-1 h-14 text-lg font-semibold bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-all">
            Cancel
          </Button>
          <Button type="submit"
            className="flex-1 h-14 text-lg font-semibold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
            disabled={buttonState === "loading"}>
            {buttonState === "idle"    && (editProduct ? "Update Product" : "Create Product")}
            {buttonState === "loading" && <Loader2 className="animate-spin w-6 h-6" />}
            {buttonState === "success" && <Check className="w-6 h-6" />}
          </Button>
        </div>

      </form>
    </div>
  );
}
