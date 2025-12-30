"use server";

import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { connectDB } from "@/db";
import UserModel from "@/models/userModel";

export async function updatePasswordAction({
  currentPassword,
  newPassword,
}: {
  currentPassword: string;
  newPassword: string;
}) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const user = await UserModel.findById(session.user.id).select(
      "+hashedPassword +provider +providerId"
    );

    if (!user) {
      return { success: false, message: "User not found" };
    }

    // 🔴 HARD BLOCK Google / OAuth users
    if (user.provider !== "credentials") {
      return {
        success: false,
        message:
          "Password change is not available for Google sign-in accounts",
      };
    }

    if (!user.hashedPassword) {
      return { success: false, message: "Password not set for this account" };
    }

    const isMatch = await bcrypt.compare(currentPassword, user.hashedPassword);
    if (!isMatch) {
      return { success: false, message: "Current password is incorrect" };
    }

    if (newPassword.length < 8) {
      return {
        success: false,
        message: "Password must be at least 8 characters",
      };
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 12);
    user.hashedPassword = newHashedPassword;
    await user.save();

    return { success: true, message: "Password updated successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, message: "Something went wrong" };
  }
}
