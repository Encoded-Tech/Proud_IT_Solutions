"use server";

import { requireUser } from "@/lib/auth/requireSession";
import { connectDB } from "@/db";
import { BuildRequest, CPUBrand, GPUBrand, OSBrand, UseCase } from "@/models/buildMyPcModel";
import { mapBuildRequest } from "../../../mappers/MapBuildMyPc";



export interface BuildMyPcInput {
  id?: string;
  name?: string;
  phone?: string;
  email?: string;
  budgetNPR?: number;
  uses?: UseCase[];
  targetResolution?: string;
  targetFPS?: number;
  cpuPreference?: CPUBrand;
  cpuModel?: string;
  gpuPreference?: GPUBrand;
  gpuModel?: string;
  ramGB?: number;
  ramType?: string;
  osPreference?: OSBrand;
  rgbPreference?: boolean;
  smallFormFactor?: boolean;
  storage?: {
    nvme?: boolean;
    ssdGB?: number;
    hddGB?: number;
  };
  peripherals?: {
    monitor?: boolean;
    keyboard?: boolean;
    mouse?: boolean;
    ups?: boolean;
  };
}


interface SubmitBuildMyPcResult {
  success: boolean;
  message: string;
  data?: ReturnType<typeof mapBuildRequest>;
}

export async function submitBuildMyPc(
  input: Omit<BuildMyPcInput, "id"> & { uses: UseCase[] }
): Promise<SubmitBuildMyPcResult> {
  try {
    const user = await requireUser();
  await connectDB();

  if (!input.budgetNPR || input.budgetNPR <= 0) {
    return { success: false, message: "Invalid budget amount" };
  }

  if (!input.uses || input.uses.length === 0) {
    return { success: false, message: "At least one use case is required" };
  }

  const buildRequest = await BuildRequest.create({
    userId: user.id,
    status: "submitted", // 🔥 explicit
    ...input,
  });

  return {
    success: true,
    message: "Build request submitted successfully",
    data: mapBuildRequest(buildRequest),
  };
  } catch (error) {
    console.error("submitBuildMyPc error:", error);
    return {
      success: false,
      message: "Failed to submit build request",
    };
    
  }
}

type UpdatableField = keyof Omit<BuildMyPcInput, "id">;



export async function updateBuildMyPc(
  input: Required<Pick<BuildMyPcInput, "id">> &
    Partial<Omit<BuildMyPcInput, "id">>
) {
  try {
    const user = await requireUser();
    await connectDB();

    const { id, ...data } = input;

    const buildRequest = await BuildRequest.findOne({
      _id: id,
      userId: user.id,
    });

    if (!buildRequest) {
      return {
        success: false,
        message: "No build request found for this user",
      };
    }

    /** 🔥 LOCK AFTER QUOTE */
    if (
      ["quoted", "awaiting-payment", "building", "ready", "delivered"].includes(
        buildRequest.status!
      )
    ) {
      return {
        success: false,
        message: "This build can no longer be edited",
      };
    }

    const allowedFields: UpdatableField[] = [
      "name",
      "phone",
      "email",
      "budgetNPR",
      "uses",
      "targetResolution",
      "targetFPS",
      "cpuPreference",
      "cpuModel",
      "gpuPreference",
      "gpuModel",
      "ramGB",
      "ramType",
      "osPreference",
      "rgbPreference",
      "smallFormFactor",
      "storage",
      "peripherals",
    ];

    allowedFields.forEach((key) => {
      if (data[key] !== undefined) {
        buildRequest.set(key, data[key]);
      }
    });

    await buildRequest.save();

    return {
      success: true,
      message: "Build request updated successfully",
      data: mapBuildRequest(buildRequest),
    };
  } catch (error) {
    console.error("updateBuildMyPc error:", error);
    return {
      success: false,
      message: "Failed to update build request",
    };
  }
}



export async function deleteBuildMyPc(id: string) {
  try {
    const user = await requireUser();
  await connectDB();

  const buildRequest = await BuildRequest.findOne({
    _id: id,
    userId: user.id,
  });

  if (!buildRequest) {
    return {
      success: false,
      message: `No build request found for this user`,
    };
  }

  /** 🔥 DO NOT DELETE AFTER PAYMENT */
  if (
    ["awaiting-payment", "building", "ready", "delivered"].includes(
      buildRequest.status!
    )
  ) {
    return {
      success: false,
      message: "This build request can no longer be deleted",
    };
  }

  await buildRequest.deleteOne();

  return {
    success: true,
    message: "Build request deleted successfully",
    data: { id },
  };
  } catch (error) {
    console.error("deleteBuildMyPc error:", error);
    return {
      success: false,
      message: "Failed to delete build request",
    };
    
  }
}
