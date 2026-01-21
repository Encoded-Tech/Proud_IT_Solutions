"use server";

import { deleteFromCloudinary, uploadToCloudinary } from "@/config/cloudinary";
import { PART_TYPES, PartType } from "@/constants/part";
import { connectDB } from "@/db";
import { requireAdmin } from "@/lib/auth/requireSession";
import { mapPartOption, mapPartOptionsArray } from "@/lib/server/mappers/MapPartsOption";
import { IPartOption, PartOption, } from "@/models/partsOption";
import { Types } from "mongoose";
import { revalidatePath } from "next/cache";


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

// function toNumber(value: FormDataEntryValue | null) {
//   if (value === null || value === "") return undefined;
//   const num = Number(value);
//   return isNaN(num) ? undefined : num;
// }


// export async function createPartOption(formData: FormData) {
//   await requireAdmin();
//   await connectDB();

//   const imageFile = formData.get("imageFile") as File | null;
//   let imageUrl: string | undefined;

//   if (imageFile && imageFile.size > 0) {
//     imageUrl = await uploadToCloudinary(imageFile);
//   }

//  const typeValue = (formData.get("type") as string); 
// if (!typeValue || !PART_TYPES.includes(typeValue as PartType)) {
//   throw new Error("Invalid part type");
// }

// const part = await PartOption.create({
//   name: formData.get("name"),
//   type: typeValue as PartType, // now safe
//   brand: formData.get("brand"),
//   modelName: formData.get("modelName"),
//   price: toNumber(formData.get("price")),
//   wattage: toNumber(formData.get("wattage")),
//   lengthMM: toNumber(formData.get("lengthMM")),
//   capacityGB: toNumber(formData.get("capacityGB")),
//   socket: formData.get("socket") || undefined,
//   chipset: formData.get("chipset") || undefined,
//   ramType: formData.get("ramType") || undefined,
//   storageType: ["ssd","nvme","hdd"].includes(formData.get("storageType") as string)
//     ? formData.get("storageType")
//     : undefined,
//   isActive: formData.get("isActive") === "true",
//   imageUrl,
// });

//   revalidatePath("/admin/build-user-pc/parts-table");

//   return {
//     success: true,
//     message: "Part option created successfully",
//     data: mapPartOption(part),
//   };
// }



function toNumber(value: FormDataEntryValue | null) {
  if (value === null || value === "" || value === "undefined") return undefined;
  const num = Number(value);
  return isNaN(num) ? undefined : num;
}

function toString(value: FormDataEntryValue | null) {
  if (value === null || value === "" || value === "undefined") return undefined;
  return value.toString();
}

export async function createPartOption(formData: FormData) {
  try {
    await requireAdmin();
    await connectDB();

    const imageFile = formData.get("imageFile") as File | null;
    let imageUrl: string | undefined;

    if (imageFile && imageFile.size > 0) {
      imageUrl = await uploadToCloudinary(imageFile);
    }

  const typeValue = formData.get("type");

if (!typeValue || !PART_TYPES.includes(typeValue as PartType)) {
  throw new Error(`Invalid part type: ${typeValue}`);
}



    // Get all form values with proper validation
    const name = toString(formData.get("name"));
    if (!name) {
      throw new Error("Name is required");
    }

    const type = typeValue as PartType;
    
    // Only set compatibility fields that are relevant
    const partData: Partial<IPartOption> = {
      name,
      type,
      brand: toString(formData.get("brand")),
      modelName: toString(formData.get("modelName")),
      price: toNumber(formData.get("price")),
      imageUrl,
      isActive: formData.get("isActive") === "true",
    };

    // Only set compatibility fields if they have valid values
    const wattage = toNumber(formData.get("wattage"));
    const lengthMM = toNumber(formData.get("lengthMM"));
    const capacityGB = toNumber(formData.get("capacityGB"));
    const socket = toString(formData.get("socket"));
    const chipset = toString(formData.get("chipset"));
    const ramType = toString(formData.get("ramType"));
    const storageType = toString(formData.get("storageType"));

    if (wattage !== undefined) partData.wattage = wattage;
    if (lengthMM !== undefined) partData.lengthMM = lengthMM;
    if (capacityGB !== undefined) partData.capacityGB = capacityGB;
    if (socket !== undefined) partData.socket = socket;
    if (chipset !== undefined) partData.chipset = chipset;
    
    // Only set enum fields if they match allowed values
    if (ramType === "DDR4" || ramType === "DDR5") {
      partData.ramType = ramType;
    }
    
    if (storageType === "ssd" || storageType === "nvme" || storageType === "hdd") {
      partData.storageType = storageType;
    }

 

    const part = await PartOption.create(partData);

    revalidatePath("/admin/build-user-pc/parts-table");

    return {
      success: true,
      message: "Part option created successfully",
      data: mapPartOption(part),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error creating part option:", errorMessage);
    throw new Error(`Failed to create part option: ${errorMessage}`);
  }
}


export async function updatePartOption(id: string, formData: FormData) {
  try {
    await requireAdmin();
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return { success: false, message: "Invalid part option ID" };
    }

    const part = await PartOption.findById(id);
    if (!part) {
      return { success: false, message: "Part option not found" };
    }

    // --- Image Handling ---
    const imageFile = formData.get("imageFile");
    if (imageFile && imageFile instanceof File && imageFile.size > 0) {
      if (part.imageUrl) {
        await deleteFromCloudinary(part.imageUrl);
      }
      part.imageUrl = await uploadToCloudinary(imageFile);
    }

    // --- Update other fields safely ---
    const updateFields: Partial<IPartOption> = {};

    const name = formData.get("name")?.toString();
    if (name) updateFields.name = name;

    const type = formData.get("type")?.toString();
    if (type && PART_TYPES.includes(type as PartType)) updateFields.type = type as PartType;

    const brand = formData.get("brand")?.toString();
    if (brand) updateFields.brand = brand;

    const modelName = formData.get("modelName")?.toString();
    if (modelName) updateFields.modelName = modelName;

    const price = Number(formData.get("price"));
    if (!isNaN(price)) updateFields.price = price;

    const wattage = Number(formData.get("wattage"));
    if (!isNaN(wattage)) updateFields.wattage = wattage;

    const lengthMM = Number(formData.get("lengthMM"));
    if (!isNaN(lengthMM)) updateFields.lengthMM = lengthMM;

    const capacityGB = Number(formData.get("capacityGB"));
    if (!isNaN(capacityGB)) updateFields.capacityGB = capacityGB;

    const socket = formData.get("socket")?.toString();
    if (socket) updateFields.socket = socket;

    const chipset = formData.get("chipset")?.toString();
    if (chipset) updateFields.chipset = chipset;

    const ramType = formData.get("ramType")?.toString();
    if (ramType === "DDR4" || ramType === "DDR5") updateFields.ramType = ramType;

    const storageType = formData.get("storageType")?.toString();
    if (storageType === "ssd" || storageType === "nvme" || storageType === "hdd") updateFields.storageType = storageType;

    const isActive = formData.get("isActive");
    if (isActive !== null) updateFields.isActive = isActive === "true";

    // Assign all safely
    Object.assign(part, updateFields);

    await part.save();
    revalidatePath("/admin/build-user-pc/parts-table");

    return {
      success: true,
      message: "Part option updated successfully",
      data: mapPartOption(part),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to update part option:", errorMessage);
    return { success: false, message: `Failed to update part option: ${errorMessage}` };
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
    if (part.imageUrl) await deleteFromCloudinary(part.imageUrl);

    await part.deleteOne();
    revalidatePath("/admin/build-user-pc/parts-table");


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
  } catch (err) {
    console.error("fetchPartOptions error:", err);
 return { success: false, message: "Failed to fetch part options", data: [] };
  }
}





