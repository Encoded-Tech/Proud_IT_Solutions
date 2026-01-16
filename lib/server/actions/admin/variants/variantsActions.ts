"use server";

import { Types } from "mongoose";
import { Product } from "@/models/productModel";
import { ProductVariant } from "@/models";
import { connectDB } from "@/db";
import { requireAdmin } from "@/lib/auth/requireSession";
import { uploadToCloudinary, deleteFromCloudinary } from "@/config/cloudinary";
import { mapProductVariantToFrontend } from "@/lib/server/mappers/variantsMapper";

/* =====================================================
   CREATE VARIANT
===================================================== */
/* =====================================================
   CREATE VARIANT
===================================================== */
export async function createProductVariantAction(formData: FormData) {
  await requireAdmin();
  await connectDB();

  const productId = formData.get("productId") as string;
  const cpu = formData.get("cpu") as string;
  const ram = formData.get("ram") as string;
  const storage = formData.get("storage") as string;
  const color = formData.get("color") as string | null;
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock") ?? 0);
  
  const isActive = formData.get("isActive") === "true";
  const discountPercent = formData.get("discountPercent")
    ? Number(formData.get("discountPercent")!.toString())
    : 0;
  const offerStartDate = formData.get("offerStartDate")
    ? new Date(formData.get("offerStartDate")!.toString())
    : undefined;
  const offerEndDate = formData.get("offerEndDate")
    ? new Date(formData.get("offerEndDate")!.toString())
    : undefined;

  if (!Types.ObjectId.isValid(productId)) {
    return { success: false, message: "Invalid product ID" };
  }

  if (!cpu?.trim() || !ram?.trim() || !storage?.trim() || Number.isNaN(price)) {
    return { success: false, message: "Missing required fields" };
  }

  if (offerStartDate && offerEndDate && offerEndDate < offerStartDate) {
    return { success: false, message: "Offer end date cannot be before start date" };
  }

  const product = await Product.findById(productId);
  if (!product) return { success: false, message: "Parent product not found" };

  const uploadedImageUrls: string[] = [];
  try {
    const images = formData.getAll("images") as File[];
    for (const img of images) {
      if (img instanceof File && img.size > 0) {
        const url = await uploadToCloudinary(img);
        uploadedImageUrls.push(url);
      }
    }

    // ✅ Automatically calculate offeredPrice and isOfferActive
    let offeredPrice = 0;
    let isOfferActive = false;
    if (discountPercent > 0) {
      offeredPrice = Math.round(price - (price * discountPercent) / 100);
      const now = new Date();
      isOfferActive =
        (!offerStartDate || now >= offerStartDate) &&
        (!offerEndDate || now <= offerEndDate);
    }

    const variant = await ProductVariant.create({
      product: productId,
      specs: { cpu, ram, storage, ...(color ? { color } : {}) },
      price,
      stock,
      reservedStock :0,
      discountPercent,
      offeredPrice,
      isOfferActive,
      offerStartDate,
      offerEndDate,
      images: uploadedImageUrls,
      isActive,
    });

    await Product.findByIdAndUpdate(productId, { $push: { variants: variant._id } });

    return {
      success: true,
      message: "Product variant created successfully",
      data: mapProductVariantToFrontend(variant),
    };
  } catch (err) {
    console.error("Create Variant Error:", err);
    for (const url of uploadedImageUrls) {
      try { await deleteFromCloudinary(url); } catch {}
    }
    return { success: false, message: "Failed to create product variant" };
  }
}

/* =====================================================
   UPDATE VARIANT
===================================================== */
export async function updateProductVariantAction(formData: FormData) {
  await requireAdmin();
  await connectDB();

  const variantId = formData.get("variantId") as string;
  if (!Types.ObjectId.isValid(variantId))
    return { success: false, message: "Invalid variant ID" };

  const variant = await ProductVariant.findById(variantId);
  if (!variant) return { success: false, message: "Variant not found" };

  const uploadedImageUrls: string[] = [];
  try {
    const cpu = formData.get("cpu") as string | null;
    const ram = formData.get("ram") as string | null;
    const storage = formData.get("storage") as string | null;
    const color = formData.get("color") as string | null;

    const price = formData.get("price") ? Number(formData.get("price")) : undefined;
    const stock = formData.get("stock") ? Number(formData.get("stock")) : undefined;
   
    const isActive = formData.get("isActive") !== null ? formData.get("isActive") === "true" : undefined;

    const discountPercent = formData.get("discountPercent")
      ? Number(formData.get("discountPercent"))
      : 0;
    const offerStartDate = formData.get("offerStartDate")
      ? new Date(formData.get("offerStartDate")!.toString())
      : undefined;
    const offerEndDate = formData.get("offerEndDate")
      ? new Date(formData.get("offerEndDate")!.toString())
      : undefined;

    const removeImages = formData.getAll("removeImages") as string[];
    const newImages = formData.getAll("images") as File[];

    for (const img of newImages) {
      if (img instanceof File && img.size > 0) {
        const url = await uploadToCloudinary(img);
        uploadedImageUrls.push(url);
      }
    }

    for (const url of removeImages) {
      if (variant.images.includes(url)) await deleteFromCloudinary(url);
    }

    if (cpu) variant.specs.cpu = cpu;
    if (ram) variant.specs.ram = ram;
    if (storage) variant.specs.storage = storage;
    if (color) variant.specs.color = color;

    if (price !== undefined) variant.price = price;
    if (stock !== undefined) variant.stock = stock;

    if (isActive !== undefined) variant.isActive = isActive;
    variant.discountPercent = discountPercent;
    variant.offerStartDate = offerStartDate;
    variant.offerEndDate = offerEndDate;

    // ✅ Auto-calculate offeredPrice & isOfferActive
    if (discountPercent > 0 && variant.price > 0) {
      variant.offeredPrice = Math.round((variant.price * (100 - discountPercent)) / 100);
      const now = new Date();
      variant.isOfferActive =
        (!offerStartDate || now >= offerStartDate) &&
        (!offerEndDate || now <= offerEndDate);
    } else {
      variant.offeredPrice = 0;
      variant.isOfferActive = false;
    }

    variant.images = variant.images
      .filter((image: string) => !removeImages.includes(image))
      .concat(uploadedImageUrls);

    await variant.save();

    return {
      success: true,
      message: "Variant updated successfully",
      data: mapProductVariantToFrontend(variant),
    };
  } catch (err) {
    console.error("Update Variant Error:", err);
    for (const url of uploadedImageUrls) {
      try { await deleteFromCloudinary(url); } catch {}
    }
    return { success: false, message: "Failed to update variant" };
  }
}


/* =====================================================
   GET VARIANTS BY PRODUCT
===================================================== */
export async function getProductVariants(productId: string) {
  await connectDB();

  if (!Types.ObjectId.isValid(productId)) {
    return { success: false, message: "Invalid product ID" };
  }

  const product = await Product.findById(productId).populate("variants");
  if (!product) {
    return { success: false, message: "Product not found" };
  }

  return {
    success: true,
    data: product.variants.map(mapProductVariantToFrontend),
  };
}

/* =====================================================
   UPDATE VARIANT
===================================================== */
