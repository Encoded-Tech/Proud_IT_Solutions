import "next-auth";
import "next-auth/jwt";

// ------------------ NextAuth Session & User ------------------
declare module "next-auth" {
  interface Session {
    backendJwt?: string;
    user: {
      id: string;
      role: "user" | "admin";
      emailVerified: boolean;
      providerId?: string; // <--- add this
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "user" | "admin";
    emailVerified: boolean;
    providerId?: string; // <--- add this
  }
}

// ------------------ NextAuth JWT ------------------
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "user" | "admin";
    emailVerified?: boolean;
    backendJwt?: string;
    providerId?: string; // <--- add this
  }
}

// ------------------ Extend NextRequest ------------------
declare module "next/server" {
  interface NextRequest {
    user?: import("next-auth/jwt").JWT;
  }
}
