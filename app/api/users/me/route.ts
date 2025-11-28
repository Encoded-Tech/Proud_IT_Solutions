import { NextRequest, NextResponse } from "next/server";
import UserModel from "@/models/userModel";
import { withAuth } from "@/lib/HOF/withAuth";
import { withDB } from "@/lib/HOF";

import { getAuthUserId } from "@/lib/auth/getAuthUser";
import { deleteFromCloudinary, uploadToCloudinary } from "@/config/cloudinary";

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

export const GET = withAuth(
  withDB(async (req: NextRequest) => {
   const id = getAuthUserId(req);
    const dbUser = await UserModel.findById(id)
    .select(exclusions);

    if (!dbUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: `User ${dbUser.name} fetched successfully`, data: dbUser });
  }, { resourceName: "user" })
);

export const PUT = withAuth(
  withDB(async (req: NextRequest) => {
    const id = getAuthUserId(req);

    const formData = await req.formData();

    const name = formData.get("name")?.toString();
    const phone = formData.get("phone")?.toString();
    const imageFile = formData.get("image") as File | null;

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
