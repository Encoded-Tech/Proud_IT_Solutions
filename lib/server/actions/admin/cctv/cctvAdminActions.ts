"use server";

import { deleteFromCloudinary, uploadToCloudinary } from "@/config/cloudinary";
import { CCTV_PART_TYPES, CctvPartType } from "@/constants/cctv";
import { connectDB } from "@/db";
import { requireAdmin } from "@/lib/auth/requireSession";
import {
  CctvInstallationRequest,
  CctvInstallationStatus,
  CctvPart,
  ICctvInstallationRequest,
  ICctvPart,
} from "@/models/cctvInstallationModel";
import { FilterQuery, Types } from "mongoose";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  CctvInstallationRequestMapped,
  CctvPartMapped,
  mapCctvInstallationRequest,
  mapCctvInstallationRequests,
  mapCctvPart,
  mapCctvParts,
} from "@/lib/server/mappers/MapCctv";
import userModel from "@/models/userModel";

export interface CctvPartInput {
  name: string;
  type: CctvPartType;
  brand?: string;
  modelName?: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isRequired?: boolean;
  isActive?: boolean;
}

export interface AdminCctvFilters {
  status?: CctvInstallationStatus;
  search?: string;
  page?: number;
  limit?: number;
}

function toString(value: FormDataEntryValue | null) {
  if (value === null || value === "" || value === "undefined") return undefined;
  return value.toString();
}

function toNumber(value: FormDataEntryValue | null) {
  if (value === null || value === "" || value === "undefined") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parsePartForm(formData: FormData): CctvPartInput {
  const name = toString(formData.get("name"));
  const type = toString(formData.get("type"));
  const price = toNumber(formData.get("price"));

  if (!name) throw new Error("Name is required");
  if (!type || !CCTV_PART_TYPES.includes(type as CctvPartType)) {
    throw new Error("Invalid CCTV item type");
  }
  if (price === undefined || price < 0) throw new Error("Price must be zero or greater");

  return {
    name,
    type: type as CctvPartType,
    brand: toString(formData.get("brand")),
    modelName: toString(formData.get("modelName")),
    description: toString(formData.get("description")),
    price,
    isRequired: formData.get("isRequired") === "true",
    isActive: formData.get("isActive") !== "false",
  };
}

export async function createCctvPart(formData: FormData): Promise<{
  success: boolean;
  message: string;
  data?: CctvPartMapped;
}> {
  try {
    await requireAdmin();
    await connectDB();

    const partData = parsePartForm(formData);
    const imageFile = formData.get("imageFile");
    let imageUrl: string | undefined;

    if (imageFile instanceof File && imageFile.size > 0) {
      imageUrl = await uploadToCloudinary(imageFile, "cctv-parts");
    }

    const part = await CctvPart.create({ ...partData, imageUrl });

    revalidatePath("/admin/cctv-install/parts");
    revalidatePath("/install-cctv");
    revalidateTag("cctv-parts", "max");

    return {
      success: true,
      message: "CCTV item created successfully",
      data: mapCctvPart(part),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create CCTV item";
    console.error("CREATE_CCTV_PART_ERROR:", message);
    return { success: false, message };
  }
}

export async function updateCctvPart(
  id: string,
  formData: FormData
): Promise<{
  success: boolean;
  message: string;
  data?: CctvPartMapped;
}> {
  try {
    await requireAdmin();
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return { success: false, message: "Invalid CCTV item id" };
    }

    const part = await CctvPart.findById(id);
    if (!part) return { success: false, message: "CCTV item not found" };

    const partData = parsePartForm(formData);
    const imageFile = formData.get("imageFile");

    if (imageFile instanceof File && imageFile.size > 0) {
      if (part.imageUrl) await deleteFromCloudinary(part.imageUrl);
      partData.imageUrl = await uploadToCloudinary(imageFile, "cctv-parts");
    }

    Object.assign(part, partData);
    await part.save();

    revalidatePath("/admin/cctv-install/parts");
    revalidatePath("/install-cctv");
    revalidateTag("cctv-parts", "max");

    return {
      success: true,
      message: "CCTV item updated successfully",
      data: mapCctvPart(part),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update CCTV item";
    console.error("UPDATE_CCTV_PART_ERROR:", message);
    return { success: false, message };
  }
}

export async function deleteCctvPart(id: string) {
  try {
    await requireAdmin();
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return { success: false, message: "Invalid CCTV item id" };
    }

    const part = await CctvPart.findById(id);
    if (!part) return { success: false, message: "CCTV item not found" };

    if (part.imageUrl) await deleteFromCloudinary(part.imageUrl);
    await part.deleteOne();

    revalidatePath("/admin/cctv-install/parts");
    revalidatePath("/install-cctv");
    revalidateTag("cctv-parts", "max");

    return { success: true, message: "CCTV item deleted successfully", data: { id } };
  } catch (error) {
    console.error("DELETE_CCTV_PART_ERROR:", error);
    return { success: false, message: "Failed to delete CCTV item" };
  }
}

export async function fetchCctvPartsAdmin(activeOnly = false): Promise<{
  success: boolean;
  message: string;
  data: CctvPartMapped[];
}> {
  try {
    await requireAdmin();
    await connectDB();

    const query = activeOnly ? { isActive: true } : {};
    const parts = await CctvPart.find(query)
      .select("name type brand modelName description price imageUrl isRequired isActive")
      .sort({ type: 1, name: 1 })
      .lean<ICctvPart[]>();

    return {
      success: true,
      message: "CCTV items fetched successfully",
      data: mapCctvParts(parts),
    };
  } catch (error) {
    console.error("FETCH_CCTV_PARTS_ADMIN_ERROR:", error);
    return { success: false, message: "Failed to fetch CCTV items", data: [] };
  }
}

export async function adminGetCctvInstallationRequests(
  filters: AdminCctvFilters = {}
): Promise<{
  data: CctvInstallationRequestMapped[];
  total: number;
  page: number;
  pages: number;
}> {
  await requireAdmin();
  await connectDB();

  const { status, search, page = 1, limit = 10 } = filters;
  const query: FilterQuery<ICctvInstallationRequest> = {};

  if (status) query.status = status;

  if (search?.trim()) {
    const matchingUsers = await userModel
      .find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      })
      .select("_id")
      .lean<{ _id: Types.ObjectId }[]>();

    const userIds = matchingUsers.map((user) => user._id);
    query.$or = [
      { "customerDetails.name": { $regex: search, $options: "i" } },
      { "customerDetails.email": { $regex: search, $options: "i" } },
      { "customerDetails.phone": { $regex: search, $options: "i" } },
      { "items.name": { $regex: search, $options: "i" } },
      ...(userIds.length ? [{ user: { $in: userIds } }] : []),
    ];
  }

  const skip = (page - 1) * limit;
  const [requests, total] = await Promise.all([
    CctvInstallationRequest.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean<ICctvInstallationRequest[]>(),
    CctvInstallationRequest.countDocuments(query),
  ]);

  return {
    data: mapCctvInstallationRequests(requests),
    total,
    page,
    pages: Math.ceil(total / limit),
  };
}

export async function adminUpdateCctvInstallationRequest(input: {
  id: string;
  status?: CctvInstallationStatus;
  paymentStatus?: "pending" | "submitted" | "paid" | "failed";
  adminRemarks?: string;
}) {
  try {
    await requireAdmin();
    await connectDB();

    if (!Types.ObjectId.isValid(input.id)) {
      return { success: false, message: "Invalid CCTV request id" };
    }

    const update: Partial<ICctvInstallationRequest> = {};
    if (input.status) update.status = input.status;
    if (input.paymentStatus) update.paymentStatus = input.paymentStatus;
    if (input.adminRemarks !== undefined) update.adminRemarks = input.adminRemarks;

    const request = await CctvInstallationRequest.findByIdAndUpdate(input.id, update, {
      new: true,
    });

    if (!request) return { success: false, message: "CCTV request not found" };

    revalidatePath("/admin/cctv-install/orders");
    revalidatePath("/account/cctv-installations");

    return {
      success: true,
      message: "CCTV installation request updated",
      data: mapCctvInstallationRequest(request),
    };
  } catch (error) {
    console.error("ADMIN_UPDATE_CCTV_REQUEST_ERROR:", error);
    return { success: false, message: "Failed to update CCTV installation request" };
  }
}

export async function adminDeleteCctvInstallationRequests(ids: string[]) {
  try {
    await requireAdmin();
    await connectDB();

    const validIds = [...new Set(ids.filter((id) => Types.ObjectId.isValid(id)))];
    if (!validIds.length) {
      return { success: false, message: "No valid CCTV requests selected" };
    }

    const result = await CctvInstallationRequest.deleteMany({
      _id: { $in: validIds.map((id) => new Types.ObjectId(id)) },
    });

    revalidatePath("/admin/cctv-install/orders");

    return {
      success: true,
      message: `${result.deletedCount || 0} CCTV request${(result.deletedCount || 0) === 1 ? "" : "s"} deleted`,
    };
  } catch (error) {
    console.error("ADMIN_DELETE_CCTV_REQUESTS_ERROR:", error);
    return { success: false, message: "Failed to delete CCTV requests" };
  }
}
