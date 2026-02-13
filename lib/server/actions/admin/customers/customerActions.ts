// lib/server/admin/getAllUsers.ts
"use server";

import { connectDB } from "@/db";
import { requireAdmin } from "@/lib/auth/requireSession";
import { mapUserToAdminDTO } from "@/lib/server/mappers/MapUserForAdmin";
import User, { IUser } from "@/models/userModel";
import { FilterQuery, Document } from "mongoose";

export interface GetUsersFilters {
  search?: string; // search by name, email, phone
  role?: "user" | "admin";
  hardLock?: boolean;
  emailVerified?: boolean;
}

export interface GetUsersOptions {
  page?: number;
  limit?: number;
  sortBy?: "newest" | "oldest" | "lastLogin";
}

// DTO returned to admin
export interface AdminUsersResponse {
  success: boolean;
  message: string;
  data: ReturnType<typeof mapUserToAdminDTO>[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function getAllUsersAdmin(
  filters: GetUsersFilters = {},
  options: GetUsersOptions = {}
): Promise<AdminUsersResponse> {
  await connectDB();
  await requireAdmin();

  try {
    // Fully typed filter for Mongoose
    const query: FilterQuery<IUser & Document> = {};

    // Search filter (name, email, phone)
    if (filters.search) {
      const regex = new RegExp(filters.search, "i");
      query.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
      ] as FilterQuery<IUser & Document>[]; // type-safe
    }

    // Role filter
    if (filters.role) query.role = filters.role;

    // Hard lock filter
    if (filters.hardLock !== undefined) query.hardLock = filters.hardLock;

    // Email verified filter
    if (filters.emailVerified !== undefined) query.emailVerified = filters.emailVerified;

    // Pagination
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 6;
    const skip = (page - 1) * limit;

    // Sorting
    let sort: Record<string, 1 | -1> = { createdAt: -1 }; // default newest
    if (options.sortBy === "oldest") sort = { createdAt: 1 };
    if (options.sortBy === "lastLogin") sort = { lastLogin: -1 };

    // Use .exec() for proper Promise typing
    const totalCount: number = await User.countDocuments(query).exec();
    const users: IUser[] = await User.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();

    const mappedUsers = users.map(mapUserToAdminDTO);

    return {
      success: true,
      message: "Users fetched successfully",
      data: mappedUsers,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      success: false,
      message: "Error fetching users",
      data: [],
      pagination: { total: 0, page: 1, limit: 0, totalPages: 0 },
    };
  }
}


// lib/server/admin/resetUserHardLock.ts

import { Types } from "mongoose";

export interface ResetHardLockResponse {
  success: boolean;
  message: string;
  userId?: string;
}

export async function resetUserHardLock(userId: string): Promise<ResetHardLockResponse> {
  await connectDB();
  await requireAdmin();

  try {
    if (!Types.ObjectId.isValid(userId)) {
      return { success: false, message: "Invalid user ID" };
    }

    const user: IUser | null = await User.findById(userId).exec();

    if (!user) {
      return { success: false, message: "User not found" };
    }

    if (!user.hardLock) {
      return { success: false, message: "User is not hard-locked" };
    }

    // Reset all lock fields
    user.hardLock = false;
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    user.lockCount = 0;
    user.lastLockTime = null;

    await user.save();

    return {
      success: true,
      message: "User hard lock has been reset successfully",
      userId: user._id.toString(),
    };
  } catch (error) {
    console.error("Error resetting hard lock:", error);
    return {
      success: false,
      message: "Failed to reset user hard lock",
    };
  }
}
