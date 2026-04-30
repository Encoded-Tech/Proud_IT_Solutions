"use server";
import { deleteFromCloudinary, deleteFromCloudinaryByPublicId, uploadToCloudinary, uploadVideoToCloudinary } from "@/config/cloudinary";
import { requireAdmin } from "@/lib/auth/requireSession";
import { mapMediaToFrontend } from "@/lib/server/mappers/MapMedia";
import { Media } from "@/models/promotionModel";

import { AnyMediaItem, MediaPlacement, MEDIA_PLACEMENTS } from "@/types/media";
import { revalidatePath, revalidateTag } from "next/cache";


interface ApiResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
}

interface MediaParams {
  file?: File;
  placement: MediaPlacement;
}

function isValidPlacement(value: string): value is MediaPlacement {
  return (MEDIA_PLACEMENTS as readonly string[]).includes(value);
}

function revalidateMediaTags() {
  revalidatePath("/admin/posts");
  revalidatePath("/");
  revalidateTag("homepage", "max");
  revalidateTag("promotions", "max");
  revalidateTag("media", "max");
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

  if (!isValidPlacement(placement)) {
    return { success: false, message: "Invalid media placement selected." };
  }

  const isImageFile = file.type.startsWith("image/");
  const isVideoFile = file.type.startsWith("video/");

  if (!isImageFile && !isVideoFile) {
    return {
      success: false,
      message: "Unsupported media type. Please upload an image or video file.",
    };
  }

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

    revalidateMediaTags();

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

  if (!isValidPlacement(placement)) {
    return { success: false, message: "Invalid media placement selected." };
  }

  let uploadedImageUrl: string | null = null;
  let uploadedVideo: { videoUrl: string; publicId: string } | null = null;

  try {
    const existing = await Media.findOne({ placement });
    if (!existing) return { success: false, message: "No media found for this placement" };

    const uploadedType = file
      ? file.type.startsWith("image/")
        ? "image"
        : file.type.startsWith("video/")
          ? "video"
          : null
      : null;

    if (file && !uploadedType) {
      return {
        success: false,
        message: "Unsupported media type. Please upload an image or video file.",
      };
    }

    if (uploadedType && uploadedType !== existing.type) {
      return {
        success: false,
        message: "Media type cannot be changed for an existing placement. Upload the same file type.",
      };
    }

    // Upload new file first
    if (file) {
      if (uploadedType === "image") {
        uploadedImageUrl = await uploadToCloudinary(file);
      } else if (uploadedType === "video") {
        uploadedVideo = await uploadVideoToCloudinary(file);
      }
    }


    // Delete old Cloudinary file
    if (existing.type === "image" && existing.imageUrl) await deleteFromCloudinary(existing.imageUrl);
    if (existing.type === "video" && existing.publicId)
      await deleteFromCloudinaryByPublicId(existing.publicId, "video");

    // Update DB
    if (existing.type === "image") {
      existing.imageUrl = uploadedImageUrl ?? existing.imageUrl;
      existing.videoUrl = undefined;
      existing.publicId = undefined;
    }

    if (existing.type === "video") {
      if (uploadedVideo) {
        existing.videoUrl = uploadedVideo.videoUrl;
        existing.publicId = uploadedVideo.publicId;
      }
      existing.imageUrl = undefined;
    }

    await existing.save();
    revalidateMediaTags();

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
    revalidateMediaTags();

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
    return { success: false, message: "Failed to fetch media", data: []};
  }
};
