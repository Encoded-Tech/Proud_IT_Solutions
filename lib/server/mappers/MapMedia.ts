
import { IMedia } from "@/models/promotionModel";
import {
 
  ImageMediaItem,
  VideoMediaItem,
  AnyMediaItem,
} from "@/types/media";
import { Types } from "mongoose";

type MediaLike = Pick<
  IMedia,
  "type" | "imageUrl" | "videoUrl" | "publicId" | "placement" | "isActive" | "createdAt" | "updatedAt"
> & {
  id?: string;
  _id?: Types.ObjectId;
};

/**
 * Maps a backend Media document (IMedia) to frontend-safe MediaItem
 */
export const mapMediaToFrontend = (media: MediaLike): AnyMediaItem => {
  const id = media.id || media._id?.toString() || "";

  const base = {
    id,
    type: media.type,
    placement: media.placement,
    isActive: media.isActive,
    createdAt: media.createdAt.toISOString(),
    updatedAt: media.updatedAt.toISOString(),
  };

  if (media.type === "image" && media.imageUrl) {
    const item: ImageMediaItem = {
      ...base,
      type: "image",
      imageUrl: media.imageUrl,
    };
    return item;
  }

  if (media.type === "video" && media.videoUrl && media.publicId) {
    const item: VideoMediaItem = {
      ...base,
      type: "video",
      videoUrl: media.videoUrl,
      publicId: media.publicId,
    };
    return item;
  }

  // If DB is invalid (missing required fields), throw an error
  throw new Error(
    `Invalid Media document: type=${media.type}, imageUrl=${media.imageUrl}, videoUrl=${media.videoUrl}, publicId=${media.publicId}`
  );
};

/**
 * Maps an array of IMedia documents
 */
export const mapMediaArrayToFrontend = (mediaArray: IMedia[]): AnyMediaItem[] => {
  return mediaArray.map(mapMediaToFrontend);
};



import { MediaItem } from "@/components/admin/AdminPostTable";

export const mapAnyMediaToTableMedia = (media: AnyMediaItem[]): MediaItem[] => {
  return media.map((m) => ({
    _id: m.id,
    url: m.type === "image" ? m.imageUrl! : m.videoUrl!, 
    type: m.type,
    placement: m.placement,
    createdAt: m.createdAt,
  }));
};
