import type { NextAuthConfig, User as NextAuthUser } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

import bcrypt from "bcryptjs";
import crypto from "crypto";
import mongoose from "mongoose";


import { connectDB } from "@/db";
import UserModel, { IUser } from "@/models/userModel";

import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  NEXTAUTH_SECRET,

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

async function findSessionUser(token: {
  id?: unknown;
  sub?: unknown;
  email?: unknown;
  providerId?: unknown;
}) {
  const tokenId = typeof token.id === "string" ? token.id : "";
  const tokenSub = typeof token.sub === "string" ? token.sub : "";
  const tokenEmail = typeof token.email === "string" ? token.email : "";
  const tokenProviderId =
    typeof token.providerId === "string" ? token.providerId : "";

  if (mongoose.Types.ObjectId.isValid(tokenId)) {
    return UserModel.findById(tokenId).select("+hashedPassword").lean<IUser>();
  }

  if (tokenProviderId) {
    const user = await UserModel.findOne({ providerId: tokenProviderId })
      .select("+hashedPassword")
      .lean<IUser>();
    if (user) return user;
  }

  if (tokenSub) {
    const user = await UserModel.findOne({ providerId: tokenSub })
      .select("+hashedPassword")
      .lean<IUser>();
    if (user) return user;
  }

  if (tokenEmail) {
    return UserModel.findOne({ email: tokenEmail.toLowerCase() })
      .select("+hashedPassword")
      .lean<IUser>();
  }

  return null;
}

/* ---------------- authOptions ---------------- */

export const authOptions = {
  secret: NEXTAUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt" },

  providers: [
    /* ---------- Google ---------- */
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
     async profile(profile) {
  await connectDB();

  let user = await UserModel.findOne({
    provider: "google",
    providerId: profile.sub,
  });

  if (!user) {
    // 🚨 PREVENT creating Google user if email exists
    const emailExists = await UserModel.exists({
      email: profile.email,
    });

    if (emailExists) {
      // Return a TEMP user; signIn() will block
      return {
        id: "temp",
        name: profile.name,
        email: profile.email,
        role: "user",
        emailVerified: true,
        image: profile.picture,
      };
    }

    user = await UserModel.create({
      name: profile.name,
      email: profile.email,
      provider: "google",
      providerId: profile.sub,
      emailVerified: profile.email_verified ?? true,
      role: "user",
      image: profile.picture,
    });
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    emailVerified: Boolean(user.emailVerified),
    image: user.image || profile.picture,
  };
}

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

        const credentialEmail =
          typeof credentials?.email === "string" ? credentials.email : "";
        const credentialPassword =
          typeof credentials?.password === "string" ? credentials.password : "";

        if (!credentialEmail || !credentialPassword) {
          throw new Error("MISSING_CREDENTIALS");
        }

        const email = credentialEmail.toLowerCase();
        const password = credentialPassword;

        const ip = normalizeIP(
          req.headers.get("x-forwarded-for") ||
          req.headers.get("x-real-ip") ||
          "unknown"
        );

        const userAgent = req.headers.get("user-agent") || "unknown";
        const deviceFingerprint = getDeviceFingerprint(userAgent);

        const user = await UserModel.findOne({ email }).select(
          "+hashedPassword +failedLoginAttempts +lockUntil +hardLock +lockCount +lastLockTime"
        );

        if (!user) return null;
        if (user.provider === "google") throw new Error("USE_GOOGLE_LOGIN");
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
          return null;
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

    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await connectDB();

        const existingCredUser = await UserModel.findOne({
          email: user.email,
          provider: "credentials",
        });

        if (existingCredUser) {
          // ❌ block Google login
          return "/login?error=EMAIL_ALREADY_REGISTERED_WITH_CREDENTIALS";
        }
      }
      

      return true;
    },

    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id || token.id;
        token.role = user.role ?? "user";
        token.emailVerified = !!user.emailVerified;
        token.providerId ??= user.providerId;
      }

      if (account?.provider === "google") {
        await connectDB();

        const providerId =
          account.providerAccountId ||
          (typeof profile?.sub === "string" ? profile.sub : undefined);
        const email =
          typeof user?.email === "string"
            ? user.email
            : typeof token.email === "string"
              ? token.email
              : undefined;

        const dbUser = providerId
          ? await UserModel.findOne({ provider: "google", providerId })
              .select("+hashedPassword")
              .lean<IUser>()
          : email
            ? await UserModel.findOne({ email: email.toLowerCase() })
                .select("+hashedPassword")
                .lean<IUser>()
            : null;

        if (dbUser) {
          token.id = dbUser._id.toString();
          token.sub = dbUser._id.toString();
          token.email = dbUser.email;
          token.name = dbUser.name;
          token.picture = dbUser.image ?? token.picture;
          token.role = dbUser.role;
          token.emailVerified = Boolean(dbUser.emailVerified);
          token.providerId = dbUser.providerId ?? providerId;
        }
      }
      // Safety fallback for malformed / legacy tokens
      token.role ??= "user";
      token.emailVerified ??= false;

      return token;
    },

    async session({ session, token }) {
      await connectDB();

      const user = await findSessionUser(token);

      if (!user) return session;
      session.user = {
        id: user._id.toString(),
        sub: token.sub,
        name: user.name ?? undefined,
        email: user.email ?? undefined,
        phone: user.phone ?? undefined,
        image: user.image ?? undefined,
        hasPassword: Boolean(user.hashedPassword),
        providerId: user.providerId ?? undefined,
        role: user.role,
        emailVerified: Boolean(user.emailVerified),
      } as typeof session.user;

      return session;
    }


  },
} satisfies NextAuthConfig;
