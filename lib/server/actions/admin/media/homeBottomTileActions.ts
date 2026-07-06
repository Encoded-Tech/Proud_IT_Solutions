"use server";

import {
  deleteFromCloudinary,
  deleteFromCloudinaryByPublicId,
  uploadToCloudinary,
} from "@/config/cloudinary";
import { connectDB } from "@/db";
import { requireAdmin } from "@/lib/auth/requireSession";
import { HomeBottomTileLike, mapHomeBottomTile } from "@/lib/server/mappers/mapHomeBottomTile";
import { homeBottomTileSchema } from "@/lib/validations/homeBottomTile";
import { HomeBottomTileModel } from "@/models/homeBottomTileModel";
import { HomeBottomTile } from "@/types/home-media";
import { revalidatePath, revalidateTag } from "next/cache";
import { Types } from "mongoose";

type TileResponse<T = undefined> = {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>;
};

const MAX_IMAGE_BYTES = 6 * 1024 * 1024;

function invalidateHomeMedia() {
  revalidatePath("/home");
  revalidatePath("/");
  revalidateTag("home-media", "max");
  revalidateTag("media", "max");
  revalidateTag("homepage", "max");
}

function parseBoolean(value: FormDataEntryValue | null) {
  return value === "true" || value === "on";
}

function validationErrors(error: {
  issues: Array<{ path: PropertyKey[]; message: string }>;
}) {
  return Object.fromEntries(
    error.issues.map((issue) => [String(issue.path[0] || "form"), issue.message])
  );
}

function validateImage(file: File | null): string | null {
  if (!file || file.size === 0) return null;
  if (!file.type.startsWith("image/")) return "Only image files are allowed";
  if (file.size > MAX_IMAGE_BYTES) return "Image must be 6 MB or smaller";
  return null;
}

function payloadFromForm(formData: FormData, imageUrl: string) {
  return homeBottomTileSchema.safeParse({
    title: String(formData.get("title") || ""),
    subtitle: String(formData.get("subtitle") || ""),
    imageUrl,
    linkUrl: String(formData.get("linkUrl") || "#"),
    ctaText: String(formData.get("ctaText") || ""),
    altText: String(formData.get("altText") || ""),
    sortOrder: formData.get("sortOrder"),
    isActive: parseBoolean(formData.get("isActive")),
    publicId: String(formData.get("publicId") || "") || undefined,
  });
}

async function removeUploadedImage(imageUrl: string, publicId?: string) {
  try {
    if (publicId) {
      await deleteFromCloudinaryByPublicId(publicId, "image");
    } else if (imageUrl.includes("res.cloudinary.com")) {
      await deleteFromCloudinary(imageUrl);
    }
  } catch (error) {
    console.error("Failed to remove home bottom tile image:", error);
  }
}

export async function getAdminHomeBottomTiles(): Promise<
  TileResponse<HomeBottomTile[]>
> {
  await requireAdmin();
  await connectDB();

  const tiles = await HomeBottomTileModel.find({ placement: "home_bottom_tiles" })
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();

  return {
    success: true,
    message: "Home bottom tiles fetched successfully",
    data: tiles.map((tile) =>
      mapHomeBottomTile(tile as unknown as HomeBottomTileLike)
    ),
  };
}

export async function createHomeBottomTile(
  formData: FormData
): Promise<TileResponse<HomeBottomTile>> {
  await requireAdmin();
  await connectDB();

  const fileEntry = formData.get("image");
  const file = fileEntry instanceof File ? fileEntry : null;
  const fileError = validateImage(file);
  if (fileError) return { success: false, message: fileError, errors: { image: fileError } };

  let uploadedUrl = "";
  try {
    uploadedUrl = file && file.size > 0 ? await uploadToCloudinary(file) : "";
    const parsed = payloadFromForm(formData, uploadedUrl);
    if (!parsed.success) {
      if (uploadedUrl) await removeUploadedImage(uploadedUrl);
      return {
        success: false,
        message: "Please correct the highlighted fields",
        errors: validationErrors(parsed.error),
      };
    }

    const tile = await HomeBottomTileModel.create({
      ...parsed.data,
      placement: "home_bottom_tiles",
    });
    invalidateHomeMedia();
    return {
      success: true,
      message: "Home bottom tile created",
      data: mapHomeBottomTile(tile.toObject()),
    };
  } catch (error) {
    if (uploadedUrl) await removeUploadedImage(uploadedUrl);
    console.error("Failed to create home bottom tile:", error);
    return { success: false, message: "Failed to create home bottom tile" };
  }
}

export async function updateHomeBottomTile(
  id: string,
  formData: FormData
): Promise<TileResponse<HomeBottomTile>> {
  await requireAdmin();
  if (!Types.ObjectId.isValid(id)) return { success: false, message: "Invalid tile" };
  await connectDB();

  const existing = await HomeBottomTileModel.findById(id);
  if (!existing) return { success: false, message: "Tile not found" };

  const fileEntry = formData.get("image");
  const file = fileEntry instanceof File ? fileEntry : null;
  const fileError = validateImage(file);
  if (fileError) return { success: false, message: fileError, errors: { image: fileError } };

  let uploadedUrl = "";
  try {
    uploadedUrl = file && file.size > 0 ? await uploadToCloudinary(file) : "";
    const parsed = payloadFromForm(formData, uploadedUrl || existing.imageUrl);
    if (!parsed.success) {
      if (uploadedUrl) await removeUploadedImage(uploadedUrl);
      return {
        success: false,
        message: "Please correct the highlighted fields",
        errors: validationErrors(parsed.error),
      };
    }

    const oldImageUrl = existing.imageUrl;
    const oldPublicId = existing.publicId;
    existing.set({ ...parsed.data, publicId: uploadedUrl ? undefined : oldPublicId });
    await existing.save();
    if (uploadedUrl && oldImageUrl !== uploadedUrl) {
      await removeUploadedImage(oldImageUrl, oldPublicId);
    }
    invalidateHomeMedia();
    return {
      success: true,
      message: "Home bottom tile updated",
      data: mapHomeBottomTile(existing.toObject()),
    };
  } catch (error) {
    if (uploadedUrl) await removeUploadedImage(uploadedUrl);
    console.error("Failed to update home bottom tile:", error);
    return { success: false, message: "Failed to update home bottom tile" };
  }
}

export async function toggleHomeBottomTileStatus(
  id: string
): Promise<TileResponse<HomeBottomTile>> {
  await requireAdmin();
  if (!Types.ObjectId.isValid(id)) return { success: false, message: "Invalid tile" };
  await connectDB();
  const tile = await HomeBottomTileModel.findById(id);
  if (!tile) return { success: false, message: "Tile not found" };
  tile.isActive = !tile.isActive;
  await tile.save();
  invalidateHomeMedia();
  return {
    success: true,
    message: `Tile ${tile.isActive ? "activated" : "deactivated"}`,
    data: mapHomeBottomTile(tile.toObject()),
  };
}

export async function deleteHomeBottomTile(id: string): Promise<TileResponse> {
  await requireAdmin();
  if (!Types.ObjectId.isValid(id)) return { success: false, message: "Invalid tile" };
  await connectDB();
  const tile = await HomeBottomTileModel.findByIdAndDelete(id);
  if (!tile) return { success: false, message: "Tile not found" };
  await removeUploadedImage(tile.imageUrl, tile.publicId);
  invalidateHomeMedia();
  return { success: true, message: "Home bottom tile deleted" };
}

export async function reorderHomeBottomTiles(
  orderedIds: string[]
): Promise<TileResponse> {
  await requireAdmin();
  if (
    !Array.isArray(orderedIds) ||
    orderedIds.length > 100 ||
    orderedIds.some((id) => !Types.ObjectId.isValid(id))
  ) {
    return { success: false, message: "Invalid tile order" };
  }
  await connectDB();
  await HomeBottomTileModel.bulkWrite(
    orderedIds.map((id, index) => ({
      updateOne: { filter: { _id: id }, update: { $set: { sortOrder: index + 1 } } },
    }))
  );
  invalidateHomeMedia();
  return { success: true, message: "Tile order updated" };
}
