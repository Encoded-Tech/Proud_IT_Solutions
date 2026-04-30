import { Schema, model, models, Document } from "mongoose";
import { MEDIA_PLACEMENTS } from "@/types/media";

/**
 * Media Types
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
  | "hot_deals_video"
  | "home_top_banner"
  | "home_split_left"
  | "home_split_right"
  | "home_mid_banner"
  | "home_footer_banner";

/**
 * Media Document Interface
 */
export interface IMedia extends Document {
  type: MediaType;

  imageUrl?: string;
  videoUrl?: string;

  /** Cloudinary public_id (USED FOR DELETION) */
  publicId?: string;

  placement: MediaPlacement;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Media Schema
 */
const MediaSchema = new Schema<IMedia>(
  {
    type: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },

    imageUrl: {
      type: String,
      required: function (this: IMedia) {
        return this.type === "image";
      },
    },

    videoUrl: {
      type: String,
      required: function (this: IMedia) {
        return this.type === "video";
      },
    },

    /** NEW — Cloudinary deletion safety */
    publicId: {
      type: String,
      required: false,
    },

    placement: {
      type: String,
      enum: [...MEDIA_PLACEMENTS],
      required: true,
      unique: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

MediaSchema.index({ isActive: 1, createdAt: 1 });

const MediaModel = models.Media || model<IMedia>("Media", MediaSchema);

const placementPath = MediaModel.schema.path("placement") as any;

if (placementPath && "enumValues" in placementPath) {
  (placementPath as { enumValues: string[] }).enumValues = [...MEDIA_PLACEMENTS];
}

export const Media = MediaModel;
