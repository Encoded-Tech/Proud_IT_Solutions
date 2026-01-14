"use server";

import { connectDB } from "@/db";
import { requireUser } from "@/lib/auth/requireSession";
import { BuildRequest,} from "@/models/buildMyPcModel";
import { mapBuildRequest, mapBuildRequests } from "../mappers/MapBuildMyPc";
import { Types, isValidObjectId } from "mongoose";
import { IBuildRequestMapped } from "../mappers/MapBuildMyPc";


export const fetchBuildRequestById = async (
  id: string
): Promise<{ success: boolean; message: string; data: IBuildRequestMapped | null }> => {
  try {
    const user = await requireUser();
    if (!isValidObjectId(id)) {
      return { success: false, message: "Invalid build request id", data: null };
    }

    await connectDB();
    const buildRequest = await BuildRequest.findOne({
      _id: id,
      user: user.id,
    }).populate("user", "_id name email");

    if (!buildRequest) {
      return { success: false, message: "Build request not found", data: null };
    }

    return {
      success: true,
      message: "Build request fetched successfully",
      data: mapBuildRequest(buildRequest),
    };
  } catch (error) {
    console.error("fetchBuildRequestById error:", error);
    return { success: false, message: "Failed to fetch build request", data: null };
  }
};

/** ----------------------------- */
export const fetchBuildRequests = async (): Promise<{
  success: boolean;
  message: string;
  data: IBuildRequestMapped[];
}> => {
  try {
    // 1️⃣ Get current user
    const user = await requireUser(); // throws if not authenticated
    await connectDB();

    // 2️⃣ Query build requests for this user only
    const docs = await BuildRequest.find({ user: new Types.ObjectId(user.id) })
      .populate("user", "_id name email")
      .sort({ createdAt: -1 });

    // 3️⃣ Map the data to IBuildRequestMapped
    return {
      success: true,
      message: "Your build requests fetched successfully",
      data: mapBuildRequests(docs),
    };
  } catch (error) {
    console.error("fetchBuildRequests error:", error);
    return {
      success: false,
      message: "Failed to fetch build requests",
      data: [],
    };
  }
};


export async function getMyBuildCount() {
  const user = await requireUser();
  const buildCount  = await BuildRequest.countDocuments({ user: user.id });
  return {
     buildCount,
  };
}