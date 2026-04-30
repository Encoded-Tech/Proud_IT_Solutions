import { Document, model, models, Schema, Types } from "mongoose";

export interface IEmailCampaign extends Document {
  slug: string;
  subject: string;
  previewText?: string | null;
  body: string;
  targetType?: "none" | "page" | "category" | "brand" | "product";
  targetValue?: string | null;
  targetLabel?: string | null;
  targetPath?: string | null;
  audience:
    | "all-users"
    | "verified-users"
    | "newsletter-users"
    | "newsletter-users-and-guests"
    | "guest-subscribers";
  recipientCount: number;
  successCount: number;
  failureCount: number;
  status: "completed" | "partial" | "failed";
  publishedToSite: boolean;
  publishedAt?: Date | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  sentBy: {
    userId?: Types.ObjectId | null;
    name: string;
    email: string;
  };
  failures: {
    email: string;
    reason: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const emailCampaignSchema = new Schema<IEmailCampaign>(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
      maxlength: 180,
      default: () => `newsletter-campaign-${new Types.ObjectId().toString()}`,
    },
    previewText: {
      type: String,
      default: null,
      trim: true,
      maxlength: 180,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20000,
    },
    targetType: {
      type: String,
      enum: ["none", "page", "category", "brand", "product"],
      default: "none",
      index: true,
    },
    targetValue: {
      type: String,
      default: null,
      trim: true,
      maxlength: 200,
    },
    targetLabel: {
      type: String,
      default: null,
      trim: true,
      maxlength: 160,
    },
    targetPath: {
      type: String,
      default: null,
      trim: true,
      maxlength: 500,
    },
    audience: {
      type: String,
      enum: [
        "all-users",
        "verified-users",
        "newsletter-users",
        "newsletter-users-and-guests",
        "guest-subscribers",
      ],
      required: true,
      index: true,
    },
    recipientCount: {
      type: Number,
      required: true,
      min: 0,
    },
    successCount: {
      type: Number,
      required: true,
      min: 0,
    },
    failureCount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["completed", "partial", "failed"],
      required: true,
      index: true,
    },
    publishedToSite: {
      type: Boolean,
      default: true,
      index: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    ctaLabel: {
      type: String,
      default: null,
      trim: true,
      maxlength: 40,
    },
    ctaUrl: {
      type: String,
      default: null,
      trim: true,
      maxlength: 500,
    },
    sentBy: {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      name: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
    },
    failures: {
      type: [
        {
          email: { type: String, required: true, trim: true, lowercase: true },
          reason: { type: String, required: true, trim: true },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

emailCampaignSchema.pre("validate", function (next) {
  if (!this.slug || !this.slug.trim()) {
    this.slug = `newsletter-campaign-${new Types.ObjectId().toString()}`;
  }

  next();
});

export default models.EmailCampaign ||
  model<IEmailCampaign>("EmailCampaign", emailCampaignSchema);
