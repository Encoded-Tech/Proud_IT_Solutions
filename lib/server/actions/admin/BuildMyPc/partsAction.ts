"use server";

import { deleteFromCloudinary, uploadToCloudinary } from "@/config/cloudinary";
import { connectDB } from "@/db";
import { requireAdmin } from "@/lib/auth/requireSession";
import { mapPartOption, mapPartOptionsArray } from "@/lib/server/mappers/MapPartsOption";
import { IPartOption, PartOption } from "@/models/partsOption";
import { Types } from "mongoose";


export interface PartOptionInput {
  name: string;
  type: IPartOption["type"];
  brand?: string;
  modelName?: string;
  price?: number;
  socket?: string;
  chipset?: string;
  ramType?: "DDR4" | "DDR5";
  wattage?: number;
  lengthMM?: number;
  storageType?: string;
  capacityGB?: number;
  imageFile?: File; // 🔥 New field for image upload
  isActive?: boolean;
}

/** ---------- CREATE ---------- */
export async function createPartOption(input: PartOptionInput) {
  try {
    await requireAdmin();
    await connectDB();

    let imageUrl: string | undefined;
    if (input.imageFile) {
      imageUrl = await uploadToCloudinary(input.imageFile, "part-options");
    }

    const partData = {
      ...input,
      imageUrl, // ✅ match schema field
      isActive: input.isActive ?? true,
    };

 

    const part = await PartOption.create(partData);

    return {
      success: true,
      message: "Part option created successfully",
      data: mapPartOption(part),
    };
  } catch (error) {
    console.error("createPartOption error:", error);
    return { success: false, message: "Failed to create part option" };
  }
}

/** ---------- UPDATE ---------- */
export async function updatePartOption(
  id: string,
  input: Partial<PartOptionInput>
) {
  try {
    await requireAdmin();
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return { success: false, message: "Invalid part option ID" };
    }

    const part = await PartOption.findById(id);
    if (!part) return { success: false, message: "Part option not found" };

    // Handle image update
    if (input.imageFile) {
      // Delete old image if exists
      if (part.image) await deleteFromCloudinary(part.image);
      // Upload new image
      const imageUrl = await uploadToCloudinary(input.imageFile, "part-options");
      part.image = imageUrl;
    }

    // Type-safe update for other fields
    (Object.keys(input) as (keyof PartOptionInput)[]).forEach((key) => {
      if (key !== "imageFile") { // already handled
        const value = input[key];
        if (value !== undefined) part[key] = value;
      }
    });

    await part.save();

    return {
      success: true,
      message: "Part option updated successfully",
      data: mapPartOption(part),
    };
  } catch (error) {
    console.error("updatePartOption error:", error);
    return { success: false, message: "Failed to update part option" };
  }
}

/** ---------- DELETE ---------- */
export async function deletePartOption(id: string) {
  try {
    await requireAdmin();
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return { success: false, message: "Invalid part option ID" };
    }

    const part = await PartOption.findById(id);
    if (!part) return { success: false, message: "Part option not found" };

    // Delete image if exists
    if (part.image) await deleteFromCloudinary(part.image);

    await part.deleteOne();

    return {
      success: true,
      message: "Part option deleted successfully",
      data: { id },
    };
  } catch (error) {
    console.error("deletePartOption error:", error);
    return { success: false, message: "Failed to delete part option" };
  }
}

/** ---------- FETCH ALL ---------- */
export async function fetchPartOptions(activeOnly = true) {
  try {
    await connectDB();
    const query = activeOnly ? { isActive: true } : {};
    const parts = await PartOption.find(query).sort({ name: 1 }).lean<IPartOption[]>();

    return {
      success: true,
      message: "Part options fetched successfully",
      data: mapPartOptionsArray(parts),
    };
  } catch (error) {
    console.error("fetchPartOptions error:", error);
    return { success: false, message: "Failed to fetch part options", data: [] };
  }
}
