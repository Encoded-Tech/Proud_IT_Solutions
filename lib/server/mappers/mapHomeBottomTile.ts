import { IHomeBottomTile } from "@/models/homeBottomTileModel";
import { HomeBottomTile } from "@/types/home-media";
import { Types } from "mongoose";

export type HomeBottomTileLike = Pick<
  IHomeBottomTile,
  | "placement"
  | "title"
  | "subtitle"
  | "imageUrl"
  | "linkUrl"
  | "ctaText"
  | "altText"
  | "sortOrder"
  | "isActive"
  | "publicId"
> & { _id: Types.ObjectId | string };

export function mapHomeBottomTile(tile: HomeBottomTileLike): HomeBottomTile {
  return {
    id: String(tile._id),
    placement: "home_bottom_tiles",
    title: tile.title,
    subtitle: tile.subtitle || "",
    imageUrl: tile.imageUrl,
    linkUrl: tile.linkUrl || "#",
    ctaText: tile.ctaText || "View",
    altText: tile.altText || tile.title,
    sortOrder: Number(tile.sortOrder || 0),
    isActive: Boolean(tile.isActive),
    ...(tile.publicId ? { publicId: tile.publicId } : {}),
  };
}
