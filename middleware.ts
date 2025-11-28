import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // -------------------------------
  // 1️⃣ Public Routes (No Auth Required)
  // -------------------------------
  const publicRoutes = [
    "/login",
    "/register",
    "/auth/verify-email",
    "/forgot-password",
    "/reset-password",
    
  ];

  if (publicRoutes.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // -------------------------------
  // 2️⃣ Authentication Required
  // -------------------------------
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // -------------------------------
  // 3️⃣ Email Must Be Verified
  // -------------------------------
  if (!token.emailVerified) {
    // Only allow verification page to prevent redirect loop.
    if (!pathname.startsWith("/verify")) {
      return NextResponse.redirect(new URL("/verify", req.url));
    }
  }

  // -------------------------------
  // 4️⃣ Role-Based Rules
  // -------------------------------

  // Admin-only section
  if (pathname.startsWith("/admin")) {
    if (token.role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  // User or Admin allowed
  if (pathname.startsWith("/dashboard")) {
    if (!["user", "admin"].includes(token.role as string)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  // Add more protected areas here if needed:
  // if (pathname.startsWith("/seller")) ...

  // -------------------------------
  // 5️⃣ Allow Request
  // -------------------------------
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/orders/:path*",
    "/settings/:path*",

  ],
};
