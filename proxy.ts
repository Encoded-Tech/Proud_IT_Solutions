import { auth } from "@/auth";
import { NextResponse } from "next/server";

function noStore(response: NextResponse) {
  response.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  response.headers.set("CDN-Cache-Control", "no-store");
  return response;
}

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const role = String(session?.user?.role || "").toLowerCase();
  const emailVerified = session?.user?.emailVerified === true;

  const publicRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/verify-email/confirm",
  ];

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isPublicRoute) {
    if (session?.user?.id && pathname.startsWith("/login")) {
      if (role === "admin") {
        return noStore(NextResponse.redirect(new URL("/admin", req.url)));
      }

      if (role === "user") {
        return noStore(NextResponse.redirect(new URL("/account", req.url)));
      }
    }

    return noStore(NextResponse.next());
  }

  if (!session?.user?.id) {
    return noStore(NextResponse.redirect(new URL("/login", req.url)));
  }

  if (!emailVerified && !pathname.startsWith("/verify-email")) {
    return noStore(NextResponse.redirect(new URL("/verify-email", req.url)));
  }

  if (pathname.startsWith("/admin")) {
    if (role !== "admin") {
      return noStore(NextResponse.redirect(new URL("/unauthorized", req.url)));
    }

    return noStore(NextResponse.next());
  }

  if (pathname.startsWith("/account")) {
    if (role !== "user") {
      return noStore(NextResponse.redirect(new URL("/unauthorized", req.url)));
    }

    return noStore(NextResponse.next());
  }

  if (pathname.startsWith("/dashboard")) {
    if (!["user", "admin"].includes(role)) {
      return noStore(NextResponse.redirect(new URL("/unauthorized", req.url)));
    }

    return noStore(NextResponse.next());
  }

  return noStore(NextResponse.next());
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    "/profile/:path*",
    "/orders/:path*",
    "/settings/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email/:path*",
    "/dashboard/:path*",
  ],
};