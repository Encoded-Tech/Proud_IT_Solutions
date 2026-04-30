"use server";

import { cacheLife, cacheTag } from "next/cache";
import { connectDB } from "@/db";
import { Media } from "@/models/promotionModel";
import { AnyMediaItem } from "@/types/media";
import { mapMediaToFrontend } from "../mappers/MapMedia";

interface MediaResponse<T = AnyMediaItem[]> {
  success: boolean;
  message: string;
  data?: T;
}

export async function getPublicMedia(): Promise<MediaResponse> {
  "use cache";

  cacheLife("hours");
  cacheTag("homepage");
  cacheTag("promotions");
  cacheTag("media");

  try {
    await connectDB();
    const media = await Media.find({ isActive: true }).sort({ createdAt: 1 });

    return {
      success: true,
      message: "Media fetched successfully",
      data: media.map(mapMediaToFrontend),
    };
  } catch (error) {
    console.error("Error fetching public media:", error);
    return {
      success: false,
      message: "Failed to fetch media",
      data: [],
    };
  }
}
