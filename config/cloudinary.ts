import { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME, CLOUDINARY_FOLDER } from "@/config/env"
import {
    v2 as cloudinary,
    UploadApiOptions,
  } from "cloudinary"
  
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  })
  
  // Upload a file to Cloudinary
  export const uploadToCloudinary = async (
    file: File,
    folder: string = CLOUDINARY_FOLDER
  ): Promise<string> => {
    try {
  
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const base64File = buffer.toString("base64")

  
      const uploadConfig: UploadApiOptions = {
        folder,
        resource_type: file.type === "application/pdf" ? "raw" : "auto"
      }
  
      const result = await cloudinary.uploader.upload(
        `data:${file.type};base64,${base64File}`,
        uploadConfig
      )
  
      console.info("Cloudinary upload success:", result.secure_url)
      return result.secure_url
    } catch (error) {
      console.error("Error in uploadToCloudinary:", error)
      throw error
    }
  }
  
  // Delete a file from Cloudinary
  export const deleteFromCloudinary = async (imageUrl: string): Promise<void> => {
    try {
      const parts = imageUrl.split("/")
      if (parts.length < 2) {
        throw new Error("Invalid image URL format")
      }
  
      const folderAndFilename = parts.slice(-2).join("/")
      const publicId = folderAndFilename.split(".")[0]
  
      await cloudinary.uploader.destroy(publicId)
      console.info("Successfully deleted from Cloudinary:", publicId)
    } catch (error) {
      console.error("Error deleting from Cloudinary:", error)
      throw error
    }
  }
   