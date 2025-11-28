import { Schema, model, models } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const userSchema = new Schema(
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
        at: { type: Date, default: Date.now },
      },
    ],
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


export default models.User || model("User", userSchema);

