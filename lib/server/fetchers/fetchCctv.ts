"use server";

import { cacheLife, cacheTag } from "next/cache";
import { connectDB } from "@/db";
import { requireUser } from "@/lib/auth/requireSession";
import {
  CctvInstallationRequest,
  CctvPart,
  ICctvInstallationRequest,
  ICctvPart,
} from "@/models/cctvInstallationModel";
import {
  CctvInstallationRequestMapped,
  CctvPartMapped,
  mapCctvInstallationRequest,
  mapCctvInstallationRequests,
  mapCctvParts,
} from "@/lib/server/mappers/MapCctv";
import { Types } from "mongoose";

export async function fetchPublicCctvParts(): Promise<{
  success: boolean;
  message: string;
  data: CctvPartMapped[];
}> {
  "use cache";

  cacheLife("minutes");
  cacheTag("cctv-parts");

  try {
    await connectDB();
    const parts = await CctvPart.find({ isActive: true })
      .select("name type brand modelName description price imageUrl isRequired isActive")
      .sort({ type: 1, name: 1 })
      .lean<ICctvPart[]>();

    return {
      success: true,
      message: "CCTV parts fetched successfully",
      data: mapCctvParts(parts),
    };
  } catch (error) {
    console.error("FETCH_PUBLIC_CCTV_PARTS_ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch CCTV parts",
      data: [],
    };
  }
}

export async function fetchMyCctvInstallationRequests(): Promise<{
  success: boolean;
  message: string;
  data: CctvInstallationRequestMapped[];
}> {
  try {
    const user = await requireUser();
    await connectDB();

    const requests = await CctvInstallationRequest.find({
      user: new Types.ObjectId(user.id),
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .lean<ICctvInstallationRequest[]>();

    return {
      success: true,
      message: "CCTV installation requests fetched successfully",
      data: mapCctvInstallationRequests(requests),
    };
  } catch (error) {
    console.error("FETCH_MY_CCTV_REQUESTS_ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch CCTV installation requests",
      data: [],
    };
  }
}

export async function fetchMyCctvInstallationRequestById(
  id: string
): Promise<{
  success: boolean;
  message: string;
  data: CctvInstallationRequestMapped | null;
}> {
  try {
    const user = await requireUser();
    if (!Types.ObjectId.isValid(id)) {
      return { success: false, message: "Invalid CCTV request id", data: null };
    }

    await connectDB();
    const request = await CctvInstallationRequest.findOne({
      _id: id,
      user: new Types.ObjectId(user.id),
    })
      .populate("user", "name email")
      .lean<ICctvInstallationRequest>();

    if (!request) {
      return { success: false, message: "CCTV request not found", data: null };
    }

    return {
      success: true,
      message: "CCTV installation request fetched successfully",
      data: mapCctvInstallationRequest(request),
    };
  } catch (error) {
    console.error("FETCH_MY_CCTV_REQUEST_ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch CCTV installation request",
      data: null,
    };
  }
}

export async function getMyCctvInstallationCount() {
  const user = await requireUser();
  await connectDB();
  const cctvCount = await CctvInstallationRequest.countDocuments({ user: user.id });

  return { cctvCount };
}
