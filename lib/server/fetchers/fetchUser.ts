"use server";

import { auth } from "@/auth";
import { AuthUser } from "@/redux/features/auth/userSlice";
import User from "@/models/userModel";
import { serializeUser } from "../mappers/mapUser";
import mongoose from "mongoose";


export async function getCurrentUserAction(): Promise<AuthUser | null> {
  const session = await auth();

  if (!session?.user) return null;

  let user = session.user.id && mongoose.Types.ObjectId.isValid(session.user.id)
    ? await User.findById(session.user.id).select("+hashedPassword")
    : null;

  if (!user && session.user.providerId) {
    user = await User.findOne({ providerId: session.user.providerId }).select("+hashedPassword");
  }

  if (!user && session.user.email) {
    user = await User.findOne({ email: session.user.email.toLowerCase() }).select("+hashedPassword");
  }

  if (!user) return null;

return serializeUser(user);
}
