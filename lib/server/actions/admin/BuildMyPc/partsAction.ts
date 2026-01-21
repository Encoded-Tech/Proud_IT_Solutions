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




/** ---------- HELPERS ---------- */
function toNumber(value: FormDataEntryValue | null) {
  if (value === null || value === "" || value === "undefined") return undefined;
  const num = Number(value);
  return isNaN(num) ? undefined : num;
}

function toString(value: FormDataEntryValue | null) {
  if (value === null || value === "" || value === "undefined") return undefined;
  return value.toString().trim();
}

/** ---------- CREATE PART ---------- */
export async function createPartOption(formData: FormData) {
  try {
    await requireAdmin();
    await connectDB();

    // --- Validate Part Type ---
    const typeRaw = formData.get("type");
    const type = toString(typeRaw);
    if (!type || !PART_TYPES.includes(type as PartType)) {
      throw new Error(`Invalid part type: ${type}`);
    }

    // --- Validate Name ---
    const name = toString(formData.get("name"));
    if (!name) throw new Error("Part name is required");

    // --- Image Upload ---
   const imageFile = formData.get("imageFile");

let imageUrl: string | undefined;

if (imageFile instanceof Blob && imageFile.size > 0) {
  imageUrl = await uploadToCloudinary(imageFile);
}


    // --- Build Part Data ---
    const partData: Partial<IPartOption> = {
      name,
      type: type as PartType,
      brand: toString(formData.get("brand")),
      modelName: toString(formData.get("modelName")),
      price: toNumber(formData.get("price")),
      wattage: toNumber(formData.get("wattage")),
      lengthMM: toNumber(formData.get("lengthMM")),
      capacityGB: toNumber(formData.get("capacityGB")),
      socket: toString(formData.get("socket")),
      chipset: toString(formData.get("chipset")),
      imageUrl,
      isActive: formData.get("isActive") === "true",
    };

    // --- Enum Fields Validation ---
    const ramType = toString(formData.get("ramType"));
    if (ramType === "DDR4" || ramType === "DDR5") partData.ramType = ramType;

    const storageType = toString(formData.get("storageType"));
    if (storageType === "ssd" || storageType === "nvme" || storageType === "hdd")
      partData.storageType = storageType;

    console.log("Creating part with data:", partData);

    const part = await PartOption.create(partData);

    // --- Revalidate Next.js Path ---
    revalidatePath("/admin/build-user-pc/parts-table");

    return { success: true, message: "Part option created successfully", data: mapPartOption(part) };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to create part option:", msg);
    return { success: false, message: `Failed to create part option: ${msg}` };
  }
}

/** ---------- UPDATE PART ---------- */
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

if (imageFile instanceof Blob && imageFile.size > 0) {
  if (part.imageUrl) {
    await deleteFromCloudinary(part.imageUrl);
  }
  part.imageUrl = await uploadToCloudinary(imageFile);
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





