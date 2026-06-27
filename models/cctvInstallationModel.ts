import { CctvPartType, CCTV_PART_TYPES } from "@/constants/cctv";
import { Schema, model, models, Document, Types } from "mongoose";

export type CctvInstallationStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "site_inspection_required"
  | "installation_scheduled"
  | "completed"
  | "cancelled";

export interface ICctvPart extends Document {
  _id: Types.ObjectId;
  name: string;
  type: CctvPartType;
  brand?: string;
  modelName?: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isRequired: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICctvInstallationItem {
  part: Types.ObjectId;
  type: CctvPartType;
  name: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  notes?: string;
}

export interface ICctvCustomerDetails {
  name: string;
  phone: string;
  email: string;
  siteAddress: string;
  notes?: string;
}

export interface ICctvInstallationRequest extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  order?: Types.ObjectId;
  requestKey?: string;
  items: ICctvInstallationItem[];
  customerDetails: ICctvCustomerDetails;
  subtotal: number;
  grandTotal: number;
  status: CctvInstallationStatus;
  paymentStatus: "pending" | "submitted" | "paid" | "failed";
  paymentMethod?: "COD" | "OnlineUpload";
  adminRemarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const cctvPartSchema = new Schema<ICctvPart>(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: CCTV_PART_TYPES, required: true, index: true },
    brand: { type: String, trim: true },
    modelName: { type: String, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String },
    isRequired: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

const cctvInstallationItemSchema = new Schema<ICctvInstallationItem>(
  {
    part: { type: Schema.Types.ObjectId, ref: "CctvPart", required: true },
    type: { type: String, enum: CCTV_PART_TYPES, required: true },
    name: { type: String, required: true },
    imageUrl: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
    notes: { type: String },
  },
  { _id: false }
);

const cctvCustomerDetailsSchema = new Schema<ICctvCustomerDetails>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    siteAddress: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
  },
  { _id: false }
);

const cctvInstallationRequestSchema = new Schema<ICctvInstallationRequest>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    order: { type: Schema.Types.ObjectId, ref: "Order" },
    requestKey: { type: String, trim: true },
    items: { type: [cctvInstallationItemSchema], default: [] },
    customerDetails: { type: cctvCustomerDetailsSchema, required: true },
    subtotal: { type: Number, required: true, min: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "site_inspection_required",
        "installation_scheduled",
        "completed",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "submitted", "paid", "failed"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "OnlineUpload"],
    },
    adminRemarks: { type: String },
  },
  { timestamps: true }
);

cctvPartSchema.index({ type: 1, isActive: 1, name: 1 });
cctvInstallationRequestSchema.index({ user: 1, createdAt: -1 });
cctvInstallationRequestSchema.index(
  { user: 1, requestKey: 1 },
  { unique: true, sparse: true }
);

export const CctvPart = models.CctvPart || model<ICctvPart>("CctvPart", cctvPartSchema);

export const CctvInstallationRequest =
  models.CctvInstallationRequest ||
  model<ICctvInstallationRequest>(
    "CctvInstallationRequest",
    cctvInstallationRequestSchema
  );
