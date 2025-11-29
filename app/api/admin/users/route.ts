import { withDB } from "@/lib/HOF";
import { withAuth } from "@/lib/HOF/withAuth";
import UserModel from "@/models/userModel";
import { ApiResponse } from "@/types/api";
import {  NextResponse } from "next/server";

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "user" | "admin";
  image: string | null;
  failedLoginAttempts: number;
  lockUntil: Date | null;
  loginHistory: {
    ip: string;
    userAgent: string;
    at: Date;
  }[];
  isLocked: boolean;
  lastLogin: Date | null;
  signupIP: string | null;
  createdAt: Date;
  provider: string;
}

export const GET = withAuth(
  withDB(async () => {
    const users = await UserModel.find()
      .select("+lockUntil +loginHistory +hardLock +lockCount +lastLockTime +provider")
      .sort({ createdAt: -1 });
  
    const hasUsers = users.length > 0;
  
    // Format to admin-safe user objects
    const formatted: AdminUser[] = users.map((u) => ({
      _id: u._id.toString(),
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      image: u.image,
      provider: u.provider,
      failedLoginAttempts: u.failedLoginAttempts,
      lockUntil: u.lockUntil,
      isLocked: u.isLocked,       
      hardLock: u.hardLock,             
      lockCount: u.lockCount,            
      lastLockTime: u.lastLockTime,     
      loginHistory: u.loginHistory,      
      lastLogin: u.lastLogin,
      signupIP: u.signupIP,
      createdAt: u.createdAt,
    }));
  
    const response: ApiResponse<AdminUser[]> = {
      success: hasUsers,
      message: hasUsers ? "Users fetched successfully" : "No users found",
      data: formatted,
      status: hasUsers ? 200 : 404,
    };
  
    return NextResponse.json(response, { status: response.status });
  }, { resourceName: "admin" }),
  { roles: ["admin"] }
)
