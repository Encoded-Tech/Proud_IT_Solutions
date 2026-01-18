import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_FOLDER,
} from "@/config/env";
import { v2 as cloudinary, UploadApiOptions } from "cloudinary";

/* ------------------------------------------------------------------ */
/* Cloudinary config (same keys work for images, videos, raw files)    */
/* ------------------------------------------------------------------ */
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

/* ------------------------------------------------------------------ */
/* INTERNAL helper – shared uploader (DO NOT export)                   */
/* ------------------------------------------------------------------ */
const uploadBase64ToCloudinary = async (
  file: File,
  options: UploadApiOptions
) => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64File = buffer.toString("base64");

  return cloudinary.uploader.upload(
    `data:${file.type};base64,${base64File}`,
    options
  );
};

/* ------------------------------------------------------------------ */
/* PUBLIC: Generic uploader (USED EVERYWHERE – images, pdfs, etc.)    */
/* ------------------------------------------------------------------ */
export const uploadToCloudinary = async (
  file: File,
  folder: string = CLOUDINARY_FOLDER
): Promise<string> => {
  try {
    const result = await uploadBase64ToCloudinary(file, {
      folder,
      resource_type: file.type === "application/pdf" ? "raw" : "auto",
    });

    console.info("Cloudinary upload success:", result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error("Error in uploadToCloudinary:", error);
    throw error;
  }
};

/* ------------------------------------------------------------------ */
/* PUBLIC: IMAGE delete (legacy, URL-based – keep for existing usage)  */
/* ------------------------------------------------------------------ */
export const deleteFromCloudinary = async (
  imageUrl: string
): Promise<void> => {
  try {
    const parts = imageUrl.split("/");
    if (parts.length < 2) {
      throw new Error("Invalid image URL format");
    }

    const folderAndFilename = parts.slice(-2).join("/");
    const publicId = folderAndFilename.split(".")[0];

    await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });

    console.info("Image deleted from Cloudinary:", publicId);
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    throw error;
  }
};

/* ------------------------------------------------------------------ */
/* PUBLIC: VIDEO upload (ADMIN / PROMOTIONAL USE)                      */
/* ------------------------------------------------------------------ */
export const uploadVideoToCloudinary = async (
  file: File,
  folder: string = "media/videos"
): Promise<{
  videoUrl: string;
  publicId: string;
}> => {
  try {
    if (!file.type.startsWith("video/")) {
      throw new Error("Invalid file type. Only video files are allowed.");
    }

    const result = await uploadBase64ToCloudinary(file, {
      folder,
      resource_type: "video",
    });

    console.info("Video uploaded to Cloudinary:", result.secure_url);

    return {
      videoUrl: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("Error uploading video to Cloudinary:", error);
    throw error;
  }
};

/* ------------------------------------------------------------------ */
/* PUBLIC: STANDARD delete by publicId (BEST PRACTICE)                 */
/* ------------------------------------------------------------------ */
export const deleteFromCloudinaryByPublicId = async (
  publicId: string,
  resourceType: "image" | "video" = "image"
): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    console.info(
      `Deleted ${resourceType} from Cloudinary:`,
      publicId
    );
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw error;
  }
};
