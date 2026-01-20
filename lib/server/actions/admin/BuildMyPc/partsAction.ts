"use server";

import { deleteFromCloudinary, uploadToCloudinary } from "@/config/cloudinary";
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

function toNumber(value: FormDataEntryValue | null) {
  if (value === null || value === "") return undefined;
  const num = Number(value);
  return isNaN(num) ? undefined : num;
}


export async function createPartOption(formData: FormData) {
  await requireAdmin();
  await connectDB();

  const imageFile = formData.get("imageFile") as File | null;
  let imageUrl: string | undefined;

  if (imageFile && imageFile.size > 0) {
    imageUrl = await uploadToCloudinary(imageFile);
  }

  const part = await PartOption.create({
    name: formData.get("name"),
    type: formData.get("type"),
    brand: formData.get("brand"),
    modelName: formData.get("modelName"),

    price: toNumber(formData.get("price")), // REQUIRED
    wattage: toNumber(formData.get("wattage")),
    lengthMM: toNumber(formData.get("lengthMM")),
    capacityGB: toNumber(formData.get("capacityGB")),

    socket: formData.get("socket") || undefined,
    chipset: formData.get("chipset") || undefined,
    ramType: formData.get("ramType") || undefined,
 storageType: ["ssd","nvme","hdd"].includes(formData.get("storageType") as string)
  ? formData.get("storageType")
  : undefined,
    isActive: formData.get("isActive") === "true",
    imageUrl,
  });

  revalidatePath("/admin/build-user-pc/parts-table");

  return {
    success: true,
    message: "Part option created successfully",
    data: mapPartOption(part),
  };
}


/** ---------- UPDATE ---------- */
export async function updatePartOption(id: string, formData: FormData) {
  await requireAdmin();
  await connectDB();

  if (!Types.ObjectId.isValid(id)) {
    return { success: false, message: "Invalid part option ID" };
  }

  const part = await PartOption.findById(id);
  if (!part) {
    return { success: false, message: "Part option not found" };
  }

  const imageFile = formData.get("imageFile") as File | null;

  if (imageFile) {
    if (part.imageUrl) {
      await deleteFromCloudinary(part.imageUrl);
    }
    part.imageUrl = await uploadToCloudinary(imageFile);
  }

  // Update scalar fields safely
  const fields: (keyof PartOptionInput)[] = [
    "name",
    "type",
    "brand",
    "price",
    "modelName",
    "socket",
    "chipset",
    "ramType",
    "wattage",
    "lengthMM",
    "storageType",
    "capacityGB",
    "isActive",
  ];
fields.forEach((field) => {
  const value = formData.get(field);

  if (value === null || value === "") return;

  part[field] =
    field === "price" ||
    field === "wattage" ||
    field === "lengthMM" ||
    field === "capacityGB"
      ? Number(value)
      : field === "isActive"
      ? value === "true"
      : value;
});

  await part.save();
  revalidatePath("/admin/build-user-pc/parts-table");

  return {
    success: true,
    message: "Part option updated successfully",
    data: mapPartOption(part),
  };
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





