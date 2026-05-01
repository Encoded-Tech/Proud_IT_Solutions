import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

function noStore(response: NextResponse) {
  response.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  response.headers.set("CDN-Cache-Control", "no-store");
  return response;
}

function redirectTo(path: string, req: NextRequest) {
  return noStore(NextResponse.redirect(new URL(path, req.url)));
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

const token = authSecret
  ? await getToken({
      req,
      secret: authSecret,
    })
  : null;

const role = String(token?.role || "").toLowerCase();
const emailVerified = token?.emailVerified === true;

  const publicRoutes = [
    "/login",
    "/register",
    "/auth/verify-email",
    "/forgot-password",
    "/reset-password",
  ];

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Auth pages should never be publicly cached.
  // If already logged in, send user away from login/register.
  if (isPublicRoute) {
    if (token && pathname.startsWith("/login")) {
      if (role === "admin") {
        return redirectTo("/admin", req);
      }

      if (role === "user") {
        return redirectTo("/account", req);
      }
    }

    return noStore(NextResponse.next());
  }

  // Protected routes need session token.
  if (!token) {
    return redirectTo("/login", req);
  }

  // Verified email required.
  if (!emailVerified && !pathname.startsWith("/verify")) {
    return redirectTo("/verify-email", req);
  }

  // Admin-only routes.
  if (pathname.startsWith("/admin")) {
    if (role !== "admin") {
      return redirectTo("/unauthorized", req);
    }

    return noStore(NextResponse.next());
  }

  // User account routes.
  if (pathname.startsWith("/account")) {
    if (role !== "user") {
      return redirectTo("/unauthorized", req);
    }

    return noStore(NextResponse.next());
  }

  // Dashboard can allow user or admin.
  if (pathname.startsWith("/dashboard")) {
    if (!["user", "admin"].includes(role)) {
      return redirectTo("/unauthorized", req);
    }

    return noStore(NextResponse.next());
  }

  return noStore(NextResponse.next());
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    "/profile/:path*",
    "/orders/:path*",
    "/settings/:path*",
    "/login",
    "/register",
    "/auth/:path*",
    "/forgot-password",
    "/reset-password",
    "/verify",
    "/verify-email",
    "/dashboard/:path*",
  ],
};