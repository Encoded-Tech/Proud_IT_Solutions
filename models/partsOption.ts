

import { PartType } from "@/constants/part";
import { Schema, model, models, Document, Types } from "mongoose";



export type RAMType = "DDR4" | "DDR5" | "DDR6";
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
  "casing",
  "psu",
  "motherboard",
  "processor",
  "ram",
  "storage",
  "cpu_cooler",
  "gpu",
  "monitor",
  "keyboard",
  "mouse",
  "headset",
  "mousepad",
  "rgb_fan"
      ],
      required: true,
      index: true,

    },
    brand: String,
    modelName: String, // renamed
    price: Number,
    imageUrl: String,

    /** Compatibility metadata */
socket: { type: String, required: false },
chipset: { type: String, required: false },
ramType: {
  type: String,
  enum: ["DDR4", "DDR5", "DDR6"],
  required: false,
},
wattage: { type: Number, required: false },
lengthMM: { type: Number, required: false },
storageType: {
  type: String,
  enum: ["ssd", "nvme", "hdd"],
  required: false,
},
capacityGB: { type: Number, required: false },


    /** Admin toggle */
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

/** EXPORT MODEL */
export const PartOption =
  models.PartOption || model<IPartOption>("PartOption", PartOptionSchema);
