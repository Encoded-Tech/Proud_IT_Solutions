import { Schema, Types, model, models } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

export interface ICartItem extends Document{
  _id: Types.ObjectId;
  product: Types.ObjectId; 
  variant?: Types.ObjectId; 
  quantity: number;
  selectedOptions?: Record<string, string>;
  addedAt: Date;
  updatedAt: Date;
}

export interface IWishlistItem extends Document {
  product: Types.ObjectId; 
  variant?: Types.ObjectId; 
  addedAt: Date;
}
export interface IUser extends Document {
 _id: Types.ObjectId;
  name: string;
  email: string;
  phone?: string | null;
  image?: string | null;
  hashedPassword?: string | null;
  provider: "credentials" | "google" | null;
  providerId?: string | null;
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpiry?: Date;
  resetPasswordToken?: string;
  resetPasswordExpiry?: Date;

  // Security & Locking
  failedLoginAttempts: number;
  lockUntil?: Date | null;
  hardLock: boolean;
  lockCount: number;
  lastLockTime?: Date | null;
  isLocked: boolean;

  role: "user" | "admin";
  lastLogin?: Date | null;
  signupIP?: string | null;

  // Login History
loginHistory: {
  ip: string;
  userAgent: string;
  device?: string;
  at: Date;
  isNewIP?: boolean;
  isNewDevice?: boolean;
  isSuspicious?: boolean;
}[];


  

  // Cart & Wishlist
  cart: ICartItem[];
  wishlist: IWishlistItem[];

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const cartSchema = new Schema<ICartItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    variant: { type: Schema.Types.ObjectId, ref: "ProductVariant", default: null },
    quantity: { type: Number, default: 1 },
    selectedOptions: { type: Map, of: String },
    addedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
)

const wishlistSchema = new Schema<IWishlistItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    variant: { type: Schema.Types.ObjectId, ref: "ProductVariant", default: null },
    addedAt: { type: Date, default: Date.now },
  }
)


const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      index: true,
    },

    image: {
      type: String,
      default: null,
    },

    phone: {
      type: String,
      match: /^[0-9]{10,15}$/,
      default: null,
    },

    hashedPassword: {
      type: String,
      select: false,
      default: null,
    },

    provider: {
      type: String,
      enum: ["credentials", "google", null],
      default: "credentials",
    },

    providerId: {
      type: String,
      default: null,
      index: true,
    },

    emailVerified: { type: Boolean, default: false },

    emailVerificationToken: { type: String },
    emailVerificationExpiry: { type: Date },

    resetPasswordToken: { type: String, select: false },
    resetPasswordExpiry: { type: Date, select: false },


    // SECURITY + LOCKING
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: {
      type: Date,
      default: null,
      select: false,
    },

    hardLock: {
      type: Boolean,
      default: false,
    },

    lockCount: {
      type: Number,
      default: 0,
    },

    lastLockTime: {
      type: Date,
      default: null,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    signupIP: {
      type: String,
      default: null,
    },

  loginHistory: [
  {
    ip: String,
    userAgent: String,
    device: String,
    isNewIP: Boolean,
    isNewDevice: Boolean,
    isSuspicious: Boolean,
    at: { type: Date, default: Date.now },
  },
],

    cart: [cartSchema],

    wishlist: [wishlistSchema]
    
  },
  { timestamps: true }
);

// VIRTUAL: isLocked (CALCULATED, NOT STORED)
userSchema.virtual("isLocked").get(function () {
  if (!this.lockUntil) return false;
  return this.lockUntil.getTime() > Date.now();
});


// include virtuals in response JSON
userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

// unique validation plugin
userSchema.plugin(uniqueValidator);


export default models.User || model<IUser>("User", userSchema);

