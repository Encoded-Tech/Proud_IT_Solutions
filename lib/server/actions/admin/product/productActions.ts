"use server";

import { Types } from "mongoose";

import { connectDB } from "@/db";
import { Product } from "@/models/productModel";
import { requireAdmin } from "@/lib/auth/requireSession";
import { checkRequiredFields } from "@/lib/helpers/validateRequiredFields";
import { deleteFromCloudinary, uploadToCloudinary } from "@/config/cloudinary";
import { productType } from "@/types/product";
import { mapProductToFrontend } from "@/lib/server/mappers/MapProductData";

export interface CreateProductResult {
  success: boolean;
  message: string;
  data?: productType;
}



export async function createProductAction(formData: FormData): Promise<CreateProductResult> {
  try {
    /* -------------------------------------------------------------------------- */
    /*                                AUTH & DB                                   */
    /* -------------------------------------------------------------------------- */

    await requireAdmin();
    await connectDB();

    /* -------------------------------------------------------------------------- */
    /*                               BASIC FIELDS                                  */
    /* -------------------------------------------------------------------------- */

    const name = formData.get("name") as string;
    const priceRaw = formData.get("price") as string;
    const price = Number(priceRaw);

    const stock = Number(formData.get("stock")) || 0;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;

    const images = formData.getAll("images") as File[];

    const variantsRaw = formData.get("variants") as string | null;
    const variants = variantsRaw ? JSON.parse(variantsRaw) : [];

    const isActive =
      formData.get("isActive") === null
        ? true
        : formData.get("isActive") === "true";

    /* -------------------------------------------------------------------------- */
    /*                                   TAGS                                     */
    /* -------------------------------------------------------------------------- */

    const tagsRaw = formData.get("tags") as string | null;
    const tags = tagsRaw
      ? (JSON.parse(tagsRaw) as { id?: string; name: string }[]).map(tag => ({
          id: tag.id || new Types.ObjectId().toString(),
          name: tag.name,
        }))
      : [];

    /* -------------------------------------------------------------------------- */
    /*                                   BRAND                                    */
    /* -------------------------------------------------------------------------- */

    // Embedded brand (no Brand schema)
    const brandName = (formData.get("brandName") as string) || "";

    /* -------------------------------------------------------------------------- */
    /*                                   OFFERS                                   */
    /* -------------------------------------------------------------------------- */

    const discountPercent = Number(formData.get("discountPercent")) || 0;

    const offerStartDateRaw = formData.get("offerStartDate") as string | null;
    const offerEndDateRaw = formData.get("offerEndDate") as string | null;

    const offerStartDate = offerStartDateRaw
      ? new Date(offerStartDateRaw)
      : null;

    const offerEndDate = offerEndDateRaw
      ? new Date(offerEndDateRaw)
      : null;

    let offeredPrice = 0;
    let isOfferedPriceActive = false;

    if (discountPercent > 0) {
      offeredPrice = Math.round(
        price - (price * discountPercent) / 100
      );
      isOfferedPriceActive = true;
    }

    /* -------------------------------------------------------------------------- */
    /*                              VALIDATIONS                                   */
    /* -------------------------------------------------------------------------- */

    const missingFields = checkRequiredFields({
      name,
      price,
      category,
      stock,
      brandName,
    });

    if (missingFields) return {
        success: false,
        message: ` provide these ${missingFields}`
    };

    if (Number.isNaN(price) || price <= 0) {
      return {
        success: false,
        message: "Price must be a valid number",
      };
    }

    /* -------------------------------------------------------------------------- */
    /*                                   SLUG                                     */
    /* -------------------------------------------------------------------------- */

   

    const exists = await Product.findOne({ name ,
    });

    if (exists) {
      return {
        success: false,
        message: `Product '${name}' already exists`,
      };
    }

    /* -------------------------------------------------------------------------- */
    /*                              IMAGE UPLOAD                                  */
    /* -------------------------------------------------------------------------- */

    const imageUrls: string[] = [];

    for (const img of images) {
      if (img && img.size > 0) {
        const url = await uploadToCloudinary(img);
        imageUrls.push(url);
      }
    }

    /* -------------------------------------------------------------------------- */
    /*                              CREATE PRODUCT                                */
    /* -------------------------------------------------------------------------- */

    const product = await Product.create({
      name,
    
      description,
      price,
      stock,
      reservedStock: 0,

      category,
      images: imageUrls,
      variants,

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

    return {
      success: true,
      message: "Product created successfully",
    data: mapProductToFrontend(product),
    };
  } catch (error) {
    console.error("Create Product Action Error:", error);

    return {
      success: false,
      message: "Failed to create product",
    };
  }
}



interface UpdateProductActionProps {
  productId: string;
  formData: FormData;
}

export async function updateProductAction({ productId, formData }: UpdateProductActionProps) {
  try {
    await requireAdmin();
    await connectDB();

    const productToUpdate = await Product.findById(productId);
    if (!productToUpdate) {
      return { success: false, message: "Product not found" };
    }

    /* ----------------------------- BASIC FIELDS ----------------------------- */
    const name = formData.get("name") as string;
    const priceRaw = formData.get("price") as string;
    const price = priceRaw ? Number(priceRaw) : undefined;
    const stockRaw = formData.get("stock") as string;
    const stock = stockRaw ? parseInt(stockRaw, 10) : undefined;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const isActiveRaw = formData.get("isActive") as string;
    const isActive = isActiveRaw !== undefined ? isActiveRaw === "true" : undefined;

    /* ----------------------------- TAGS ----------------------------- */
    const tagsRaw = formData.get("tags") as string | null;
    const tags = tagsRaw
      ? (JSON.parse(tagsRaw) as { id?: string; name: string }[]).map(tag => ({
          id: tag.id || new Types.ObjectId().toString(),
          name: tag.name,
        }))
      : undefined;

    /* ----------------------------- BRAND ----------------------------- */
    const brandName = (formData.get("brandName") as string) || undefined;

    /* ----------------------------- OFFERS ----------------------------- */
    const discountPercentRaw = formData.get("discountPercent");
    const discountPercent = discountPercentRaw ? Number(discountPercentRaw) : undefined;

    const offerStartDateRaw = formData.get("offerStartDate") as string | null;
    const offerEndDateRaw = formData.get("offerEndDate") as string | null;
    const offerStartDate = offerStartDateRaw ? new Date(offerStartDateRaw) : undefined;
    const offerEndDate = offerEndDateRaw ? new Date(offerEndDateRaw) : undefined;

    let offeredPrice: number | undefined;
    let isOfferedPriceActive: boolean | undefined;

    if (discountPercent && price) {
      offeredPrice = Math.round(price - (price * discountPercent) / 100);
      isOfferedPriceActive = true;
    }

    /* ----------------------------- VARIANTS ----------------------------- */
    const variantsRaw = formData.get("variants") as string | null;
    const variants = variantsRaw ? JSON.parse(variantsRaw) : undefined;

    /* ----------------------------- IMAGES ----------------------------- */
    const images = formData.getAll("images") as File[] | undefined;
   

     if (images && images.length > 0) {
            // Delete old images if exist
            if (productToUpdate.images?.length) {
                await Promise.all(
                    productToUpdate.images.map((imageUrl: string) => deleteFromCloudinary(imageUrl))
                );
            }

            // Upload new images
            const uploadedImages = await Promise.all(
                images.map((file: File) => uploadToCloudinary(file))
            );

            // Replace the old images array
            productToUpdate.images = uploadedImages;
        }
    /* ----------------------------- UPDATE FIELDS ----------------------------- */
    if (name) {
      productToUpdate.name = name;
   
    }
    if (price !== undefined) productToUpdate.price = price;
    if (stock !== undefined && !isNaN(stock)) productToUpdate.stock = stock;
    if (description) productToUpdate.description = description;
    if (category) productToUpdate.category = category;
    if (isActive !== undefined) productToUpdate.isActive = isActive;

    if (tags) productToUpdate.tags = tags;
    if (brandName) productToUpdate.brand = {
      id: productToUpdate.brand?.id || new Types.ObjectId().toString(),
      name: brandName,
    };

    if (discountPercent !== undefined) productToUpdate.discountPercent = discountPercent;
    if (offeredPrice !== undefined) productToUpdate.offeredPrice = offeredPrice;
    if (isOfferedPriceActive !== undefined) productToUpdate.isOfferedPriceActive = isOfferedPriceActive;
    if (offerStartDate) productToUpdate.offerStartDate = offerStartDate;
    if (offerEndDate) productToUpdate.offerEndDate = offerEndDate;

    if (variants) productToUpdate.variants = variants;
   

    await productToUpdate.save();

    return {
      success: true,
      message: "Product updated successfully",
     data: mapProductToFrontend(productToUpdate),
    };
  } catch (err) {
    console.error("Update Product Action Error:", err);
    return { success: false, message: "Failed to update product", error: err instanceof Error ? err.message : null };
  }
}

interface DeleteProductInput {
  productId: string;
}

export const deleteProductAction = async ({ productId }: DeleteProductInput) => {
  // Ensure admin
  await requireAdmin();

  // Connect to DB
  await connectDB();

  if (!productId || !Types.ObjectId.isValid(productId)) {
    return { success: false, message: "Invalid or missing productId" };
  }

  const productToDelete = await Product.findById(productId);
  if (!productToDelete) {
    return { success: false, message: "Product not found" };
  }

  // Delete images from Cloudinary
  if (productToDelete.images && productToDelete.images.length > 0) {
    await Promise.all(
      productToDelete.images.map(async (imageUrl: string) => {
        await deleteFromCloudinary(imageUrl);
      })
    );
  }

  // Delete product from DB
  await productToDelete.deleteOne();

  return {
    success: true,
    message: "Product deleted successfully",
    data: [],
  };
};