// models/BuildRequest.ts

import { Schema, model, models, Types, Document } from "mongoose";

/** ENUMS */
export type CPUBrand = "intel" | "amd" | "any";
export type GPUBrand = "nvidia" | "amd" | "any";
export type OSBrand = "windows" | "linux" | "none";
export type UseCase = "gaming" | "editing" | "office";
export type BuildStatus =
  | "submitted"
  | "reviewing"
  | "quoted"
  | "awaiting-payment"
  | "building"
  | "ready"
  | "delivered"
  | "cancelled";

/** PART SUBDOCUMENT */
export interface IPart {
  name: string;
  brand?: string;
  model?: string;
  price?: number;
}

/** STORAGE SUBDOCUMENT */
export interface IStorage {
  nvme?: boolean;
  ssdGB?: number;
  hddGB?: number;
}

/** PERIPHERALS SUBDOCUMENT */
export interface IPeripherals {
  monitor?: boolean;
  keyboard?: boolean;
  mouse?: boolean;
  ups?: boolean;
}

/** RECOMMENDED PARTS SUBDOCUMENT */
export interface IRecommendedParts {
  cpu?: IPart;
  motherboard?: IPart;
  ram?: IPart;
  gpu?: IPart;
  storagePrimary?: IPart;
  storageSecondary?: IPart;
  psu?: IPart;
  case?: IPart;
  cooler?: IPart;
  monitor?: IPart;
  keyboard?: IPart;
  mouse?: IPart;
  ups?: IPart;
}

/** MAIN DOCUMENT INTERFACE */
export interface IBuildRequest extends Document {
  userId?: Types.ObjectId;
  name: string;
  phone: string;
  email?: string;

  budgetNPR: number;
  uses: UseCase[];

  // Performance
  targetResolution?: string;
  targetFPS?: number;

  // Preferences
  cpuPreference?: CPUBrand;
  cpuModel?: string;        // e.g., "i7-13700K", "Ryzen 7 7800X"
  gpuPreference?: GPUBrand;
  gpuModel?: string;        // e.g., "RTX 3060 12GB", "RX 6700 XT 12GB"
  ramGB?: number;           // e.g., 16, 32
  ramType?: string;         // DDR4, DDR5
  osPreference?: OSBrand;
  rgbPreference?: boolean;
  smallFormFactor?: boolean;

  storage?: IStorage;
  peripherals?: IPeripherals;

  recommendedParts?: IRecommendedParts;

  status?: BuildStatus;

  adminNotes?: string;
  priceEstimate?: number;
  finalPrice?: number;
  deliveryETA?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

/** Mongoose Part Schema */
const PartSchema = new Schema<IPart>(
  {
    name: { type: String, required: true },
    brand: { type: String },
    model: { type: String },
    price: { type: Number },
  },
  { _id: false }
);

/** Mongoose BuildRequest Schema */
const BuildRequestSchema = new Schema<IBuildRequest>(
  {
    userId: { type: Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },

    budgetNPR: { type: Number, required: true },
    uses: [{ type: String, enum: ["gaming", "editing", "office"] }],

    targetResolution: { type: String },
    targetFPS: { type: Number },

    cpuPreference: { type: String, enum: ["intel", "amd", "any"], default: "any" },
    cpuModel: { type: String },
    gpuPreference: { type: String, enum: ["nvidia", "amd", "any"], default: "any" },
    gpuModel: { type: String },
    ramGB: { type: Number },
    ramType: { type: String },
    osPreference: { type: String, enum: ["windows", "linux", "none"], default: "windows" },
    rgbPreference: { type: Boolean, default: false },
    smallFormFactor: { type: Boolean, default: false },

    storage: {
      nvme: { type: Boolean, default: true },
      ssdGB: { type: Number, default: 512 },
      hddGB: { type: Number, default: 0 },
    },

    peripherals: {
      monitor: { type: Boolean, default: false },
      keyboard: { type: Boolean, default: false },
      mouse: { type: Boolean, default: false },
      ups: { type: Boolean, default: false },
    },

    recommendedParts: {
      cpu: PartSchema,
      motherboard: PartSchema,
      ram: PartSchema,
      gpu: PartSchema,
      storagePrimary: PartSchema,
      storageSecondary: PartSchema,
      psu: PartSchema,
      case: PartSchema,
      cooler: PartSchema,
      monitor: PartSchema,
      keyboard: PartSchema,
      mouse: PartSchema,
      ups: PartSchema,
    },

    status: {
      type: String,
      enum: [
        "submitted",
        "reviewing",
        "quoted",
        "awaiting-payment",
        "building",
        "ready",
        "delivered",
        "cancelled",
      ],
      default: "submitted",
    },

    adminNotes: { type: String },
    priceEstimate: { type: Number },
    finalPrice: { type: Number },
    deliveryETA: { type: String },
  },
  { timestamps: true }
);

export const BuildRequest =
  models.BuildRequest || model<IBuildRequest>("BuildRequest", BuildRequestSchema);
