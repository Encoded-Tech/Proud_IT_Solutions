import NextAuth from "next-auth/next";
import { NextRequest } from "next/server";
import { authOptions as baseOptions } from "@/lib/auth/authOptions";
import { connectDB } from "@/db";
import User from "@/models/userModel";


export async function GET(req: NextRequest) {
  return NextAuth(req, { params: await Promise.resolve({ nextauth: [] }) }, {
    ...baseOptions,
    callbacks: {
      ...baseOptions.callbacks,
      async signIn({ user }) {
        await connectDB();

        const ip =
          req.headers.get("x-forwarded-for") ||
          req.headers.get("x-real-ip") ||
          "unknown";

        const userAgent = req.headers.get("user-agent") || "unknown";

        let existing = await User.findOne({ email: user.email });
        if (!existing) {
          existing = await User.create({
            name: user.name,
            email: user.email,
            provider: "google",
            providerId: user.id,
            role: "user",
            emailVerified: true,
            image: user.image,
            loginHistory: [{ ip, userAgent, at: new Date() }],
          });
        } else {
          existing.loginHistory.push({ ip, userAgent, at: new Date() });
          existing.loginHistory = existing.loginHistory.slice(-20);
          await existing.save();
        }

        user.id = existing._id.toString();
        user.role = existing.role;
        user.emailVerified = !!existing.emailVerified;

        return true;
      },
    },
  });
}

// -----------------------------
// POST simply calls GET
// -----------------------------
export const POST = GET;
