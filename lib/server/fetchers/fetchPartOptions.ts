import { connectDB } from "@/db";
import { mapPartOptionsArray } from "@/lib/server/mappers/MapPartsOption";
import { IPartOption, PartOption } from "@/models/partsOption";
import { cacheLife, cacheTag } from "next/cache";

export async function fetchPublicPartOptions() {
  "use cache";

  cacheLife("hours");
  cacheTag("build-parts");

  await connectDB();

  const parts = await PartOption.find({ isActive: true }).sort({ name: 1 }).lean<IPartOption[]>();

  return {
    success: true as const,
    message: "Part options fetched successfully",
    data: mapPartOptionsArray(parts),
  };
}
