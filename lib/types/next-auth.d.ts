import "next-auth";
import "next-auth/jwt";


// --------------------------------------
// NEXT-AUTH SESSION TYPING
// --------------------------------------
declare module "next-auth" {
  interface Session {
    backendJwt?: string;

    user: {
      id: string;
      role: "user" | "admin";
      emailVerified: boolean;

      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    role: "user" | "admin";
    emailVerified: boolean;

    name?: string;
    image?: string;
    phone?: string;

    provider?: string;
    providerId?: string;

    emailVerificationToken?: string;
    emailVerificationExpiry?: Date;

    loginHistory?: Array<{
      ip: string;
      userAgent: string;
      at: Date;
      isNewIP?: boolean;
      isNewDevice?: boolean;
      isSuspicious?: boolean;
    }>;
  }
}

// --------------------------------------
// NEXT-AUTH JWT TYPING
// --------------------------------------
declare module "next-auth/jwt" {
  interface JWT {
    backendJwt?: string;

    id: string;
    role: "user" | "admin";
    emailVerified: boolean;

    name?: string | null;
    email?: string | null;
    picture?: string | null;
  }
}

// --------------------------------------
// EXTEND NextRequest TO SUPPORT req.user
// --------------------------------------
declare module "next/server" {
  interface NextRequest {
    user?: import("next-auth/jwt").JWT;
  }
}
