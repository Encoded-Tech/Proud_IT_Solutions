"use server";

import { connectDB } from "@/db";
import UserModel from "@/models/userModel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";

import { IUserAddress } from "@/models/userModel";
import { deleteFromCloudinary, uploadToCloudinary } from "@/config/cloudinary";
import { serializeUser } from "@/lib/server/mappers/mapUser";


interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export async function updateProfileAction(
  formData: FormData
): Promise<UpdateProfileResponse> {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const userId = session.user.id;

    const name = formData.get("name")?.toString();
    const phone = formData.get("phone")?.toString();
    const imageFile = formData.get("image") as File | null;
    const newsletterSubscribed = formData.get("newsletterSubscribed") === "true";

    // ---------------- Name ----------------
 

  // ---------------- Bio ----------------
  const bio = formData.get("bio")?.toString();


    // Address comes as JSON string
    const addressRaw = formData.get("address")?.toString();
    let parsedAddress: Partial<IUserAddress> | null = null;

    if (addressRaw) {
      try {
        parsedAddress = JSON.parse(addressRaw);
      } catch {
        return { success: false, message: "Invalid address format" };
      }
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return { success: false, message: "User not found" };
    }

    /* ---------------- BASIC FIELDS ---------------- */
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    user.newsletter = {
      subscribed: newsletterSubscribed,
      source: newsletterSubscribed ? "account" : user.newsletter?.source ?? "account",
      subscribedAt: newsletterSubscribed
        ? user.newsletter?.subscribedAt ?? new Date()
        : user.newsletter?.subscribedAt ?? null,
      unsubscribedAt: newsletterSubscribed ? null : new Date(),
      lastCampaignSentAt: user.newsletter?.lastCampaignSentAt ?? null,
      lastCampaignSubject: user.newsletter?.lastCampaignSubject ?? null,
    };

    /* ---------------- ADDRESS (MERGE) ---------------- */
    if (parsedAddress && typeof parsedAddress === "object") {
      user.address = {
      ...(user.address || {}),
        ...parsedAddress,
      };
         user.markModified("address");
        
    }

    /* ---------------- IMAGE ---------------- */
    if (imageFile && imageFile.size > 0) {
      if (user.image) {
        await deleteFromCloudinary(user.image);
      }

      const uploadedUrl = await uploadToCloudinary(imageFile);
      user.image = uploadedUrl;
    }

    await user.save();

    return {
      success: true,
      message: "Profile updated successfully",
      data: serializeUser(user),
    };
  } catch (error) {
    console.error("updateProfileAction:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update profile",
    };
  }
}
