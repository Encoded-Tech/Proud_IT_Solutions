// "use client";

import { fetchCategories } from "@/lib/server/fetchers/fetchCategory";
import { AddProductForm } from "./addproductForm";
import { ArrowLeft } from "lucide-react";

import Link from "next/link";


// import { useState, useRef } from "react";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import useSWR from "swr";
// import Image from "next/image";
// import { toast } from "sonner";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Switch } from "@/components/ui/switch";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Check, Loader2 } from "lucide-react";

// export interface Category {
//   _id: string;
//   categoryName: string;
// }

// // ---------------- ZOD SCHEMA ----------------
// const productSchema = z.object({
//   name: z.string().min(1, "Product name is required"),
//   price: z.string().min(1, "Price is required"),
//   description: z.string().optional(),
//   category: z.string().min(1, "Category is required"),
//   images: z
//     .any()
//     .refine((files) => files?.length > 0, "At least one image is required"),
//   variants: z.string().optional(),
//   isActive: z.boolean().optional(),
// });

// // ---------------- SWR FETCHER ----------------
// const fetcher = (url: string) => fetch(url).then((res) => res.json());

// export default function AddProduct() {
//   const [imagePreview, setImagePreview] = useState<string[]>([]);
//   const [buttonState, setButtonState] = useState<
//     "idle" | "loading" | "success"
//   >("idle");

//   const { data } = useSWR("/api/category", fetcher);
//   const categories: Category[] = data?.data || [];

//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const form = useForm<z.infer<typeof productSchema>>({
//     resolver: zodResolver(productSchema),
//     defaultValues: {
//       name: "",
//       price: "",
//       description: "",
//       category: "",
//       images: [],
//       variants: "",
//       isActive: true,
//     },
//   });

//   const onSubmit = async (values: z.infer<typeof productSchema>) => {
//     try {
//       setButtonState("loading");

//       const formData = new FormData();
//       formData.append("name", values.name);
//       formData.append("price", values.price);
//       if (values.description) formData.append("description", values.description);
//       formData.append("category", values.category);
//       values.images.forEach((file: File) => formData.append("images", file));
//       if (values.variants) formData.append("variants", values.variants);
//       formData.append("isActive", values.isActive ? "true" : "false");

//       const res = await fetch("/api/product", { method: "POST", body: formData });
//       const result = await res.json();

//       if (!res.ok || !result.success) {
//         const errorMessage =
        
//           result.message || // in case backend sends raw messages
//           result.error || // from `errorHandler`
//           "Failed to create product";
  
      
  
//         toast.error(errorMessage );
//         setButtonState("idle");
//         return;
//       }
//       toast.success(result.message);
//       setButtonState("success");

//       // Reset form after short delay
//       setTimeout(() => {
//         form.reset({
//           name: "",
//           price: "",
//           description: "",
//           category: "",
//           images: [],
//           variants: "",
//           isActive: true,
//         });
//         setImagePreview([]);
//         if (fileInputRef.current) fileInputRef.current.value = "";
//         setButtonState("idle");
//       }, 1200);
//     } catch (error) {
//       console.error(error);
//       toast.error("Something went wrong!");
//       setButtonState("idle");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex justify-center items-start py-10 px-4">
//       <div className="w-full max-w-5xl bg-white p-8 rounded-xl shadow-md border">
//         <h1 className="text-3xl font-bold mb-6 text-gray-800">
//           Add New Product
//         </h1>

//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//             {/* NAME */}
//             <FormField
//               control={form.control}
//               name="name"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Product Name</FormLabel>
//                   <FormControl>
//                     <Input placeholder="Enter product name" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* PRICE */}
//             <FormField
//               control={form.control}
//               name="price"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Price</FormLabel>
//                   <FormControl>
//                     <Input type="number" placeholder="Enter price" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* DESCRIPTION */}
//             <FormField
//               control={form.control}
//               name="description"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Description</FormLabel>
//                   <FormControl>
//                     <Textarea placeholder="Enter product description" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* CATEGORY */}
//             <FormField
//               control={form.control}
//               name="category"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Category</FormLabel>
//                   <Select onValueChange={field.onChange} value={field.value || ""}>
//                     <FormControl>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select a category" />
//                       </SelectTrigger>
//                     </FormControl>
//                     <SelectContent>
//                       {categories.map((cat) => (
//                         <SelectItem key={cat._id} value={cat._id}>
//                           {cat.categoryName}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* IMAGES */}
//             <FormField
//               control={form.control}
//               name="images"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Product Images</FormLabel>
//                   <FormControl>
//                     <Input
//                       type="file"
//                       accept="image/*"
//                       multiple
//                       ref={fileInputRef}
//                       onChange={(e) => {
//                         const files = Array.from(e.target.files || []);
//                         field.onChange(files);
//                         setImagePreview(files.map((f) => URL.createObjectURL(f)));
//                       }}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                   {imagePreview.length > 0 && (
//                     <div className="mt-3 flex gap-3 flex-wrap">
//                       {imagePreview.map((src, i) => (
//                         <Image
//                           key={i}
//                           src={src}
//                           alt={`preview ${i}`}
//                           width={100}
//                           height={100}
//                           className="rounded-md border object-cover"
//                         />
//                       ))}
//                     </div>
//                   )}
//                 </FormItem>
//               )}
//             />

//             {/* VARIANTS */}
//             <FormField
//               control={form.control}
//               name="variants"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Variants (JSON array of IDs)</FormLabel>
//                   <FormControl>
//                     <Input placeholder='e.g. ["id1","id2"]' {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* ACTIVE */}
//             <FormField
//               control={form.control}
//               name="isActive"
//               render={({ field }) => (
//                 <FormItem className="flex flex-row items-center justify-between">
//                   <FormLabel>Active</FormLabel>
//                   <FormControl>
//                     <Switch checked={field.value} onCheckedChange={field.onChange} />
//                   </FormControl>
//                 </FormItem>
//               )}
//             />

//             {/* SUBMIT BUTTON */}
//             <Button
//   type="submit"
//   className={`w-full h-11 text-lg transition-all flex items-center justify-center gap-2`}
//   disabled={buttonState === 'loading'}
// >
//   {buttonState === 'idle' && 'Add Product'}

//   {buttonState === 'loading' && (
//     <Loader2 className="w-5 h-5 animate-spin" />
//   )}

//   {buttonState === 'success' && (
//     <div className="flex items-center gap-2">
//       <Check className="w-5 h-5 text-green-500" />
//       Success
//     </div>
//   )}
// </Button>
//           </form>
//         </Form>
//       </div>
//     </div>
//   );
// }


export default async function AddProductPage() {

  const res = await fetchCategories();
  const categories = res.data || [];



  return (
     <div className=" bg-gray-50 py-10 px-4">
       <div className="max-w-6xl mx-auto mb-4">
      <Link href="/admin/products">
      <button
         
          className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Products</span>
        </button></Link>
      </div>
      <AddProductForm categories={categories} />
    </div>

  )
}