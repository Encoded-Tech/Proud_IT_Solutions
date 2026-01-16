import { Types } from "mongoose";
import { Product } from "@/models/productModel";

import { connectDB } from "@/db";
import { requireAdmin } from "@/lib/auth/requireSession";
import { mapProductVariantToFrontend } from "@/lib/server/mappers/variantsMapper";
import { deleteFromCloudinary, uploadToCloudinary } from "@/config/cloudinary";
import { ProductVariant } from "@/models";


export interface CreateVariantInput {
  productId: string;
  specs: {
    cpu: string;
    ram: string;
    storage: string;
    color?: string;
  };
  price: number;
  stock?: number;
  images?: File[];
  isActive?: boolean;
}

export interface CreateVariantResult {
  success: boolean;
  message: string;
  data?: ReturnType<typeof mapProductVariantToFrontend>;
}

export async function createProductVariantAction(
  input: CreateVariantInput
): Promise<CreateVariantResult> {
  await requireAdmin();
  await connectDB();

  const { productId, specs, price, stock = 0, images = [], isActive = true } = input;

  // Validate productId
  if (!Types.ObjectId.isValid(productId)) {
    return { success: false, message: "Invalid product ID" };
  }

  // Validate required specs
  const missingFields = [];
  if (!specs.cpu) missingFields.push("cpu");
  if (!specs.ram) missingFields.push("ram");
  if (!specs.storage) missingFields.push("storage");
  if (!price && price !== 0) missingFields.push("price");

  if (missingFields.length > 0) {
    return { success: false, message: `Missing required fields: ${missingFields.join(", ")}` };
  }

  const product = await Product.findById(productId);
  if (!product) {
    return { success: false, message: "Parent product not found" };
  }

  const uploadedImageUrls: string[] = [];

  try {
    // Upload images
    if (images.length > 0) {
      for (const img of images) {
        if (img && img.size > 0) {
          const url = await uploadToCloudinary(img);
          uploadedImageUrls.push(url);
        }
      }
    }

    // Create variant
    const variant = await ProductVariant.create({
      product: productId,
      specs,
      price,
      stock,
      images: uploadedImageUrls,
      isActive,
    });

    // Link variant to parent product
    await Product.findByIdAndUpdate(productId, {
      $push: { variants: variant._id },
    });

    return {
      success: true,
      message: "Product variant created successfully",
      data: mapProductVariantToFrontend(variant),
    };
  } catch (err) {
    console.error("Create Product Variant Error:", err);

    // Rollback any uploaded images
    for (const url of uploadedImageUrls) {
      try {
        await deleteFromCloudinary(url);
      } catch (e) {
        console.error("Failed to delete image during rollback:", url, e);
      }
    }

    return { success: false, message: "Failed to create product variant" };
  }
}




// ====================== GET VARIANTS ======================
export async function getProductVariants(productId: string) {
  await connectDB();

  if (!Types.ObjectId.isValid(productId)) {
    return { success: false, message: "Invalid product ID" };
  }

  const product = await Product.findById(productId).populate("variants");
  if (!product) return { success: false, message: "Product not found" };

  const variants = product.variants.map(mapProductVariantToFrontend);

  return { success: true, data: variants };
}

// ====================== UPDATE VARIANT ======================
export interface UpdateVariantInput {
  variantId: string;
  specs?: {
    cpu?: string;
    ram?: string;
    storage?: string;
    color?: string;
  };
  price?: number;
  stock?: number;
  images?: File[]; // new images to upload
  removeImages?: string[]; // URLs to remove from cloudinary
  isActive?: boolean;
}

export async function updateProductVariantAction(input: UpdateVariantInput) {
  await requireAdmin();
  await connectDB();

  const { variantId, specs, price, stock, images = [], removeImages = [], isActive } = input;

  if (!Types.ObjectId.isValid(variantId)) {
    return { success: false, message: "Invalid variant ID" };
  }

  const variant = await ProductVariant.findById(variantId);
  if (!variant) return { success: false, message: "Variant not found" };

  const uploadedImageUrls: string[] = [];

  try {
    // Upload new images
    for (const img of images) {
      if (img && img.size > 0) {
        const url = await uploadToCloudinary(img);
        uploadedImageUrls.push(url);
      }
    }

    // Remove old images
    for (const url of removeImages) {
      if (variant.images.includes(url)) {
        await deleteFromCloudinary(url);
      }
    }

    // Update fields
    if (specs) variant.specs = { ...variant.specs, ...specs };
    if (price !== undefined) variant.price = price;
    if (stock !== undefined) variant.stock = stock;
    if (isActive !== undefined) variant.isActive = isActive;
    variant.images = variant.images.filter((images: string) => !removeImages.includes(images)).concat(uploadedImageUrls);

    await variant.save();

    return { success: true, message: "Variant updated successfully", data: mapProductVariantToFrontend(variant) };
  } catch (err) {
    console.error("Update Product Variant Error:", err);

    // Rollback uploaded images
    for (const url of uploadedImageUrls) {
      try {
        await deleteFromCloudinary(url);
      } catch (e) {
        console.error("Failed to delete image during rollback:", url, e);
      }
    }

    return { success: false, message: "Failed to update variant" };
  }
}

// ====================== DELETE VARIANT ======================
export async function deleteProductVariantAction(variantId: string) {
  await requireAdmin();
  await connectDB();

  if (!Types.ObjectId.isValid(variantId)) {
    return { success: false, message: "Invalid variant ID" };
  }

  const variant = await ProductVariant.findById(variantId);
  if (!variant) return { success: false, message: "Variant not found" };

  try {
    // Remove variant from parent product
    await Product.findByIdAndUpdate(variant.product, { $pull: { variants: variant._id } });

    // Delete images from Cloudinary
    for (const url of variant.images) {
      try {
        await deleteFromCloudinary(url);
      } catch (err) {
        console.error("Failed to delete image from Cloudinary:", url, err);
      }
    }

    // Delete variant
    await variant.deleteOne();

    return { success: true, message: "Variant deleted successfully" };
  } catch (err) {
    console.error("Delete Product Variant Error:", err);
    return { success: false, message: "Failed to delete variant" };
  }
}
