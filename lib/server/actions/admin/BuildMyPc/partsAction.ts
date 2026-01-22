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


/** ---------- UPDATE ---------- */
// export async function updatePartOption(id: string, formData: FormData) {
//   await requireAdmin();
//   await connectDB();

//   if (!Types.ObjectId.isValid(id)) {
//     return { success: false, message: "Invalid part option ID" };
//   }

//   const part = await PartOption.findById(id);
//   if (!part) {
//     return { success: false, message: "Part option not found" };
//   }

//   const imageFile = formData.get("imageFile") as File | null;

//   if (imageFile) {
//     if (part.imageUrl) {
//       await deleteFromCloudinary(part.imageUrl);
//     }
//     part.imageUrl = await uploadToCloudinary(imageFile);
//   }

//   // Update scalar fields safely
//   const fields: (keyof PartOptionInput)[] = [
//     "name",
//     "type",
//     "brand",
//     "price",
//     "modelName",
//     "socket",
//     "chipset",
//     "ramType",
//     "wattage",
//     "lengthMM",
//     "storageType",
//     "capacityGB",
//     "isActive",
//   ];
// fields.forEach((field) => {
//   const value = formData.get(field);

//   if (value === null || value === "") return;

//   part[field] =
//     field === "price" ||
//     field === "wattage" ||
//     field === "lengthMM" ||
//     field === "capacityGB"
//       ? Number(value)
//       : field === "isActive"
//       ? value === "true"
//       : value;
// });

//   await part.save();
//   revalidatePath("/admin/build-user-pc/parts-table");

//   return {
//     success: true,
//     message: "Part option updated successfully",
//     data: mapPartOption(part),
//   };
// }
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

if (imageFile instanceof File && imageFile.size > 0) {
  try {
    if (part.imageUrl) {
      await deleteFromCloudinary(part.imageUrl);
    }

    part.imageUrl = await uploadToCloudinary(imageFile, "part-image");
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
    return { success: false, message: "Failed to upload image" };
  }
}


    // --- Update Scalar Fields ---
    const updateFields: Partial<IPartOption> = {};
    const fields: (keyof IPartOption)[] = [
      "name", "type", "brand", "modelName", "price",
      "wattage", "lengthMM", "capacityGB", "socket",
      "chipset", "ramType", "storageType", "isActive"
    ];

    fields.forEach((field) => {
      const raw = formData.get(field);
      if (raw === null || raw === "" || raw === "undefined") return;

      switch (field) {
        case "price":
        case "wattage":
        case "lengthMM":
        case "capacityGB":
          const num = toNumber(raw);
          if (num !== undefined) updateFields[field] = num;
          break;
        case "isActive":
          updateFields[field] = raw === "true";
          break;
        case "type":
          const typeVal = toString(raw);
          if (typeVal && PART_TYPES.includes(typeVal as PartType)) updateFields.type = typeVal as PartType;
          break;
        case "ramType":
          const ram = toString(raw);
          if (ram === "DDR4" || ram === "DDR5") updateFields.ramType = ram;
          break;
        case "storageType":
          const st = toString(raw);
          if (st === "ssd" || st === "nvme" || st === "hdd") updateFields.storageType = st;
          break;
        default:
          const val = toString(raw);
          if (val) updateFields[field] = val;
      }
    });

    Object.assign(part, updateFields);

    await part.save();
    revalidatePath("/admin/build-user-pc/parts-table");

    return { success: true, message: "Part option updated successfully", data: mapPartOption(part) };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to update part option:", msg);
    return { success: false, message: `Failed to update part option: ${msg}` };
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





