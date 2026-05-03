import { Document, Schema, model, models } from "mongoose";

export interface IQuotationItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface IQuotation extends Document {
  quotationNumber: string;
  quotationDate: Date;
  subject: string;
  introduction?: string | null;
  party: {
    clientName: string;
    clientCompanyName?: string | null;
    clientAddress?: string | null;
    clientContact?: string | null;
  };
  items: IQuotationItem[];
  currency: string;
  discountMode: "amount" | "percentage";
  discountValue: number;
  taxMode: "amount" | "percentage";
  taxValue: number;
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  grandTotal: number;
  terms?: string | null;
  preparedBy: {
    heading?: string | null;
    name?: string | null;
    role?: string | null;
    contact?: string | null;
    email?: string | null;
  };
  assets: {
    letterpad: string;
    signature?: string | null;
    stamp?: string | null;
  };
  createdBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const quotationItemSchema = new Schema<IQuotationItem>(
  {
    id: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true, maxlength: 600 },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const quotationSchema = new Schema<IQuotation>(
  {
    quotationNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
      maxlength: 50,
    },
    quotationDate: {
      type: Date,
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180,
    },
    introduction: {
      type: String,
      default: null,
      trim: true,
      maxlength: 2000,
    },
    party: {
      clientName: { type: String, required: true, trim: true, maxlength: 120 },
      clientCompanyName: { type: String, default: null, trim: true, maxlength: 160 },
      clientAddress: { type: String, default: null, trim: true, maxlength: 400 },
      clientContact: { type: String, default: null, trim: true, maxlength: 160 },
    },
    items: {
      type: [quotationItemSchema],
      default: [],
      validate: {
        validator: (items: IQuotationItem[]) => items.length > 0 && items.length <= 10,
        message:
          "Maximum 10 items are allowed in one quotation. Create another quotation for more items.",
      },
    },
    currency: {
      type: String,
      default: "NPR",
      trim: true,
      maxlength: 10,
    },
    discountMode: {
      type: String,
      enum: ["amount", "percentage"],
      default: "amount",
    },
    discountValue: { type: Number, default: 0, min: 0 },
    taxMode: {
      type: String,
      enum: ["amount", "percentage"],
      default: "percentage",
    },
    taxValue: { type: Number, default: 0, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, required: true, min: 0 },
    taxableAmount: { type: Number, required: true, min: 0 },
    taxAmount: { type: Number, required: true, min: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
    terms: {
      type: String,
      default: null,
      trim: true,
      maxlength: 3000,
    },
    preparedBy: {
      heading: { type: String, default: null, trim: true, maxlength: 80 },
      name: { type: String, default: null, trim: true, maxlength: 120 },
      role: { type: String, default: null, trim: true, maxlength: 120 },
      contact: { type: String, default: null, trim: true, maxlength: 160 },
      email: { type: String, default: null, trim: true, maxlength: 160 },
    },
    assets: {
      letterpad: { type: String, required: true, trim: true, maxlength: 500 },
      signature: { type: String, default: null, trim: true, maxlength: 500 },
      stamp: { type: String, default: null, trim: true, maxlength: 500 },
    },
    createdBy: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { timestamps: true }
);

export default models.Quotation || model<IQuotation>("Quotation", quotationSchema);
