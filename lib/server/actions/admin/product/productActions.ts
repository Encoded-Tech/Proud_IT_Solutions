// "use server";

// import { Types } from "mongoose";

// import { connectDB } from "@/db";
// import { Product } from "@/models/productModel";
// import { requireAdmin } from "@/lib/auth/requireSession";
// import { checkRequiredFields } from "@/lib/helpers/validateRequiredFields";
// import { deleteFromCloudinary, uploadToCloudinary } from "@/config/cloudinary";
// import { productType } from "@/types/product";
// import { mapProductToFrontend } from "@/lib/server/mappers/MapProductData";

// export interface CreateProductResult {
//   success: boolean;
//   message: string;
//   data?: productType;
// }



// export async function createProductAction(formData: FormData): Promise<CreateProductResult> {
//   const uploadedImages: string[] = [];
//   try {
//     /* -------------------------------------------------------------------------- */
//     /*                                AUTH & DB                                   */
//     /* -------------------------------------------------------------------------- */

//     await requireAdmin();
//     await connectDB();

//     /* -------------------------------------------------------------------------- */
//     /*                               BASIC FIELDS                                  */
//     /* -------------------------------------------------------------------------- */

//     const name = formData.get("name") as string;
//     const priceRaw = formData.get("price") as string;
//     const price = Number(priceRaw);

//     const stock = Number(formData.get("stock")) || 0;
//     const description = formData.get("description") as string;
//     const category = formData.get("category") as string;

//     const images = formData.getAll("images") as File[];



//     const isActive =
//       formData.get("isActive") === null
//         ? true
//         : formData.get("isActive") === "true";

//     /* -------------------------------------------------------------------------- */
//     /*                                   TAGS                                     */
//     /* -------------------------------------------------------------------------- */

//     const tagsRaw = formData.get("tags") as string | null;
//     const tags = tagsRaw
//       ? (JSON.parse(tagsRaw) as { id?: string; name: string }[]).map(tag => ({
//         id: tag.id || new Types.ObjectId().toString(),
//         name: tag.name,
//       }))
//       : [];

//     /* -------------------------------------------------------------------------- */
//     /*                                   BRAND                                    */
//     /* -------------------------------------------------------------------------- */

//     // Embedded brand (no Brand schema)
//     const brandName = (formData.get("brandName") as string) || "";

//     /* -------------------------------------------------------------------------- */
//     /*                                   OFFERS                                   */
//     /* -------------------------------------------------------------------------- */

//     const discountPercent = Number(formData.get("discountPercent")) || 0;

//     const offerStartDateRaw = formData.get("offerStartDate") as string | null;
//     const offerEndDateRaw = formData.get("offerEndDate") as string | null;

//     const offerStartDate = offerStartDateRaw
//       ? new Date(offerStartDateRaw)
//       : null;

//     const offerEndDate = offerEndDateRaw
//       ? new Date(offerEndDateRaw)
//       : null;

//     if (
//       offerStartDate &&
//       offerEndDate &&
//       offerEndDate < offerStartDate
//     ) {
//       return {
//         success: false,
//         message: "Offer end date cannot be before start date",
//       };
//     }

//     let offeredPrice = 0;
//     let isOfferedPriceActive = false;

//     if (discountPercent > 0) {
//       offeredPrice = Math.round(
//         price - (price * discountPercent) / 100
//       );
//       isOfferedPriceActive = true;
//     }

//     /* -------------------------------------------------------------------------- */
//     /*                              VALIDATIONS                                   */
//     /* -------------------------------------------------------------------------- */

//     const missingFields = checkRequiredFields({
//       name,
//       price,
//       category,
//       stock,
//       brandName,
//     });

//     if (missingFields) return {
//       success: false,
//       message: ` provide these ${missingFields}`
//     };

//     if (Number.isNaN(price) || price <= 0) {
//       return {
//         success: false,
//         message: "Price must be a valid number",
//       };
//     }

//     /* -------------------------------------------------------------------------- */
//     /*                                   SLUG                                     */
//     /* -------------------------------------------------------------------------- */



//     const exists = await Product.findOne({
//       name,
//     });

//     if (exists) {
//       return {
//         success: false,
//         message: `Product '${name}' already exists`,
//       };
//     }

//     /* -------------------------------------------------------------------------- */
//     /*                              IMAGE UPLOAD                                  */
//     /* -------------------------------------------------------------------------- */

//     for (const img of images) {
//       const url = await uploadToCloudinary(img);
//       uploadedImages.push(url);
//     }

//     /* -------------------------------------------------------------------------- */
//     /*                              CREATE PRODUCT                                */
//     /* -------------------------------------------------------------------------- */

//     const product = await Product.create({
//       name,

//       description,
//       price,
//       stock,
//       reservedStock: 0,

//       category,
//       images: uploadedImages,
//       variants: [],

//       tags,

//       brandName,

//       discountPercent,
//       offeredPrice,
//       isOfferedPriceActive,
//       offerStartDate,
//       offerEndDate,

//       avgRating: 0,
//       totalReviews: 0,
//       totalSales: 0,

//       isActive,
//     });

//     return {
//       success: true,
//       message: "Product created successfully",
//       data: mapProductToFrontend(product),
//     };
//   } catch (error) {
//     console.error("Create Product Action Error:", error);


//     if (uploadedImages.length) {
//       await Promise.all(
//         uploadedImages.map((url) =>
//           deleteFromCloudinary(url).catch(() => null)
//         )
//       );
//     }


//     return {
//       success: false,
//       message: "Failed to create product",
//     };
//   }
// }







// /* -------------------------------------------------------------------------- */
// /*                                UPDATE PRODUCT                               */
// /* -------------------------------------------------------------------------- */
// interface UpdateProductActionProps {
//   productId: string;
//   formData: FormData;
// }

// interface UpdateProductActionResult {
//   success: boolean;
//   message: string;
//   data?: productType;
//   error?: string;
// }

// export async function updateProductAction({
//   productId,
//   formData,
// }: UpdateProductActionProps): Promise<UpdateProductActionResult> {
//   const uploadedImages: string[] = [];

//   try {
//     await requireAdmin();
//     await connectDB();

//     if (!productId || !Types.ObjectId.isValid(productId)) {
//       return { success: false, message: "Invalid or missing productId" };
//     }

//     const productToUpdate = await Product.findById(productId);
//     if (!productToUpdate) {
//       return { success: false, message: "Product not found" };
//     }

//     /* ----------------------------- BASIC FIELDS ----------------------------- */
//     const name = formData.get("name") as string | null;
//     const priceRaw = formData.get("price") as string | null;
//     const price = priceRaw ? Number(priceRaw) : undefined;
//     const stockRaw = formData.get("stock") as string | null;
//     const stock = stockRaw ? parseInt(stockRaw, 10) : undefined;
//     const description = formData.get("description") as string | null;
//     const category = formData.get("category") as string | null;
//     const isActiveRaw = formData.get("isActive") as string | null;
//     const isActive = isActiveRaw !== null ? isActiveRaw === "true" : undefined;

//     /* ----------------------------- TAGS ----------------------------- */
//     const tagsRaw = formData.get("tags") as string | null;
//     const tags = tagsRaw
//       ? (JSON.parse(tagsRaw) as { id?: string; name: string }[]).map(tag => ({
//           id: tag.id || new Types.ObjectId().toString(),
//           name: tag.name,
//         }))
//       : undefined;

//     /* ----------------------------- BRAND ----------------------------- */
//     const brandName = formData.get("brandName") as string | null;

//     /* ----------------------------- OFFERS ----------------------------- */
//     const discountPercentRaw = formData.get("discountPercent") as string | null;
//     const discountPercent = discountPercentRaw ? Number(discountPercentRaw) : undefined;

//     const offerStartDateRaw = formData.get("offerStartDate") as string | null;
//     const offerEndDateRaw = formData.get("offerEndDate") as string | null;
//     const offerStartDate = offerStartDateRaw ? new Date(offerStartDateRaw) : undefined;
//     const offerEndDate = offerEndDateRaw ? new Date(offerEndDateRaw) : undefined;

//     if (offerStartDate && offerEndDate && offerEndDate < offerStartDate) {
//       return { success: false, message: "Offer end date cannot be before start date" };
//     }

//     let offeredPrice: number | undefined;
//     let isOfferedPriceActive: boolean | undefined;

//     if (discountPercent !== undefined && price !== undefined) {
//       offeredPrice = Math.round(price - (price * discountPercent) / 100);
//       isOfferedPriceActive = true;
//     }

//     /* ----------------------------- IMAGES ----------------------------- */
//     const images = formData.getAll("images") as File[];
//     if (images && images.length > 0) {
//       // Delete old images
//       if (productToUpdate.images?.length) {
//         await Promise.all(productToUpdate.images.map(( imageUrl : string) => deleteFromCloudinary(imageUrl).catch(() => null)));
//       }

//       // Upload new images
//       for (const file of images) {
//         if (file && file.size > 0) {
//           const url = await uploadToCloudinary(file);
//           uploadedImages.push(url);
//         }
//       }
//       productToUpdate.images = uploadedImages;
//     }

//     /* ----------------------------- UPDATE FIELDS ----------------------------- */
//     if (name) productToUpdate.name = name;
//     if (price !== undefined) productToUpdate.price = price;
//     if (stock !== undefined && !isNaN(stock)) productToUpdate.stock = stock;
//     if (description) productToUpdate.description = description;
//     if (category) productToUpdate.category = category;
//     if (isActive !== undefined) productToUpdate.isActive = isActive;
//     if (tags) productToUpdate.tags = tags;
//     if (brandName) productToUpdate.brandName = brandName;

//     if (discountPercent !== undefined) productToUpdate.discountPercent = discountPercent;
//     if (offeredPrice !== undefined) productToUpdate.offeredPrice = offeredPrice;
//     if (isOfferedPriceActive !== undefined) productToUpdate.isOfferedPriceActive = isOfferedPriceActive;
//     if (offerStartDate) productToUpdate.offerStartDate = offerStartDate;
//     if (offerEndDate) productToUpdate.offerEndDate = offerEndDate;

//     await productToUpdate.save();

//     return {
//       success: true,
//       message: "Product updated successfully",
//       data: mapProductToFrontend(productToUpdate),
//     };
//   } catch (err) {
//     console.error("Update Product Action Error:", err);

//     // Rollback uploaded images if any
//     if (uploadedImages.length) {
//       await Promise.all(uploadedImages.map(url => deleteFromCloudinary(url).catch(() => null)));
//     }

//     return { success: false, message: "Failed to update product", error: err instanceof Error ? err.message : undefined };
//   }
// }

// /* -------------------------------------------------------------------------- */
// /*                                DELETE PRODUCT                               */
// /* -------------------------------------------------------------------------- */
// interface DeleteProductInput {
//   productId: string;
// }

// interface DeleteProductActionResult {
//   success: boolean;
//   message: string;
// }

// export const deleteProductAction = async ({
//   productId,
// }: DeleteProductInput): Promise<DeleteProductActionResult> => {
//   try {
//     await requireAdmin();
//     await connectDB();

//     if (!productId || !Types.ObjectId.isValid(productId)) {
//       return { success: false, message: "Invalid or missing productId" };
//     }

//     const productToDelete = await Product.findById(productId);
//     if (!productToDelete) {
//       return { success: false, message: "Product not found" };
//     }

//     // Delete images from Cloudinary
//     if (productToDelete.images?.length) {
//       await Promise.all(productToDelete.images.map((imageurl : string) => deleteFromCloudinary(imageurl).catch(() => null)));
//     }

//     // Delete the product
//     await productToDelete.deleteOne();

//     return { success: true, message: "Product deleted successfully" };
//   } catch (err) {
//     console.error("Delete Product Action Error:", err);
//     return { success: false, message: "Failed to delete product" };
//   }
// };


"use server";

import { FilterQuery, Types } from "mongoose";
import { connectDB } from "@/db";
import { IProduct, Product } from "@/models/productModel";
import { requireAdmin } from "@/lib/auth/requireSession";

import { deleteFromCloudinary, uploadToCloudinary } from "@/config/cloudinary";
import { productType } from "@/types/product";
import { mapProductToFrontend } from "@/lib/server/mappers/MapProductData";
import { revalidatePath } from "next/cache";

/* ------------------------ API RESPONSE TYPES ------------------------ */
export interface ActionResult<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

/* ------------------------ CREATE PRODUCT ------------------------ */
export async function createProductAction(formData: FormData): Promise<ActionResult<productType>> {
  const uploadedImages: string[] = [];

  try {
    /* ------------------------- AUTH & DB ------------------------- */
    await requireAdmin();
    await connectDB();

    /* ------------------------- BASIC FIELDS ------------------------- */
    const name = formData.get("name")?.toString() || "";
    const priceRaw = formData.get("price")?.toString() || "";
    const price = Number(priceRaw);
    const stock = Number(formData.get("stock")) || 0;
    const description = formData.get("description")?.toString() || "";
    const category = formData.get("category")?.toString() || "";
    const images = formData.getAll("images") as File[];

    const isActive = formData.get("isActive") === null ? true : formData.get("isActive")?.toString() === "true";

    /* ------------------------- TAGS ------------------------- */
    const tagsRaw = formData.get("tags")?.toString() || null;
    const tags = tagsRaw
      ? (JSON.parse(tagsRaw) as { id?: string; name: string }[]).map(tag => ({
          id: tag.id || new Types.ObjectId().toString(),
          name: tag.name,
        }))
      : [];

    /* ------------------------- BRAND ------------------------- */
    const brandName = formData.get("brandName")?.toString() || "";

    /* ------------------------- OFFERS ------------------------- */
 const discountRaw = formData.get("discountPercent");
const discountPercent =
  discountRaw && Number(discountRaw) > 0
    ? Number(discountRaw)
    : undefined;

    const offerStartDate = formData.get("offerStartDate") ? new Date(formData.get("offerStartDate")!.toString()) : null;
    const offerEndDate = formData.get("offerEndDate") ? new Date(formData.get("offerEndDate")!.toString()) : null;

    if (offerStartDate && offerEndDate && offerEndDate < offerStartDate) {
      return { success: false, message: "Offer end date cannot be before start date" };
    }

   let offeredPrice: number | undefined;
let isOfferedPriceActive = false;

if (discountPercent !== undefined) {
  offeredPrice = Math.round(price - (price * discountPercent) / 100);
  isOfferedPriceActive = true;
}


    /* ------------------------- VALIDATIONS ------------------------- */

    if(!name || !name.trim()) {
      return { success: false, message: "Product name is required" };
    }
    if (!category || !category.trim()) {
      return { success: false, message: "Category is required" };
    }
    if (!stock || stock <= 0) {
      return { success: false, message: "Stock quantity must be a valid number" };
    }
    if (!price || price <= 0) {
      return { success: false, message: "Price must be a valid number" };
      
    }
    if (!brandName || !brandName.trim()) {
      return { success: false, message: "Brand name is required" };
    }
  

    const exists = await Product.findOne({ name });
    if (exists) return { success: false, message: `Product '${name}' already exists` };

    /* ------------------------- IMAGE UPLOAD ------------------------- */
    for (const img of images) {
      if (img && img.size > 0) {
        const url = await uploadToCloudinary(img);
        uploadedImages.push(url);
      }
    }

    /* ------------------------- CREATE PRODUCT ------------------------- */
    const product = await Product.create({
      name,
      description,
      price,
      stock,
      reservedStock: 0,
      category,
      images: uploadedImages,
      variants: [],
      tags,
      brandName,
      discountPercent,
      offeredPrice,
      isOfferedPriceActive,
      offerStartDate,
      offerEndDate,
      avgRating: 0,
      totalReviews: 0,
      totalSales: 0,
      isActive,
    });

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/product");

    return { success: true, message: "Product created successfully", data: mapProductToFrontend(product) };
  } catch (err) {
    console.error("Create Product Error:", err);

    /* ------------------------- ROLLBACK IMAGES ------------------------- */
    if (uploadedImages.length) {
      await Promise.all(uploadedImages.map(url => deleteFromCloudinary(url).catch(() => null)));
    }

    return { success: false, message: "Failed to create product", error: err instanceof Error ? err.message : undefined };
  }
}

/* ------------------------ UPDATE PRODUCT ------------------------ */
interface UpdateProductActionProps {
  productId: string;
  formData: FormData;
}
export async function updateProductAction({ productId, formData }: UpdateProductActionProps): Promise<ActionResult<productType>> {
  const uploadedImages: string[] = [];

  try {
    await requireAdmin();
    await connectDB();

    if (!productId || !Types.ObjectId.isValid(productId)) return { success: false, message: "Invalid productId" };

    const productToUpdate = await Product.findById(productId);
    if (!productToUpdate) return { success: false, message: "Product not found" };

    /* ------------------------- BASIC FIELDS ------------------------- */
    const name = formData.get("name")?.toString() || undefined;
    const price = formData.get("price") ? Number(formData.get("price")!.toString()) : undefined;
    const stock = formData.get("stock") ? parseInt(formData.get("stock")!.toString(), 10) : undefined;
    const description = formData.get("description")?.toString();
    const category = formData.get("category")?.toString();
    const isActiveRaw = formData.get("isActive")?.toString();
    const isActive = isActiveRaw !== undefined ? isActiveRaw === "true" : undefined;

    /* ------------------------- TAGS ------------------------- */
    const tagsRaw = formData.get("tags")?.toString();
    const tags = tagsRaw
      ? (JSON.parse(tagsRaw) as { id?: string; name: string }[]).map(tag => ({
          id: tag.id || new Types.ObjectId().toString(),
          name: tag.name,
        }))
      : undefined;

    /* ------------------------- BRAND ------------------------- */
    const brandName = formData.get("brandName")?.toString();

    /* ------------------------- OFFERS ------------------------- */
const discountRaw = formData.get("discountPercent");
const discountPercent =
  discountRaw && Number(discountRaw) > 0
    ? Number(discountRaw)
    : undefined;

    const offerStartDate = formData.get("offerStartDate") ? new Date(formData.get("offerStartDate")!.toString()) : undefined;
    const offerEndDate = formData.get("offerEndDate") ? new Date(formData.get("offerEndDate")!.toString()) : undefined;

    if (offerStartDate && offerEndDate && offerEndDate < offerStartDate) {
      return { success: false, message: "Offer end date cannot be before start date" };
    }

    let offeredPrice: number | undefined;
    let isOfferedPriceActive: boolean | undefined;
    if (discountPercent !== undefined && price !== undefined) {
      offeredPrice = Math.round(price - (price * discountPercent) / 100);
      isOfferedPriceActive = true;
    }

    // 🔥 CLEAR DISCOUNT IF REMOVED (CRITICAL FIX)
if (discountPercent === undefined) {
  productToUpdate.discountPercent = undefined;
  productToUpdate.offeredPrice = undefined;
  productToUpdate.isOfferedPriceActive = false;
}


    /* ------------------------- IMAGE UPLOAD ------------------------- */
    const images = formData.getAll("images") as File[];
    if (images && images.length > 0) {
      // Upload new images first
      for (const file of images) {
        if (file && file.size > 0) {
          const url = await uploadToCloudinary(file);
          uploadedImages.push(url);
        }
      }

      // Only delete old images after successful uploads
      if (productToUpdate.images?.length) {
        await Promise.all(productToUpdate.images.map((imageUrl : string) => deleteFromCloudinary(imageUrl).catch(() => null)));
      }

      productToUpdate.images = uploadedImages;
    }

    /* ------------------------- UPDATE FIELDS ------------------------- */
    if (name) productToUpdate.name = name;
    if (price !== undefined) productToUpdate.price = price;
    if (stock !== undefined) productToUpdate.stock = stock;
    if (description) productToUpdate.description = description;
    if (category) productToUpdate.category = category;
    if (isActive !== undefined) productToUpdate.isActive = isActive;
    if (tags) productToUpdate.tags = tags;
    if (brandName) productToUpdate.brandName = brandName;
    if (discountPercent !== undefined) productToUpdate.discountPercent = discountPercent;
    if (offeredPrice !== undefined) productToUpdate.offeredPrice = offeredPrice;
    if (isOfferedPriceActive !== undefined) productToUpdate.isOfferedPriceActive = isOfferedPriceActive;
    if (offerStartDate) productToUpdate.offerStartDate = offerStartDate;
    if (offerEndDate) productToUpdate.offerEndDate = offerEndDate;

    await productToUpdate.save();
    
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/product");

    return { success: true, message: "Product updated successfully", data: mapProductToFrontend(productToUpdate) };
  } catch (err) {
    console.error("Update Product Error:", err);

    // Rollback uploaded images if failure
    if (uploadedImages.length) {
      await Promise.all(uploadedImages.map(url => deleteFromCloudinary(url).catch(() => null)));
    }

    return { success: false, message: "Failed to update product", error: err instanceof Error ? err.message : undefined };
  }
}

/* ------------------------ DELETE PRODUCT ------------------------ */
interface DeleteProductInput {
  productId: string;
}
export const deleteProductAction = async ({ productId }: DeleteProductInput): Promise<ActionResult> => {
  try {
    await requireAdmin();
    await connectDB();

    if (!productId || !Types.ObjectId.isValid(productId)) return { success: false, message: "Invalid productId" };

    const productToDelete = await Product.findById(productId);
    if (!productToDelete) return { success: false, message: "Product not found" };

    // Delete images first
    if (productToDelete.images?.length) {
      await Promise.all(productToDelete.images.map((imageUrl : string) => deleteFromCloudinary(imageUrl).catch(() => null)));
    }

    // Delete product from DB
    await productToDelete.deleteOne();
    
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/product");

    return { success: true, message: "Product deleted successfully" };
  } catch (err) {
    console.error("Delete Product Error:", err);
    return { success: false, message: "Failed to delete product", error: err instanceof Error ? err.message : undefined };
  }
};



export interface ApiAllProductsResponse {
  success: boolean;
  message: string;
  data: productType[] | null;
  error?: string | null;
}

export async function fetchAllProductsNoPagination(
  filters?: FilterQuery<IProduct>
): Promise<ApiAllProductsResponse> {
  try {
    await connectDB();

    const filter: FilterQuery<IProduct> = {
      isActive: true,
      ...filters,
    };

    const products = await Product.find(filter)
      .sort({ createdAt: -1 }) // newest first
      .populate({
        path: "category",
        select: "categoryName slug categoryImage isActive createdAt",
      })
      .populate({
        path: "variants",
        match: { isActive: true },
        select: "price stock specs images isActive",
      })
      .lean<IProduct[]>();

    return {
      success: true,
      message: "All products fetched successfully",
      data: products.map(mapProductToFrontend),
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unexpected server error";

    console.error("Fetch All Products (No Pagination) Error:", errorMessage);

    return {
      success: false,
      message: "Failed to fetch products",
      data: null,
      error: errorMessage,
    };
  }
}

