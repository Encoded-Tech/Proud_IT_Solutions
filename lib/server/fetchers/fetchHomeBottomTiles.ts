import { connectDB } from "@/db";
import { HomeBottomTileLike, mapHomeBottomTile } from "@/lib/server/mappers/mapHomeBottomTile";
import { HomeBottomTileModel } from "@/models/homeBottomTileModel";
import { HomeBottomTile } from "@/types/home-media";
import { cacheLife, cacheTag } from "next/cache";

export async function getHomeBottomTiles(): Promise<HomeBottomTile[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("home-media");
  cacheTag("media");
  cacheTag("homepage");

  try {
    await connectDB();
    const tiles = await HomeBottomTileModel.find({
      placement: "home_bottom_tiles",
      isActive: true,
    })
      .sort({ sortOrder: 1, createdAt: 1 })
      .limit(4)
      .lean();
    return tiles.map((tile) =>
      mapHomeBottomTile(tile as unknown as HomeBottomTileLike)
    );
  } catch (error) {
    console.error("Failed to fetch home bottom tiles:", error);
    return [];
  }
}
