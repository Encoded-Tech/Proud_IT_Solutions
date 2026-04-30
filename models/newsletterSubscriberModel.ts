import { Document, model, models, Schema } from "mongoose";

export interface INewsletterSubscriber extends Document {
  email: string;
  name?: string | null;
  subscribed: boolean;
  source: "footer" | "admin" | "import";
  subscribedAt?: Date | null;
  unsubscribedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const newsletterSubscriberSchema = new Schema<INewsletterSubscriber>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      default: null,
    },
    subscribed: {
      type: Boolean,
      default: true,
      index: true,
    },
    source: {
      type: String,
      enum: ["footer", "admin", "import"],
      default: "footer",
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default models.NewsletterSubscriber ||
  model<INewsletterSubscriber>("NewsletterSubscriber", newsletterSubscriberSchema);
