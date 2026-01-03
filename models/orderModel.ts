import { Schema, Document, model, models, Types } from "mongoose";

export interface IOrderItem {
  product: Types.ObjectId;
  variant?: Types.ObjectId;
  quantity: number;
  price: number;
}

export interface IDeliveryInfo {
  name: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  instructions?: string;
}

export interface IOrder extends Document {
  user: Types.ObjectId;
  orderItems: IOrderItem[];
  totalPrice: number;
  paymentStatus: "pending" | "submitted" | "paid" | "failed";
  orderStatus: "pending" | "processing" | "delivered" | "cancelled" | "failed";
  paymentMethod: "COD" | "OnlineUpload";
  paymentProof: string;
  paymentSubmittedAt: Date;
  deliveryInfo: IDeliveryInfo;
  expiresAt?: Date;
  stockProcessed: boolean;
  totalSalesUpdated: boolean;
  createdAt: Date;
  updatedAt: Date;

  // inside IOrder
buildRequest?: Types.ObjectId | null;
orderType: "product" | "build";

  deliveredAt?: Date;
  cancelledAt?: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variant: { type: Schema.Types.ObjectId, ref: "ProductVariant" },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const deliveryInfoSchema = new Schema<IDeliveryInfo>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    instructions: { type: String },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orderItems: [orderItemSchema],
    orderType: {
    type: String,
    enum: ["product", "build"],
    default: "product", // 👈 backward compatible
  },

  buildRequest: {
    type: Schema.Types.ObjectId,
    ref: "BuildRequest",
    default: null,
  },

    totalPrice: { type: Number, required: true },

    paymentStatus: {
      type: String,
      enum: ["pending", "submitted", "paid", "failed"],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "OnlineUpload"],
      required: true,
    },

    paymentProof: {
      type: String,
    },

    paymentSubmittedAt: {
      type: Date,
    },

    expiresAt: {
      type: Date,
    },

    stockProcessed: {
      type: Boolean,
      default: false,
    },

    totalSalesUpdated: {
      type: Boolean, 
      default: false },

    orderStatus: {
      type: String,
      enum: ["pending", "processing", "delivered", "cancelled", "failed"],
      default: "pending",
    },
    deliveryInfo: deliveryInfoSchema,
  },
  { timestamps: true }
);

export const Order = models.Order || model<IOrder>("Order", orderSchema);
