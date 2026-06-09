"use server";

import { connectDB } from "@/db";
import { requireUser } from "@/lib/auth/requireSession";
import { CctvInstallationRequest, CctvPart } from "@/models/cctvInstallationModel";
import { Types } from "mongoose";
import { revalidatePath } from "next/cache";
import { mapCctvInstallationRequest } from "@/lib/server/mappers/MapCctv";

export interface SubmitCctvItemInput {
  partId: string;
  quantity: number;
  notes?: string;
}

export interface SubmitCctvInstallationInput {
  items: SubmitCctvItemInput[];
  customerDetails: {
    name: string;
    phone: string;
    email: string;
    siteAddress: string;
    notes?: string;
  };
}

export async function submitCctvInstallationRequest(input: SubmitCctvInstallationInput) {
  try {
    const user = await requireUser();
    await connectDB();

    if (!input.items?.length) {
      return { success: false, message: "Select at least one CCTV item" };
    }

    const requiredFields = [
      input.customerDetails?.name,
      input.customerDetails?.phone,
      input.customerDetails?.email,
      input.customerDetails?.siteAddress,
    ];

    if (requiredFields.some((field) => !field?.trim())) {
      return { success: false, message: "Please complete customer and site details" };
    }

    const normalizedItems = input.items
      .filter((item) => Types.ObjectId.isValid(item.partId))
      .map((item) => ({
        partId: item.partId,
        quantity: Number(item.quantity),
        notes: item.notes?.trim(),
      }))
      .filter((item) => Number.isInteger(item.quantity) && item.quantity > 0);

    if (normalizedItems.length === 0) {
      return { success: false, message: "Invalid CCTV item selection" };
    }

    const partIds = normalizedItems.map((item) => new Types.ObjectId(item.partId));
    const parts = await CctvPart.find({ _id: { $in: partIds }, isActive: true })
      .select("name type price imageUrl")
      .lean<
        {
          _id: Types.ObjectId;
          name: string;
          type: string;
          price: number;
          imageUrl?: string;
        }[]
      >();

    const partById = new Map(parts.map((part) => [part._id.toString(), part]));

    if (partById.size !== normalizedItems.length) {
      return {
        success: false,
        message: "One or more CCTV items are unavailable. Please refresh and try again.",
      };
    }

    let subtotal = 0;
    const requestItems = normalizedItems.map((item) => {
      const part = partById.get(item.partId)!;
      const unitPrice = part.price ?? 0;
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;

      return {
        part: part._id,
        type: part.type,
        name: part.name,
        imageUrl: part.imageUrl,
        quantity: item.quantity,
        unitPrice,
        lineTotal,
        notes: item.notes,
      };
    });

    const request = await CctvInstallationRequest.create({
      user: new Types.ObjectId(user.id),
      items: requestItems,
      customerDetails: {
        name: input.customerDetails.name.trim(),
        phone: input.customerDetails.phone.trim(),
        email: input.customerDetails.email.trim(),
        siteAddress: input.customerDetails.siteAddress.trim(),
        notes: input.customerDetails.notes?.trim(),
      },
      subtotal,
      grandTotal: subtotal,
      status: "pending",
      paymentStatus: "pending",
    });

    revalidatePath("/account/cctv-installations");
    revalidatePath("/admin/cctv-install/orders");

    return {
      success: true,
      message: "CCTV installation request submitted",
      data: mapCctvInstallationRequest(request),
    };
  } catch (error) {
    console.error("SUBMIT_CCTV_INSTALLATION_ERROR:", error);
    return { success: false, message: "Failed to submit CCTV installation request" };
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
