// "use client";

// import { useState, useRef } from "react";
// import { useForm, Controller } from "react-hook-form";
// import { toast } from "sonner";
// import Image from "next/image";

// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";
// import { Switch } from "@/components/ui/switch";
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "@/components/ui/select";
// import { Loader2, Check, Plus, X } from "lucide-react";

// import { createProductAction } from "@/lib/server/actions/admin/product/productActions";
// import { CategoryType } from "@/types/product";

// interface AddProductFormProps {
//   categories: CategoryType[];
// }

// interface AddProductFormData {
//   name: string;
//   price: number;
//   stock: number;
//   description?: string;
//   category: string;
//   images: File[];
//   variants: string[];
//   tags: string[];
//   brandName: string;
//   discountPercent: number;
//   offerStartDate: string;
//   offerEndDate: string;
//   isActive: boolean;
// }

// // Offer durations
// const OFFER_END_OPTIONS = [
//   { label: "5 days", value: 5 },
//   { label: "7 days", value: 7 },
//   { label: "2 weeks", value: 14 },
//   { label: "4 weeks", value: 28 },
//   { label: "2 months", value: 60 },
// ];

// export default function AddProductForm({ categories }: AddProductFormProps) {
//   const [images, setImages] = useState<File[]>([]);
//   const [imagePreview, setImagePreview] = useState<string[]>([]);
//   const [buttonState, setButtonState] = useState<"idle" | "loading" | "success">("idle");

//   const [tagsList, setTagsList] = useState<string[]>([]);
//   const [variantsList, setVariantsList] = useState<string[]>([]);

//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const { register, handleSubmit, watch, setValue, control, reset } =
//     useForm<AddProductFormData>({
//       defaultValues: {
//         name: "",
//         price: 0,
//         stock: 0,
//         description: "",
//         category: "",
//         images: [],
//         variants: [],
//         tags: [],
//         brandName: "",
//         discountPercent: 0,
//         offerStartDate: "",
//         offerEndDate: "",
//         isActive: true,
//       },
//     });

//   const watchDiscount = watch("discountPercent");
//   const watchPrice = watch("price");
//   const watchOfferStart = watch("offerStartDate");

//   const calculateOfferedPrice = () => {
//     if (watchDiscount && watchPrice) {
//       return Math.round(Number(watchPrice) - (Number(watchPrice) * Number(watchDiscount)) / 100);
//     }
//     return 0;
//   };

//   const handleDropImages = (files: File[]) => {
//     setImages(files);
//     setImagePreview(files.map((f) => URL.createObjectURL(f)));
//   };

//   const onSubmit = async (data: AddProductFormData) => {
//     try {
//       setButtonState("loading");

//       const formData = new FormData();
//       formData.append("name", data.name);
//       formData.append("price", String(data.price));
//       formData.append("stock", String(data.stock));
//       formData.append("description", data.description || "");
//       formData.append("category", data.category);
//       formData.append("variants", JSON.stringify(variantsList));
//       formData.append("tags", JSON.stringify(tagsList.map((t) => ({ name: t }))));
//       formData.append("brandName", data.brandName || "");
//       formData.append("discountPercent", String(data.discountPercent));
//       formData.append("offerStartDate", data.offerStartDate || "");
//       formData.append("offerEndDate", data.offerEndDate || "");
//       formData.append("isActive", data.isActive ? "true" : "false");

//       images.forEach((img) => formData.append("images", img));

//       const res= await createProductAction(formData);

//       if (!res.success) {
//         toast.error(res.message);
//         setButtonState("idle");
//         return;
//       }

//       toast.success(res.message);
//       setButtonState("success");

//       setTimeout(() => {
//         reset();
//         setImages([]);
//         setImagePreview([]);
//         setTagsList([]);
//         setVariantsList([]);
//         setButtonState("idle");
//       }, 1200);
//     } catch (err) {
//       console.error(err);
//       toast.error("Something went wrong!");
//       setButtonState("idle");
//     }
//   };

//   return (
//     <div className="bg-white p-8 rounded-xl shadow-lg border w-full max-w-6xl mx-auto">
//       <h1 className="text-3xl font-bold mb-6">Add New Product</h1>

//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//         {/* Product Name */}
//         <div>
//           <label className="font-medium">Product Name</label>
//           <Input {...register("name", { required: true })} placeholder="Product Name" />
//         </div>

//         {/* Price */}
//         <div>
//           <label className="font-medium">Price</label>
//           <Input type="number" {...register("price", { required: true })} />
//         </div>

//         {/* Discount */}
//         <div>
//           <label className="font-medium">Discount %</label>
//           <Input type="number" {...register("discountPercent")} placeholder="0" />
//           {watchDiscount && watchPrice && (
//             <p className="text-sm text-green-600 mt-1">
//               Offered Price: Rs. {calculateOfferedPrice()}
//             </p>
//           )}
//         </div>

//         {/* Stock */}
//         <div>
//           <label className="font-medium">Stock</label>
//           <Input type="number" {...register("stock")} />
//         </div>

//         {/* Category */}
//         <div>
//           <label className="font-medium">Category</label>
//           <Controller
//             name="category"
//             control={control}
//             render={({ field }) => (
//               <Select onValueChange={field.onChange} value={field.value || ""}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select a category" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {categories.map((cat) => (
//                     <SelectItem key={cat.id} value={cat.id}>
//                       {cat.categoryName}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             )}
//           />
//         </div>

//         {/* Brand */}
//         <div>
//           <label className="font-medium">Brand</label>
//           <Input {...register("brandName")} placeholder="Brand Name" />
//         </div>

//         {/* Tags */}
//         <div>
//           <label className="font-medium">Tags</label>
//           <div className="flex gap-2 flex-wrap mb-2">
//             {tagsList.map((tag, i) => (
//               <span
//                 key={i}
//                 className="bg-gray-200 px-3 py-1 rounded-full flex items-center gap-1"
//               >
//                 {tag}
//                 <X className="w-3 h-3 cursor-pointer" onClick={() => setTagsList(tagsList.filter((_, idx) => idx !== i))} />
//               </span>
//             ))}
//           </div>
//           <div className="flex gap-2">
//             <Input
//               placeholder="Add tag"
//               onKeyDown={(e) => {
//                 if (e.key === "Enter") {
//                   e.preventDefault();
//                   const val = (e.target as HTMLInputElement).value.trim();
//                   if (val && !tagsList.includes(val)) {
//                     setTagsList([...tagsList, val]);
//                     (e.target as HTMLInputElement).value = "";
//                   }
//                 }
//               }}
//             />
//             <Button type="button" onClick={() => {
//               const input = document.querySelector<HTMLInputElement>('input[placeholder="Add tag"]');
//               if(input?.value) {
//                 const val = input.value.trim();
//                 if(val && !tagsList.includes(val)) {
//                   setTagsList([...tagsList, val]);
//                   input.value = "";
//                 }
//               }
//             }}>
//               <Plus />
//             </Button>
//           </div>
//         </div>

//         {/* Variants */}
//         <div>
//           <label className="font-medium">Variants</label>
//           <div className="flex gap-2 flex-wrap mb-2">
//             {variantsList.map((v, i) => (
//               <span key={i} className="bg-gray-200 px-3 py-1 rounded-full flex items-center gap-1">
//                 {v}
//                 <X className="w-3 h-3 cursor-pointer" onClick={() => setVariantsList(variantsList.filter((_, idx) => idx !== i))} />
//               </span>
//             ))}
//           </div>
//           <div className="flex gap-2">
//             <Input
//               placeholder="Add variant"
//               onKeyDown={(e) => {
//                 if (e.key === "Enter") {
//                   e.preventDefault();
//                   const val = (e.target as HTMLInputElement).value.trim();
//                   if (val && !variantsList.includes(val)) {
//                     setVariantsList([...variantsList, val]);
//                     (e.target as HTMLInputElement).value = "";
//                   }
//                 }
//               }}
//             />
//             <Button type="button" onClick={() => {
//               const input = document.querySelector<HTMLInputElement>('input[placeholder="Add variant"]');
//               if(input?.value) {
//                 const val = input.value.trim();
//                 if(val && !variantsList.includes(val)) {
//                   setVariantsList([...variantsList, val]);
//                   input.value = "";
//                 }
//               }
//             }}>
//               <Plus />
//             </Button>
//           </div>
//         </div>

//         {/* Description */}
//         <div>
//           <label className="font-medium">Description</label>
//           <Textarea {...register("description")} placeholder="Product Description" />
//         </div>

//         {/* Images */}
//         <div>
//           <label className="font-medium">Product Images</label>
//           <div
//             className="border-dashed border-2 border-gray-300 p-4 rounded-lg cursor-pointer text-center"
//             onClick={() => fileInputRef.current?.click()}
//           >
//             <p>Click or drag images here</p>
//             <input
//               type="file"
//               accept="image/*"
//               multiple
//               className="hidden"
//               ref={fileInputRef}
//               onChange={(e) => {
//                 const files = Array.from(e.target.files || []);
//                 handleDropImages(files);
//               }}
//             />
//           </div>
//           {imagePreview.length > 0 && (
//             <div className="mt-3 flex gap-3 flex-wrap">
//               {imagePreview.map((src, i) => (
//                 <Image key={i} src={src} alt={`preview ${i}`} width={100} height={100} className="rounded-md border object-cover" />
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Offer start/end */}
//         <div className="grid grid-cols-2 gap-4">
//           <div>
//             <label className="font-medium">Offer Start Date</label>
//             <Select onValueChange={(val) => setValue("offerStartDate", val)}>
//               <SelectTrigger>
//                 <SelectValue placeholder="Select start date" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value={new Date().toISOString().split("T")[0]}>Today</SelectItem>
//                 <SelectItem value={new Date(Date.now() + 86400000).toISOString().split("T")[0]}>Tomorrow</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//           <div>
//             <label className="font-medium">Offer End Duration</label>
//             <Select
//               onValueChange={(val) => {
//                 if (!watchOfferStart) return;
//                 const start = new Date(watchOfferStart);
//                 const end = new Date(start.getTime() + Number(val) * 24 * 60 * 60 * 1000);
//                 setValue("offerEndDate", end.toISOString());
//               }}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Select duration" />
//               </SelectTrigger>
//               <SelectContent>
//                 {OFFER_END_OPTIONS.map((opt) => (
//                   <SelectItem key={opt.value} value={opt.value.toString()}>
//                     {opt.label}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//         </div>

//         {/* Active */}
//         <div className="flex items-center justify-between">
//           <label className="font-medium">Active</label>
//           <Controller
//             name="isActive"
//             control={control}
//             render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
//           />
//         </div>

//         {/* Submit */}
//         <Button
//           type="submit"
//           className="w-full h-11 flex items-center justify-center gap-2"
//           disabled={buttonState === "loading"}
//         >
//           {buttonState === "idle" && "Add Product"}
//           {buttonState === "loading" && <Loader2 className="w-5 h-5 animate-spin" />}
//           {buttonState === "success" && (
//             <div className="flex items-center gap-2">
//               <Check className="w-5 h-5 text-green-500" /> Success
//             </div>
//           )}
//         </Button>
//       </form>
//     </div>
//   );
// }



"use client";

import { useState, useRef,  } from "react";
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
  Image as ImageIcon
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

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  description: string;
  category: {
    id: string;
    categoryName: string;
  };
  images: string[];
  variants: string[];
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


// Offer Duration Options
const OFFER_DURATIONS = [
  { label: "5 days", value: 5 },
  { label: "7 days", value: 7 },
  { label: "2 weeks", value: 14 },
  { label: "4 weeks", value: 28 },
  { label: "2 months", value: 60 },
];

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
  const [variantsList, setVariantsList] = useState<string[]>(editProduct?.variants || []);
  const [tagInput, setTagInput] = useState("");
  const [variantInput, setVariantInput] = useState("");

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
  const watchOfferStart = watch("offerStartDate");

  const calculateOfferedPrice = () => {
    if (watchDiscount && watchPrice) {
      return Math.round(Number(watchPrice) - (Number(watchPrice) * Number(watchDiscount)) / 100);
    }
    return 0;
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

  const addTag = () => {
    const val = tagInput.trim();
    if (val && !tagsList.includes(val)) {
      setTagsList([...tagsList, val]);
      setTagInput("");
    }
  };

  const addVariant = () => {
    const val = variantInput.trim();
    if (val && !variantsList.includes(val)) {
      setVariantsList([...variantsList, val]);
      setVariantInput("");
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
      formData.append("variants", JSON.stringify(variantsList));
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
    if(res.success) {
      toast.success(res.message);
      router.push("/admin/product");
    }
      setButtonState("success");
      setTimeout(() => {
     
        if (!editProduct) {
          reset();
          setImages([]);
          setImagePreview([]);
          setTagsList([]);
          setVariantsList([]);
        }
        setButtonState("idle");
      }, 1200);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
      setButtonState("idle");
    }
  };

  return (
    <div className="bg-white rounded-2xl max-w-6xl mx-auto shadow-2xl border border-red-100">
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
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-red-100">
            <Package className="w-6 h-6 text-red-600" />
            <h3 className="text-xl font-semibold text-gray-800">Basic Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Product Name *</label>
              <Input 
                {...register("name", { required: true })} 
                placeholder="Enter product name"
                className="border-gray-300 focus:border-red-500 focus:ring-red-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Brand Name *</label>
              <Input 
                {...register("brandName")} 
                placeholder="Enter brand name"
                className="border-gray-300 focus:border-red-500 focus:ring-red-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Category *</label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <SelectTrigger className="border-gray-300 focus:border-red-500 focus:ring-red-500">
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
              <label className="text-sm font-semibold text-gray-700">Stock Quantity *</label>
              <Input 
                type="number" 
                {...register("stock")}
                placeholder="0"
                className="border-gray-300 focus:border-red-500 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Description</label>
            <Textarea 
              {...register("description")} 
              placeholder="Enter product description"
              rows={4}
              className="border-gray-300 focus:border-red-500 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-red-100">
            <DollarSign className="w-6 h-6 text-red-600" />
            <h3 className="text-xl font-semibold text-gray-800">Pricing & Offers</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Price (NPR) *</label>
              <Input 
                type="number" 
                {...register("price", { required: true })}
                placeholder="0.00"
                className="border-gray-300 focus:border-red-500 focus:ring-red-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Discount %</label>
              <Input 
                type="number" 
                {...register("discountPercent")}
                placeholder="0"
                className="border-gray-300 focus:border-red-500 focus:ring-red-500"
              />
              {watchDiscount > 0 && watchPrice > 0 && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-semibold text-green-700">
                    Offered Price: NPR {calculateOfferedPrice().toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Save NPR {(Number(watchPrice) - calculateOfferedPrice()).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Offer Duration */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-red-100">
            <Calendar className="w-6 h-6 text-red-600" />
            <h3 className="text-xl font-semibold text-gray-800">Offer Period</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Start Date</label>
              <Select onValueChange={val => setValue("offerStartDate", val)}>
                <SelectTrigger className="border-gray-300 focus:border-red-500 focus:ring-red-500">
                  <SelectValue placeholder="Select start date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={new Date().toISOString().split("T")[0]}>Today</SelectItem>
                  <SelectItem value={new Date(Date.now() + 86400000).toISOString().split("T")[0]}>
                    Tomorrow
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Duration</label>
              <Select
                onValueChange={val => {
                  if (!watchOfferStart) return;
                  const start = new Date(watchOfferStart);
                  const end = new Date(start.getTime() + Number(val) * 24 * 60 * 60 * 1000);
                  setValue("offerEndDate", end.toISOString());
                }}
              >
                <SelectTrigger className="border-gray-300 focus:border-red-500 focus:ring-red-500">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {OFFER_DURATIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value.toString()}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Tags & Variants */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-red-100">
            <Tag className="w-6 h-6 text-red-600" />
            <h3 className="text-xl font-semibold text-gray-800">Tags & Variants</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700">Tags</label>
              <div className="flex gap-2 flex-wrap min-h-[40px] p-3 bg-gray-50 rounded-lg border border-gray-200">
                {tagsList.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {tag}
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-red-900" 
                      onClick={() => setTagsList(tagsList.filter((_, idx) => idx !== i))}
                    />
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  placeholder="Add tag"
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
                <Button 
                  type="button" 
                  onClick={addTag}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700">Variants</label>
              <div className="flex gap-2 flex-wrap min-h-[40px] p-3 bg-gray-50 rounded-lg border border-gray-200">
                {variantsList.map((v, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {v}
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-red-900" 
                      onClick={() => setVariantsList(variantsList.filter((_, idx) => idx !== i))}
                    />
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={variantInput}
                  onChange={e => setVariantInput(e.target.value)}
                  placeholder="Add variant"
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addVariant();
                    }
                  }}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
                <Button 
                  type="button" 
                  onClick={addVariant}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-red-100">
            <ImageIcon className="w-6 h-6 text-red-600" />
            <h3 className="text-xl font-semibold text-gray-800">Product Images</h3>
          </div>

          <div
            className="relative border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-red-500 hover:bg-red-50/50 transition-all"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Click to upload images</p>
            <p className="text-sm text-gray-400 mt-1">or drag and drop</p>
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
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {imagePreview.map((src, i) => (
                <div key={i} className="relative group">
                  <div className="relative w-full aspect-square rounded-lg border-2 border-gray-200 overflow-hidden">
                    <Image 
                      src={src} 
                      alt={`preview ${i}`} 
                      fill 
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center justify-between p-6 bg-gray-50 rounded-xl border border-gray-200">
          <div>
            <label className="text-sm font-semibold text-gray-700">Product Status</label>
            <p className="text-xs text-gray-500 mt-1">Enable or disable product visibility</p>
          </div>
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <Switch 
                checked={field.value} 
                onCheckedChange={field.onChange}
                className="data-[state=checked]:bg-red-600"
              />
            )}
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            type="button"
          
            className="flex-1 h-14 bg-gray-200 hover:bg-gray-300 text-gray-700 text-lg font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 h-14 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-lg font-semibold shadow-lg"
            disabled={buttonState === "loading"}
          >
            {buttonState === "idle" && (editProduct ? "Update Product" : "Create Product")}
            {buttonState === "loading" && (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </div>
            )}
            {buttonState === "success" && (
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                Success!
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}