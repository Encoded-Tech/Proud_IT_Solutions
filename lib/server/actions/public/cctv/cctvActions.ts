"use server";

import { auth } from "@/auth";
import { connectDB } from "@/db";
import { requireUser } from "@/lib/auth/requireSession";
import { CctvInstallationRequest } from "@/models/cctvInstallationModel";
import { Types } from "mongoose";
import { revalidatePath } from "next/cache";

export interface SubmitCctvItemInput {
  partId?: unknown;
  productId?: unknown;
  itemId?: unknown;
  categoryId?: unknown;
  name?: unknown;
  type?: unknown;
  quantity?: unknown;
  unitPrice?: unknown;
  notes?: unknown;
}

export interface SubmitCctvInstallationInput {
  items: SubmitCctvItemInput[];
  customerDetails: {
    name?: unknown;
    phone?: unknown;
    email?: unknown;
    siteAddress?: unknown;
    address?: unknown;
    notes?: unknown;
  };
  requestKey?: unknown;
}

const cleanString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const cleanId = (value: unknown) => String(value ?? "").trim();

export async function submitCctvInstallationRequest(input: SubmitCctvInstallationInput) {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user?.id) {
      return { success: false, message: "Please login before submitting CCTV request." };
    }

    if (!user.emailVerified) {
      return { success: false, message: "Please verify your email before submitting CCTV request." };
    }

    if (!["user", "admin"].includes(user.role)) {
      return { success: false, message: "You are not allowed to submit CCTV requests." };
    }

    const userId = cleanId(user.id);
    if (!Types.ObjectId.isValid(userId)) {
      return { success: false, message: "Invalid user session. Please login again." };
    }

    const items = Array.isArray(input?.items) ? input.items : [];
    const customerDetails = input?.customerDetails;
    const requestKey = cleanId(input?.requestKey);

    if (!items.length) {
      return { success: false, message: "Select at least one CCTV item" };
    }

    const customerName = cleanString(customerDetails?.name);
    const customerPhone = cleanString(customerDetails?.phone);
    const customerEmail = cleanString(customerDetails?.email);
    const siteAddress =
      cleanString(customerDetails?.siteAddress) || cleanString(customerDetails?.address);

    const requiredFields = [
      customerName,
      customerPhone,
      customerEmail,
      siteAddress,
    ];

    if (requiredFields.some((field) => !field)) {
      return { success: false, message: "Please complete customer and site details" };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return { success: false, message: "Please enter a valid email address" };
    }

    if (requestKey && requestKey.length > 120) {
      return { success: false, message: "Invalid CCTV request key" };
    }

    const mergedItemsMap = new Map<string, { partId: string; quantity: number }>();

    for (const item of items) {
      const partId = cleanId(item.partId || item.productId || item.itemId || item.categoryId);
      const fallbackKey = cleanString(item.name);
      const itemKey = (partId || fallbackKey).trim();
      const quantity = Number(item.quantity);

      if (!itemKey || !Types.ObjectId.isValid(partId)) {
        return { success: false, message: "Invalid CCTV item selection" };
      }

      if (!Number.isInteger(quantity) || quantity <= 0) {
        return { success: false, message: "CCTV item quantity must be a positive number" };
      }

      const existing = mergedItemsMap.get(partId);
      if (existing) {
        existing.quantity += quantity;
      } else {
        mergedItemsMap.set(partId, { partId, quantity });
      }
    }

    const normalizedItems = Array.from(mergedItemsMap.values());

    if (normalizedItems.length === 0) {
      return { success: false, message: "Invalid CCTV item selection" };
    }

    console.log("[submitCctvInstallationRequest] payload summary:", {
      customerEmail,
      itemCount: normalizedItems.length,
    });

    return {
      success: true,
      message: "CCTV installation request is ready for checkout.",
      requestKey,
      itemCount: normalizedItems.length,
    };
  } catch (error) {
    console.error("[submitCctvInstallationRequest] failed:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to submit CCTV installation request.",
    };
  }
}

export async function deleteCctvInstallationRequest(id: string) {
  try {
    const user = await requireUser();
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return { success: false, message: "Invalid CCTV request id" };
    }

    const request = await CctvInstallationRequest.findOne({
      _id: id,
      user: new Types.ObjectId(user.id),
    });

    if (!request) {
      return { success: false, message: "CCTV installation request not found" };
    }

    if (!["pending", "cancelled"].includes(request.status)) {
      return {
        success: false,
        message: "Only pending CCTV installation requests can be deleted",
      };
    }

    await request.deleteOne();
    revalidatePath("/account/cctv-installations");

    return { success: true, message: "CCTV installation request deleted" };
  } catch (error) {
    console.error("DELETE_CCTV_INSTALLATION_ERROR:", error);
    return { success: false, message: "Failed to delete CCTV installation request" };
  }
}
