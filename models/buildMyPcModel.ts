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

export type PaymentStatus = "pending" | "paid" | "failed";

/** PART SUBDOCUMENT */
export interface IPart {
  name: string;
  brand?: string;
  model?: string;
  price?: number;

  // compatibility metadata
  socket?: string;
  chipset?: string;
  ramType?: "DDR4" | "DDR5";
  wattage?: number;
  lengthMM?: number;
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
  _id: Types.ObjectId;
  userId?: Types.ObjectId;

  name: string;
  phone: string;
  email?: string;

  budgetNPR: number;
  uses: UseCase[];

  targetResolution?: string;
  targetFPS?: number;

  cpuPreference?: CPUBrand;
  cpuModel?: string;
  gpuPreference?: GPUBrand;
  gpuModel?: string;
  ramGB?: number;
  ramType?: string;
  osPreference?: OSBrand;
  rgbPreference?: boolean;
  smallFormFactor?: boolean;

  storage?: IStorage;
  peripherals?: IPeripherals;

  recommendedParts?: IRecommendedParts;

  status?: BuildStatus;

  /** 🔥 QUOTE & PAYMENT */
  quoteId?: string;
  paymentStatus?: PaymentStatus;
  checkoutOrderId?: Types.ObjectId;

  /** OPTIONAL ADVANCE PAYMENT */
  advanceAmount?: number;
  remainingAmount?: number;

  adminNotes?: string;
  priceEstimate?: number;
  finalPrice?: number;
  deliveryETA?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

/** PART SCHEMA */
const PartSchema = new Schema<IPart>(
  {
    name: { type: String, required: true },
    brand: String,
    model: String,
    price: Number,

    socket: String,
    chipset: String,
    ramType: { type: String, enum: ["DDR4", "DDR5"] },
    wattage: Number,
    lengthMM: Number,
  },
  { _id: false }
);

/** BUILD REQUEST SCHEMA */
const BuildRequestSchema = new Schema<IBuildRequest>(
  {
    userId: { type: Types.ObjectId, ref: "User" },

    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,

    budgetNPR: { type: Number, required: true },
    uses: [{ type: String, enum: ["gaming", "editing", "office"] }],

    targetResolution: String,
    targetFPS: Number,

    cpuPreference: { type: String, enum: ["intel", "amd", "any"], default: "any" },
    cpuModel: String,
    gpuPreference: { type: String, enum: ["nvidia", "amd", "any"], default: "any" },
    gpuModel: String,
    ramGB: Number,
    ramType: String,
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

    /** PAYMENT */
    quoteId: String,
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    checkoutOrderId: { type: Types.ObjectId, ref: "Order" },

    advanceAmount: Number,
    remainingAmount: Number,

    adminNotes: String,
    priceEstimate: Number,
    finalPrice: Number,
    deliveryETA: String,
  },
  { timestamps: true }
);

export const BuildRequest =
  models.BuildRequest || model<IBuildRequest>("BuildRequest", BuildRequestSchema);
