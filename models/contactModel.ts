

// models/contactModel.ts
import mongoose, { Schema, Document, Model } from "mongoose";

// types/contact.ts
export interface ContactType {
  name: string;
  email: string;
  phone: string;
  description: string;
  organization?: string;
  subject?: string;
  createdAt?: Date;
  updatedAt?: Date;
  replied?: boolean;
  repliedAt?: Date;
  read?: boolean;
  readAt?: Date;
}


export interface IContact extends ContactType, Document {}

const contactSchema: Schema<IContact> = new Schema<IContact>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name must be at most 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Email is invalid"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^\+?\d{7,15}$/, "Phone number is invalid"], // allows + and 7-15 digits
    },
    subject: {
      type: String,
      trim: true,
      maxlength: [100, "Subject must be at most 100 characters"],
      default: "",
    },
    description: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      minlength: [5, "Message must be at least 5 characters"],
      maxlength: [1000, "Message must be at most 1000 characters"],
    },
    organization: {
      type: String,
      trim: true,
      maxlength: [100, "Organization name must be at most 100 characters"],
    },

    replied: {
  type: Boolean,
  default: false,
},

repliedAt: {
  type: Date,
},

read: {
  type: Boolean,
  default: false,
},

readAt: {
  type: Date,
},


  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

const Contact: Model<IContact> =
  mongoose.models.Contact || mongoose.model<IContact>("Contact", contactSchema);

export default Contact;
