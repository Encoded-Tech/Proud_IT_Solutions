import { Schema, model, models, Document } from "mongoose";

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
  | "hot_deals_video";

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
      enum: [
        "hero_first",
        "hero_second",
        "hero_third",
        "hero_fourth",
        "build-user-pc",
        "best_seller_video_1",
        "best_seller_video_2",
        "hot_deals_video",
      ],
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

export const Media =
  models.Media || model<IMedia>("Media", MediaSchema);
