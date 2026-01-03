import { Schema, model, models, Document, Types } from "mongoose";
import { PartType } from "./partsOption";


/** BUILD PART SNAPSHOT */
export interface IBuildPart {
  part: Types.ObjectId;        // Ref PartOption
  type: PartType;             // cpu, gpu, etc
  name: string;               // snapshot
  price: number;     
  imageUrl?: string;
  quantity: number;
}

/** BUILD REQUEST INTERFACE */
export interface IBuildRequest extends Document {
  _id: Types.ObjectId;

  user: Types.ObjectId;

  parts: IBuildPart[];

  /** Pricing snapshot */
  subtotal: number;
  tax: number;
  grandTotal: number;

  /** Status */
  status:
    | "draft"
    | "submitted"
    | "reviewed"
    | "approved"
    | "rejected"
    | "checked_out";

  /** Admin control */
  adminNotes?: string;
  compatibilityPassed?: boolean;
    compatibilityStatus: "pending" | "passed" | "failed";

  /** Checkout integration */

  orderId?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

/** PART SUBSCHEMA */
const buildPartSchema = new Schema<IBuildPart>(
  {
    part: {
      type: Schema.Types.ObjectId,
      ref: "PartOption",
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String },
    quantity: { type: Number, default: 1 },
  },
  { _id: false }
);

/** MAIN SCHEMA */
const buildRequestSchema = new Schema<IBuildRequest>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    parts: {
      type: [buildPartSchema],
      default: [],
    },

    subtotal: { type: Number, required: true },

    grandTotal: { type: Number, required: true },

    status: {
      type: String,
      enum: [
        "draft",
        "submitted",
        "reviewed",
        "approved",
        "rejected",
        "checked_out",
      ],
      default: "draft",
    },

    adminNotes: { type: String },
    compatibilityPassed: { type: Boolean, default: false },
        compatibilityStatus: {
      type: String,
      enum: ["pending", "passed", "failed"],
      default: "pending",
    },



  },
  { timestamps: true }
);

/** EXPORT */
export const BuildRequest =
  models.BuildRequest ||
  model<IBuildRequest>("BuildRequest", buildRequestSchema);
