"use server";

import { FilterQuery, Types } from "mongoose";
import { revalidatePath } from "next/cache";



import { BuildRequest, IBuildRequest } from "@/models/buildMyPcModel";

import { requireAdmin } from "@/lib/auth/requireSession";
import { connectDB } from "@/db";
import { IBuildRequestMapped, mapBuildRequest, mapBuildRequests } from "@/lib/server/mappers/MapBuildUserPc";
import userModel from "@/models/userModel";






/** ----------------------------------
 * FILTER TYPES
 * ---------------------------------*/
export interface AdminBuildFilters {
  status?: IBuildRequest["status"];
  compatibilityStatus?: "pending" | "passed" | "failed";
  search?: string;
  page?: number;
  limit?: number;
}

/** ----------------------------------
 * GET ALL BUILDS (FILTERED)
 * ---------------------------------*/
export async function adminGetAllBuildRequests(
  filters: AdminBuildFilters = {}
): Promise<{
  data: IBuildRequestMapped[];
  total: number;
  page: number;
  pages: number;
}> {
  await requireAdmin();
  await connectDB();

  try {
    const {
      status,
      compatibilityStatus,
      search,
      page = 1,
      limit = 10,
    } = filters;

    /** -----------------------------
     * BUILD QUERY
     * ----------------------------*/
    const query: FilterQuery<IBuildRequest> = {};

    if (status) {
      query.status = status;
    }

    if (compatibilityStatus) {
      query.compatibilityStatus = compatibilityStatus;
    }

    /** SEARCH (user name/email) */
 if (search && search.trim()) {
  // Step 1: Find users matching the search
  const matchingUsers = await userModel.find({
    $or: [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ],
  }).select("_id");

  // Step 2: Get their IDs
  const userIds = matchingUsers.map((user) => user._id);

  // Step 3: Query builds with those user IDs
  if (userIds.length > 0) {
    query.user = { $in: userIds };
  } else {
    // No users found = no results
    return { data: [], total: 0, page, pages: 0 };
  }
}

    /** -----------------------------
     * DB FETCH
     * ----------------------------*/
    const skip = (page - 1) * limit;

    const [builds, total] = await Promise.all([
      BuildRequest.find(query)
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      BuildRequest.countDocuments(query),
    ]);

    return {
      data: mapBuildRequests(builds),
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("ADMIN_GET_BUILDS_ERROR:", error);
    throw new Error("Failed to fetch build requests");
  }
}



export async function adminGetBuildRequestById(
  buildId: string
): Promise<IBuildRequestMapped | null> {
  await requireAdmin();
  await connectDB();

  try {
    if (!Types.ObjectId.isValid(buildId)) {
      throw new Error("Invalid build request id");
    }

    const build = await BuildRequest.findById(buildId)
      .populate("user", "name email");

    if (!build) return null;

    return mapBuildRequest(build);
  } catch (error) {
    console.error("ADMIN_GET_BUILD_ERROR:", error);
    throw new Error("Failed to fetch build request");
  }
}


type BuildStatus =
  | "submitted"
  | "reviewed"
  | "approved"
  | "rejected"
  | "checked_out";

export async function adminUpdateBuildStatus(
  buildId: string,
  status: BuildStatus
): Promise<void> {
  await requireAdmin();
  await connectDB();

  try {
    if (!Types.ObjectId.isValid(buildId)) {
      throw new Error("Invalid build request id");
    }

    const updated = await BuildRequest.findByIdAndUpdate(
      buildId,
      { status },
      { new: true }
    );

    if (!updated) {
      throw new Error("Build request not found");
    }

    revalidatePath("/admin/build-requests");
  } catch (error) {
    console.error("ADMIN_UPDATE_STATUS_ERROR:", error);
    throw new Error("Failed to update build status");
  }
}

export async function adminApproveBuild(
  buildId: string
): Promise<void> {
  await requireAdmin();
  await connectDB();

  try {
    if (!Types.ObjectId.isValid(buildId)) {
      throw new Error("Invalid build request id");
    }

    const updated = await BuildRequest.findByIdAndUpdate(
      buildId,
      { status: "approved" },
      { new: true }
    );

    if (!updated) {
      throw new Error("Build request not found");
    }

    revalidatePath("/admin/build-requests");
  } catch (error) {
    console.error("ADMIN_APPROVE_BUILD_ERROR:", error);
    throw new Error("Failed to approve build request");
  }
}


export async function adminRejectBuild(
  buildId: string,
  notes?: string
): Promise<void> {
  await requireAdmin();
  await connectDB();

  try {
    if (!Types.ObjectId.isValid(buildId)) {
      throw new Error("Invalid build request id");
    }

    const updated = await BuildRequest.findByIdAndUpdate(
      buildId,
      {
        status: "rejected",
        adminNotes: notes,
      },
      { new: true }
    );

    if (!updated) {
      throw new Error("Build request not found");
    }

    revalidatePath("/admin/build-requests");
  } catch (error) {
    console.error("ADMIN_REJECT_BUILD_ERROR:", error);
    throw new Error("Failed to reject build request");
  }
}


export async function adminUpdateCompatibility(
  buildId: string,
  status: "passed" | "failed"
): Promise<void> {
  await requireAdmin();
  await connectDB();

  try {
    if (!Types.ObjectId.isValid(buildId)) {
      throw new Error("Invalid build request id");
    }

    const updated = await BuildRequest.findByIdAndUpdate(
      buildId,
      {
        compatibilityStatus: status,
        compatibilityPassed: status === "passed",
      },
      { new: true }
    );

    if (!updated) {
      throw new Error("Build request not found");
    }

    revalidatePath("/admin/build-requests");
  } catch (error) {
    console.error("ADMIN_COMPATIBILITY_ERROR:", error);
    throw new Error("Failed to update compatibility");
  }
}


export async function adminUpdateBuildNotes(
  buildId: string,
  notes: string
): Promise<void> {
  await requireAdmin();
  await connectDB();

  try {
    if (!Types.ObjectId.isValid(buildId)) {
      throw new Error("Invalid build request id");
    }

    const updated = await BuildRequest.findByIdAndUpdate(
      buildId,
      { adminNotes: notes },
      { new: true }
    );

    if (!updated) {
      throw new Error("Build request not found");
    }

    revalidatePath("/admin/build-requests");
  } catch (error) {
    console.error("ADMIN_NOTES_ERROR:", error);
    throw new Error("Failed to update admin notes");
  }
}


export async function adminMarkBuildCheckedOut(
  buildId: string,
  orderId: string
): Promise<void> {
  await requireAdmin();
  await connectDB();

  try {
    if (
      !Types.ObjectId.isValid(buildId) ||
      !Types.ObjectId.isValid(orderId)
    ) {
      throw new Error("Invalid id provided");
    }

    const updated = await BuildRequest.findByIdAndUpdate(
      buildId,
      {
        status: "checked_out",
        orderId: new Types.ObjectId(orderId),
      },
      { new: true }
    );

    if (!updated) {
      throw new Error("Build request not found");
    }

    revalidatePath("/admin/build-requests");
  } catch (error) {
    console.error("ADMIN_CHECKOUT_ERROR:", error);
    throw new Error("Failed to mark build as checked out");
  }
}
