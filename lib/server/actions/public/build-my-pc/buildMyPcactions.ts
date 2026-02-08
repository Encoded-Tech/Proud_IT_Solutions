 // your actual PartOption model
"use server";



import { Types } from "mongoose";
import { requireUser } from "@/lib/auth/requireSession";
import { connectDB } from "@/db";
import { BuildRequest, IBuildRequest, IBuildPart } from "@/models/buildMyPcModel";
import { IBuildRequestMapped, mapBuildRequest } from "@/lib/server/mappers/MapBuildMyPc";
import { PartOption } from "@/models/partsOption";


/** INPUT TYPES */
export interface BuildPartInput {
  partId: string;
  type: string;
  name: string;
  price: number;
  imageUrl?: string;
  quantity?: number;
}

export interface SubmitBuildRequestInput {
  parts: BuildPartInput[];
  subtotal: number;
  grandTotal: number;
  adminNotes?: string;
}

export interface UpdateBuildRequestInput {
  id: string;
  parts?: BuildPartInput[];
  subtotal?: number;
  grandTotal?: number;
  status?: "draft" | "submitted" | "reviewed" | "approved" | "rejected" | "checked_out";
  adminNotes?: string;
  compatibilityPassed?: boolean;
  compatibilityStatus?: "pending" | "passed" | "failed";
}

interface CompatibilityResult {
  passed: boolean;
  status: "passed" | "failed";
  errors: string[];
}

export const checkRealWorldCompatibility = async (
  parts: BuildPartInput[]
): Promise<CompatibilityResult> => {
  const errors: string[] = [];

  // Fetch full part details from DB (socket, RAM type, PSU wattage, etc.)
  const partIds = parts.map((p) => p.partId);
  const dbParts = await PartOption.find({ _id: { $in: partIds } }).lean();

  const cpu = dbParts.find((p) => p.type === "processor");
  const motherboard = dbParts.find((p) => p.type === "motherboard");
  const gpu = dbParts.find((p) => p.type === "gpu");
  const ram = dbParts.find((p) => p.type === "ram");
  const psu = dbParts.find((p) => p.type === "psu");
  const casePart = dbParts.find((p) => p.type === "case");
  const storage = dbParts.filter((p) => ["nvme", "ssd", "hdd"].includes(p.type));

  // ------------------ CPU ↔ Motherboard ------------------
  if (cpu && motherboard && cpu.socket !== motherboard.socket) {
    errors.push(`CPU socket (${cpu.socket}) is incompatible with motherboard socket (${motherboard.socket})`);
  }

  // ------------------ RAM ↔ Motherboard ------------------
  if (ram && motherboard && ram.ramType !== motherboard.ramType) {
    errors.push(`RAM type (${ram.ramType}) is incompatible with motherboard (${motherboard.ramType})`);
  }

  // ------------------ PSU Wattage ------------------
  if (psu && cpu && gpu) {
    const estimatedPower = (cpu.tdp || 65) + (gpu.tdp || 150) + 50; // +50W for rest
    if (psu.wattage < estimatedPower) {
      errors.push(`PSU wattage (${psu.wattage}W) is insufficient for CPU+GPU estimated power (${estimatedPower}W)`);
    }
  }

  // ------------------ Case ↔ Motherboard Form Factor ------------------
  if (casePart && motherboard && casePart.formFactor !== motherboard.formFactor) {
    errors.push(`Case (${casePart.formFactor}) is incompatible with motherboard (${motherboard.formFactor})`);
  }

  // ------------------ NVMe Storage ------------------
  if (motherboard && storage.some((s) => s.type === "nvme") && !motherboard.nvmeSlots) {
    errors.push(`Motherboard does not support NVMe but build includes NVMe drive`);
  }

  // ------------------ Duplicate Components ------------------
  const componentCounts: Record<string, number> = {};
  for (const p of parts) {
    componentCounts[p.type] = (componentCounts[p.type] || 0) + 1;
  }
  for (const [type, count] of Object.entries(componentCounts)) {
    if (["processor", "gpu"].includes(type) && count > 1) {
      errors.push(`Multiple ${type.toUpperCase()} detected (${count}), only one allowed`);
    }
  }

  return {
    passed: errors.length === 0,
    status: errors.length === 0 ? "passed" : "failed",
    errors,
  };
};


/** ----------------------------- */
/** SUBMIT BUILD REQUEST */
export const submitBuildRequest = async (
  input: SubmitBuildRequestInput
): Promise<{ success: boolean; message: string; data?: IBuildRequestMapped }> => {
  try {
    const user = await requireUser();
    await connectDB();

    if (!input.parts || input.parts.length === 0) {
      return { success: false, message: "At least one part is required" };
    }

    // Calculate compatibility
    const { passed, status } = await checkRealWorldCompatibility(input.parts);

    const buildRequest = await BuildRequest.create({
      user: new Types.ObjectId(user.id),
      parts: input.parts.map((p) => ({
        part: new Types.ObjectId(p.partId),
        type: p.type,
        name: p.name,
        price: p.price,
        imageUrl: p.imageUrl,
        quantity: p.quantity ?? 1,
      })) as IBuildPart[],
      subtotal: input.subtotal,
      grandTotal: input.grandTotal,
      adminNotes: input.adminNotes,
      status: "submitted",
      compatibilityPassed: passed,
      compatibilityStatus: status,
    });

    return { success: true, message: "Build request submitted", data: mapBuildRequest(buildRequest) };
  } catch (error) {
    console.error("submitBuildRequest error:", error);
    return { success: false, message: "Failed to submit build request" };
  }
};

/** ----------------------------- */
/** UPDATE BUILD REQUEST */
export const updateBuildRequest = async (
  input: UpdateBuildRequestInput
): Promise<{ success: boolean; message: string; data?: IBuildRequestMapped }> => {
  try {
    const user = await requireUser();
    await connectDB();

    const buildRequest = await BuildRequest.findOne({
      _id: input.id,
      user: new Types.ObjectId(user.id),
    });

    if (!buildRequest) {
      return { success: false, message: "Build request not found" };
    }

    const updateData: Partial<IBuildRequest> = {};

    if (input.parts) {
      updateData.parts = input.parts.map((p) => ({
        part: new Types.ObjectId(p.partId),
        type: p.type,
        name: p.name,
        price: p.price,
        imageUrl: p.imageUrl,
        quantity: p.quantity ?? 1,
      })) as IBuildPart[];

      // Recalculate compatibility
      const { passed, status } = await checkRealWorldCompatibility(input.parts);
      updateData.compatibilityPassed = passed;
      updateData.compatibilityStatus = status;
    }

  
    if (input.subtotal !== undefined) updateData.subtotal = input.subtotal;
    if (input.grandTotal !== undefined) updateData.grandTotal = input.grandTotal;
    if (input.status) updateData.status = input.status;
    if (input.adminNotes !== undefined) updateData.adminNotes = input.adminNotes;
    if (input.compatibilityPassed !== undefined) updateData.compatibilityPassed = input.compatibilityPassed;
    if (input.compatibilityStatus) updateData.compatibilityStatus = input.compatibilityStatus;

    Object.assign(buildRequest, updateData);

    await buildRequest.save();

    return { success: true, message: "Build request updated", data: mapBuildRequest(buildRequest) };
  } catch (error) {
    console.error("updateBuildRequest error:", error);
    return { success: false, message: "Failed to update build request" };
  }
};

/** ----------------------------- */
/** DELETE BUILD REQUEST */
export const deleteBuildRequest = async (
  id: string
): Promise<{ success: boolean; message: string; data?: { id: string } }> => {
  try {
    const user = await requireUser();
    await connectDB();

   const buildRequest = await BuildRequest.findOne({
  _id: new Types.ObjectId(id), // make sure ID is ObjectId
  user: user.id, // if user is already stored as ObjectId, just pass it
});
    if (!buildRequest) {
      return { success: false, message: "Build request not found" };
    }

    await buildRequest.deleteOne();

    return { success: true, message: "Build request deleted", data: { id } };
  } catch (error) {
    console.error("deleteBuildRequest error:", error);
    return { success: false, message: "Failed to delete build request" };
  }
};


