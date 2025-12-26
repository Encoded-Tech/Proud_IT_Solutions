"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { AuthUser } from "@/redux/features/auth/userSlice";
import User from "@/models/userModel";
import { serializeUser } from "../mappers/mapUser";


export async function getCurrentUserAction(): Promise<AuthUser | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user) return null;

  let user = null;

  if (session.user.id && session.user.email) {
    // Check if this is a Google user (sub/id is numeric or Google format)
    user = await User.findOne({ providerId: session.user.id });
    if (!user && session.user.sub) {
      // Create new Google user if doesn't exist
      user = await User.create({
        name: session.user.name,
        email: session.user.email,
         providerId: session.user.id, 
         phone: session.user.phone,
        role: "user",
        emailVerified: session.user.emailVerified,
      });
    }
  }

  // If still null, fallback to credentials user (email)
  if (!user && session.user.email) {
    user = await User.findOne({ email: session.user.email });
  }

  if (!user) return null;

return serializeUser(user);
}
