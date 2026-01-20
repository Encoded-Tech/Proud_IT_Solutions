

import { PartType } from "@/constants/part";
import { Schema, model, models, Document, Types } from "mongoose";



export type RAMType = "DDR4" | "DDR5";
export type StorageType = "ssd" | "nvme" | "hdd";

/** PART OPTION INTERFACE */
export interface IPartOption extends Document {
    _id: Types.ObjectId;
  name: string;
  type: PartType;
  brand?: string;
  modelName?: string; // renamed to avoid clash
  price?: number;
  imageUrl?: string;

  /** Compatibility fields */
  socket?: string;        // CPU/Motherboard
  chipset?: string;       // Motherboard
  ramType?: RAMType;      // RAM / Motherboard
  wattage?: number;       // PSU/GPU
  lengthMM?: number;      // GPU / Cooler / Case
  storageType?: StorageType; // SSD/NVMe/HDD
  capacityGB?: number;    // Storage size

  /** Admin control */
  isActive?: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

/** SCHEMA */
const PartOptionSchema = new Schema<IPartOption>(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "cpu",
        "gpu",
        "motherboard",
        "ram",
        "storage",
        "psu",
        "case",
        "cooler",
        "monitor",
        "keyboard",
        "mouse",
        "ups",
        "fan",
        "headset",
        "thermalPaste",
        "captureCard",
        "rgbAccessory",
        "usbPort",
      ],
      required: true,
    },
    brand: String,
    modelName: String, // renamed
    price: Number,
    imageUrl: String,

    /** Compatibility metadata */
    socket: String,
    chipset: String,
    ramType: { type: String, enum: ["DDR4", "DDR5"] },
    wattage: Number,
    lengthMM: Number,
    storageType: { type: String, enum: ["ssd", "nvme", "hdd"] },
    capacityGB: Number,

    /** Admin toggle */
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

/** EXPORT MODEL */
export const PartOption =
  models.PartOption || model<IPartOption>("PartOption", PartOptionSchema);
