/**
 * Media type: image or video
 */
export type MediaType = "image" | "video";

/**
 * Exact homepage placements
 */
export type MediaPlacement =
  | "hero_first"
  | "hero_second"
  | "hero_third"
  | "hero_fourth"
  | "build-user-pc"
  | "best_seller_video_1"
  | "best_seller_video_2"
  | "hot_deals_video";

/**
 * Generic Media item returned from backend
 */
export interface MediaItem {
  id: string;                  // MongoDB _id
  type: MediaType;
  placement: MediaPlacement;
  isActive: boolean;

  /** Image URL, only present if type === "image" */
  imageUrl?: string;

  /** Video URL, only present if type === "video" */
  videoUrl?: string;

  /** Cloudinary publicId for video deletion or reference */
  publicId?: string;

  /** Timestamps as ISO strings */
  createdAt: string;
  updatedAt: string;
}

/**
 * Strict image media
 */
export interface ImageMediaItem extends MediaItem {
  type: "image";
  imageUrl: string;
}

/**
 * Strict video media
 */
export interface VideoMediaItem extends MediaItem {
  type: "video";
  videoUrl: string;
  publicId: string;
}

/**
 * Convenience union for type-safe filtering
 */
export type AnyMediaItem = ImageMediaItem | VideoMediaItem;
