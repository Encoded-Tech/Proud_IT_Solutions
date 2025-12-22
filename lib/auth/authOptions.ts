import { AuthOptions, User as NextAuthUser } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import { connectDB } from "@/db";
import UserModel, { IUser } from "@/models/userModel";

import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  NEXTAUTH_SECRET,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  HARDLOCK_THRESHOLD,
  HARDLOCK_WINDOW,
  MAX_ATTEMPTS,
  TEMP_LOCK_TIME,
} from "@/config/env";

/* ---------------- helpers ---------------- */

function normalizeIP(ip: string) {
  return ip === "::1" || ip === "127.0.0.1" ? "local" : ip;
}

function getDeviceFingerprint(userAgent: string) {
  const browser =
    userAgent.match(/(Firefox|Chrome|Safari|Edg|Opera)/)?.[0] ??
    "unknown_browser";
  const os =
    userAgent.match(/(Windows|Mac|Linux|Android|iPhone|iPad)/)?.[0] ??
    "unknown_os";

  return crypto
    .createHash("sha256")
    .update(`${browser}:${os}`)
    .digest("hex")
    .slice(0, 32);
}

/* ---------------- authOptions ---------------- */

export const authOptions: AuthOptions = {
  secret: NEXTAUTH_SECRET,
  session: { strategy: "jwt" },

  providers: [
    /* ---------- Google ---------- */
  GoogleProvider({
  clientId: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  async profile(profile) {
    // profile.sub is the Google unique id
    await connectDB();

    // Try to find a user with providerId
    let user = await UserModel.findOne({ providerId: profile.sub });
    if (!user) {
  user = await UserModel.findOne({ email: profile.email });
  
  if (user) {
    // Link Google providerId to existing account
    user.providerId = profile.sub;
    user.emailVerified = true;
    await user.save();
  }
}

    if (!user) {
      // If user doesn't exist, create new one
      user = await UserModel.create({
        name: profile.name,
        email: profile.email,
        providerId: profile.sub, // save Google sub here
        emailVerified: profile.email_verified || true,
        role: "user",
      });
    }

    // Always return MongoDB _id
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: Boolean(user.emailVerified),
    };
  },
}),

    /* ---------- Credentials ---------- */
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials, req) {
        await connectDB();

        if (!credentials?.email || !credentials?.password) {
          throw new Error("MISSING_CREDENTIALS");
        }

        const email = credentials.email.toLowerCase();
        const password = credentials.password;

        const headers = req.headers as Record<string, string>;

        const ip = normalizeIP(
          headers["x-forwarded-for"] ||
            headers["x-real-ip"] ||
            "unknown"
        );

        const userAgent = headers["user-agent"] || "unknown";
        const deviceFingerprint = getDeviceFingerprint(userAgent);

        const user = await UserModel.findOne({ email }).select(
          "+hashedPassword +failedLoginAttempts +lockUntil +hardLock +lockCount +lastLockTime"
        );

        if (!user) throw new Error("INVALID_CREDENTIALS");
        if (!user.emailVerified) throw new Error("EMAIL_NOT_VERIFIED");
        if (user.hardLock) throw new Error("ACCOUNT_HARD_LOCKED");

        if (user.lockUntil && user.lockUntil > new Date()) {
          const minutes = Math.ceil(
            (user.lockUntil.getTime() - Date.now()) / 60000
          );
          throw new Error(`ACCOUNT_TEMP_LOCKED:${minutes}`);
        }

        if (
          user.lastLockTime &&
          Date.now() - user.lastLockTime.getTime() > HARDLOCK_WINDOW
        ) {
          user.lockCount = 0;
        }

        const isValid = await bcrypt.compare(
          password,
          user.hashedPassword ?? ""
        );

        if (!isValid) {
          user.failedLoginAttempts++;

          if (user.failedLoginAttempts >= MAX_ATTEMPTS) {
            user.lockUntil = new Date(Date.now() + TEMP_LOCK_TIME);
            user.failedLoginAttempts = 0;
            user.lockCount++;
            user.lastLockTime = new Date();

            if (user.lockCount >= HARDLOCK_THRESHOLD) {
              user.hardLock = true;
              await user.save();
              throw new Error("ACCOUNT_HARD_LOCKED");
            }

            await user.save();
            throw new Error("ACCOUNT_TEMP_LOCKED:10");
          }

          await user.save();
          throw new Error(
            `INVALID_PASSWORD:${MAX_ATTEMPTS - user.failedLoginAttempts}`
          );
        }

        /* ---------- login history ---------- */

        const lastLogin = user.loginHistory.at(-1);

        const isNewIP = lastLogin ? lastLogin.ip !== ip : false;
        const isNewDevice = lastLogin
          ? lastLogin.device !== deviceFingerprint
          : false;

        user.failedLoginAttempts = 0;
        user.lockUntil = null;
        user.lockCount = 0;
        user.hardLock = false;
        user.lastLogin = new Date();

        user.loginHistory.push({
          ip,
          userAgent,
          device: deviceFingerprint,
          at: new Date(),
          isNewIP,
          isNewDevice,
          isSuspicious: isNewIP || isNewDevice,
        } as IUser["loginHistory"][number]);

        if (user.loginHistory.length > 20) {
          user.loginHistory = user.loginHistory.slice(-20);
        }

        await user.save();

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerified: Boolean(user.emailVerified),
        } satisfies NextAuthUser;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || "user";
        token.emailVerified = !!user.emailVerified;
        token.providerId = user.providerId;

        token.backendJwt = jwt.sign(
          {
            id: token.id,
            email: token.email,
            role: token.role,
            emailVerified: token.emailVerified,
          },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRES_IN }
        );
      }

       // If signing in with Google, mark email as verified
      if (account?.provider === "google" && user) {
        token.emailVerified = true;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id!;
      session.user.role = token.role!;
      session.user.emailVerified = !!token.emailVerified;
      session.backendJwt = token.backendJwt as string;
      return session;
    },
  },
};
