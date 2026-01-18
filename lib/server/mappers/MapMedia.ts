
import { IMedia } from "@/models/promotionModel";
import {
 
  ImageMediaItem,
  VideoMediaItem,
  AnyMediaItem,
} from "@/types/media";

/**
 * Maps a backend Media document (IMedia) to frontend-safe MediaItem
 */
export const mapMediaToFrontend = (media: IMedia): AnyMediaItem => {
  const base = {
    id: media.id.toString(),
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
