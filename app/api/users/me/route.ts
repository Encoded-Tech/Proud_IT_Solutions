import { NextRequest, NextResponse } from "next/server";
import UserModel, { IUser } from "@/models/userModel";
import { withAuth } from "@/lib/HOF/withAuth";
import { withDB } from "@/lib/HOF";

import {  getAuthUserId } from "@/lib/auth/getAuthUser";
import { deleteFromCloudinary, uploadToCloudinary } from "@/config/cloudinary";
import { ApiResponse } from "@/types/api";

const exclusions = {
  password: 0,
  provider: 0,
  providerId: 0,
  emailVerified: 0,
  failedLoginAttempts: 0,
  hardLock: 0,
  lockCount: 0,
  lastLockTime: 0,
  lastLogin: 0,
  signupIP: 0,
  loginHistory: 0,
  isLocked: 0,
  role: 0,
};

//total apis
//user-get-me api/users/me  
//user-update-me api/users/me

// user-get-me api/users/me
export const GET = withAuth(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  withDB(async (req: NextRequest, context?) => {
       const id = await getAuthUserId(req);
    const dbUser = await UserModel.findById(id)
      .select(exclusions);

      const isUser = !!dbUser;

      const response: ApiResponse<IUser> = {
        success: isUser,
        message: isUser ? `User  ${dbUser.name} fetched successfully` : "User not found",
        data: dbUser,
        status: isUser ? 200 : 404
      }
      return NextResponse.json(response, { status: response.status })

    
  }, { resourceName: "user" })
);

// user-update-me api/users/me
export const PUT = withAuth(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  withDB(async (req: NextRequest, context?) => {
    const id = await getAuthUserId(req);

    const formData = await req.formData();

    const name = formData.get("name")?.toString();
    const phone = formData.get("phone")?.toString();
    const imageFile = formData.get("image") as File | null;

      // Address comes as JSON string
    const addressRaw = formData.get("address")?.toString();
    const parsedAddress = addressRaw ? JSON.parse(addressRaw) : null;

    const user = await UserModel.findById(id)
      .select(exclusions);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;

     /* ---------------- ADDRESS (MERGE, NOT REPLACE) ---------------- */
    if (parsedAddress && typeof parsedAddress === "object") {
      user.address = {
        ...(user.address?.toObject?.() ?? {}),
        ...parsedAddress,
      };
    }

    if (imageFile && imageFile.size > 0) {
      if (user.image) {
        await deleteFromCloudinary(user.image);
      }

      const uploadedUrl = await uploadToCloudinary(imageFile);
      user.image = uploadedUrl;
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  }, { resourceName: "user" })
);
