import mongoose from "mongoose";
import User from "@/models/userModel";

export type AuthUserLookup = {
  id?: string | null;
  providerId?: string | null;
  email?: string | null;
};

export async function resolveAuthUserId(user: AuthUserLookup): Promise<string | null> {
  if (user.id && mongoose.Types.ObjectId.isValid(user.id)) {
    const dbUser = await User.findById(user.id).select("_id");
    return dbUser?._id.toString() ?? null;
  }

  if (user.providerId) {
    const dbUser = await User.findOne({ providerId: user.providerId }).select("_id");
    if (dbUser) return dbUser._id.toString();
  }

  if (user.id) {
    const dbUser = await User.findOne({ providerId: user.id }).select("_id");
    if (dbUser) return dbUser._id.toString();
  }

  if (user.email) {
    const dbUser = await User.findOne({ email: user.email.toLowerCase() }).select("_id");
    if (dbUser) return dbUser._id.toString();
  }

  return null;
}
