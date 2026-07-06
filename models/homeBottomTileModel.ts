import { Document, model, models, Schema } from "mongoose";

export interface IHomeBottomTile extends Document {
  placement: "home_bottom_tiles";
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl: string;
  ctaText?: string;
  altText: string;
  sortOrder: number;
  isActive: boolean;
  publicId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const HomeBottomTileSchema = new Schema<IHomeBottomTile>(
  {
    placement: {
      type: String,
      enum: ["home_bottom_tiles"],
      default: "home_bottom_tiles",
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    subtitle: { type: String, trim: true, maxlength: 120 },
    imageUrl: { type: String, required: true, trim: true },
    linkUrl: { type: String, default: "#", trim: true, maxlength: 500 },
    ctaText: { type: String, trim: true, maxlength: 60 },
    altText: { type: String, required: true, trim: true, maxlength: 180 },
    sortOrder: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, required: true, default: true },
    publicId: { type: String, trim: true },
  },
  { timestamps: true }
);

HomeBottomTileSchema.index({ placement: 1, sortOrder: 1 });
HomeBottomTileSchema.index({ placement: 1, isActive: 1 });

export const HomeBottomTileModel =
  models.HomeBottomTile ||
  model<IHomeBottomTile>("HomeBottomTile", HomeBottomTileSchema);
