import "next-auth";
import "next-auth/jwt";
import type { DefaultSession } from "next-auth";

// ------------------ NextAuth Session & User ------------------
declare module "next-auth" {
  interface Session {
    backendJwt?: string;
    user: Omit<NonNullable<DefaultSession["user"]>, "emailVerified"> & {
      id: string;
      sub?: string;
      role: "user" | "admin";
      emailVerified: boolean;
      phone?: string;
      hasPassword?: boolean;
      providerId?: string;
    };
  }

  interface User {
    id: string;
    sub?: string;
    role: "user" | "admin";
    emailVerified: boolean;
    phone?: string;
    hasPassword?: boolean;
    providerId?: string;
  }
}

// ------------------ NextAuth JWT ------------------
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "user" | "admin";
    emailVerified?: boolean;
    backendJwt?: string;
    providerId?: string;
  }
}

// ------------------ Extend NextRequest ------------------
declare module "next/server" {
  interface NextRequest {
    user?: import("next-auth/jwt").JWT;
  }
}
