"use server";
import { deleteFromCloudinary, deleteFromCloudinaryByPublicId, uploadToCloudinary, uploadVideoToCloudinary } from "@/config/cloudinary";
import { requireAdmin } from "@/lib/auth/requireSession";
import { mapMediaToFrontend } from "@/lib/server/mappers/MapMedia";
import { Media } from "@/models/promotionModel";

import { AnyMediaItem, MediaPlacement } from "@/types/media";


interface ApiResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
}

interface MediaParams {
  file?: File;
  placement: MediaPlacement;
}

/* ------------------------------------------------------------------ */
/* ADD MEDIA (fails if placement exists)                               */
/* ------------------------------------------------------------------ */
export const addMedia = async ({
  file,
  placement,
}: MediaParams): Promise<ApiResponse<AnyMediaItem>> => {
  await requireAdmin();

  if (!file) {
    return { success: false, message: "No file provided" };
  }

  const isImageFile = file.type.startsWith("image/");
  const type: "image" | "video" = isImageFile ? "image" : "video";

  let uploadedImageUrl: string | null = null;
  let uploadedVideo: { videoUrl: string; publicId: string } | null = null;

  try {
    // Prevent duplicate placement
    const existing = await Media.findOne({ placement });
    if (existing) {
      return { success: false, message: "Media already exists for this placement" };
    }

    // Upload based on actual file type
    if (isImageFile) {
      uploadedImageUrl = await uploadToCloudinary(file);
    } else {
      uploadedVideo = await uploadVideoToCloudinary(file);
    }

    const newMedia = await Media.create({
      type,
      placement,
      isActive: true,
      ...(type === "image" && uploadedImageUrl
        ? { imageUrl: uploadedImageUrl }
        : {}),
      ...(type === "video" && uploadedVideo
        ? {
            videoUrl: uploadedVideo.videoUrl,
            publicId: uploadedVideo.publicId,
          }
        : {}),
    });

    return {
      success: true,
      message: "Media added successfully",
      data: mapMediaToFrontend(newMedia),
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Error adding media:", errorMessage);

    // Rollback uploads
    if (uploadedImageUrl) await deleteFromCloudinary(uploadedImageUrl);
    if (uploadedVideo)
      await deleteFromCloudinaryByPublicId(uploadedVideo.publicId, "video");

    return { success: false, message: "Failed to add media" };
  }
};


/* ------------------------------------------------------------------ */
/* UPDATE MEDIA (replace existing media for a placement)              */
/* ------------------------------------------------------------------ */
export const updateMedia = async ({
  file,
  placement,
}: MediaParams): Promise<ApiResponse<AnyMediaItem>> => {
  await requireAdmin();

  const isImage = placement.startsWith("hero");
  const type: "image" | "video" = isImage ? "image" : "video";

  let uploadedImageUrl: string | null = null;
  let uploadedVideo: { videoUrl: string; publicId: string } | null = null;

  try {
    const existing = await Media.findOne({ placement });
    if (!existing) return { success: false, message: "No media found for this placement" };

    // Upload new file first
 if (file) {
  if (file.type.startsWith("image/")) {
    uploadedImageUrl = await uploadToCloudinary(file);
  } else {
    uploadedVideo = await uploadVideoToCloudinary(file);
  }
}


    // Delete old Cloudinary file
    if (existing.type === "image" && existing.imageUrl) await deleteFromCloudinary(existing.imageUrl);
    if (existing.type === "video" && existing.publicId)
      await deleteFromCloudinaryByPublicId(existing.publicId, "video");

    // Update DB
    existing.type = type;
    if (type === "image") existing.imageUrl = uploadedImageUrl;
    if (type === "video") {
      existing.videoUrl = uploadedVideo!.videoUrl;
      existing.publicId = uploadedVideo!.publicId;
    }

    await existing.save();

    return {
      success: true,
      message: "Media updated successfully",
      data: mapMediaToFrontend(existing),
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Error updating media:", errorMessage);
    // Rollback new upload
    if (uploadedImageUrl) await deleteFromCloudinary(uploadedImageUrl);
    if (uploadedVideo) await deleteFromCloudinaryByPublicId(uploadedVideo.publicId, "video");

    return { success: false, message: "Failed to update media" };
  }
};

/* ------------------------------------------------------------------ */
/* DELETE MEDIA                                                        */
/* ------------------------------------------------------------------ */
export const deleteMediaByPlacement = async (
  placement: MediaPlacement
): Promise<ApiResponse<null>> => {
  await requireAdmin();

  const media = await Media.findOne({ placement });
  if (!media) return { success: false, message: "Media not found" };

  try {
    // Delete from Cloudinary
    if (media.type === "image" && media.imageUrl) await deleteFromCloudinary(media.imageUrl);
    if (media.type === "video" && media.publicId)
      await deleteFromCloudinaryByPublicId(media.publicId, "video");

    // Delete from MongoDB
    await Media.deleteOne({ _id: media._id });

    return { success: true, message: "Media deleted successfully" };
  } catch (err) {
    console.error("Error deleting media:", err);
    return { success: false, message: "Failed to delete media" };
  }
};

/* ------------------------------------------------------------------ */
/* GET ALL ACTIVE MEDIA (public)                                        */
/* ------------------------------------------------------------------ */
export const getAllMedia = async (): Promise<ApiResponse<AnyMediaItem[]>> => {
  try {
    const media = await Media.find({ isActive: true }).sort({ createdAt: 1 });
    return {
      success: true,
      message: "Media fetched successfully",
      data: media.map(mapMediaToFrontend),
    };
  } catch (err) {
    console.error("Error fetching media:", err);
    return { success: false, message: "Failed to fetch media" };
  }
};
