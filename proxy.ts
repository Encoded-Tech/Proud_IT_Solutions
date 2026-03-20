// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { getToken } from "next-auth/jwt";

// export async function middleware(req: NextRequest) {
//   const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
//   const { pathname } = req.nextUrl;

//   // -------------------------------
//   // 1️⃣ Public Routes (No Auth Required)
//   // -------------------------------
//   const publicRoutes = [
//     "/login",
//     "/register",
//     "/auth/verify-email",
//     "/forgot-password",
//     "/reset-password",
    
//   ];

//    const response = NextResponse.next();

//   if (publicRoutes.some((p) => pathname.startsWith(p))) {
//     return NextResponse.next();
//   }

//   // -------------------------------
//   // 2️⃣ Authentication Required
//   // -------------------------------
//   if (!token) {
//     return NextResponse.redirect(new URL("/login", req.url));
//   }

//   // -------------------------------
//   // 3️⃣ Email Must Be Verified
//   // -------------------------------
//   if (!token.emailVerified) {
//     // Only allow verification page to prevent redirect loop.
//     if (!pathname.startsWith("/verify")) {
//       return NextResponse.redirect(new URL("/verify", req.url));
//     }
//   }

//   // -------------------------------
//   // 4️⃣ Role-Based Rules
//   // -------------------------------

//   // Admin-only section
//   if (pathname.startsWith("/admin")) {
//     if (token.role !== "admin") {
//       return NextResponse.redirect(new URL("/unauthorized", req.url));
//     }
//   }

//   if (pathname.startsWith("/account")) {
//     if (token.role !== "user") {
//       return NextResponse.redirect(new URL("/unauthorized", req.url));
//     }
//   }

                                                                        

//   // User or Admin allowed
//   if (pathname.startsWith("/dashboard")) {
//     if (!["user", "admin"].includes(token.role as string)) {
//       return NextResponse.redirect(new URL("/unauthorized", req.url));
//     }
//   }

  
//     if (pathname.startsWith('/admin')) {
//    response.headers.set('Cache-Control', 'no-store, max-age=0');
//   }

//   // -------------------------------
//   // 5️⃣ Allow Request
//   // -------------------------------
//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/admin/:path*",
//      "/account/:path*", 
//     "/profile/:path*",
//     "/orders/:path*",
//     "/settings/:path*",

//   ],
// };


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

  // If it's a public route, allow access with cache headers
  if (publicRoutes.some((p) => pathname.startsWith(p))) {
    const response = NextResponse.next();
    
    // Add cache headers for public routes if needed
    response.headers.set('Cache-Control', 'public, max-age=3600');
    
    return response;
  }

  // -------------------------------
  // 2️⃣ Authentication Required
  // -------------------------------
  if (!token) {
    const response = NextResponse.redirect(new URL("/login", req.url));
    // Prevent caching of redirect responses
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    return response;
  }

  // -------------------------------
  // 3️⃣ Email Must Be Verified
  // -------------------------------
  if (!token.emailVerified && !pathname.startsWith("/verify")) {
    const response = NextResponse.redirect(new URL("/verify", req.url));
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    return response;
  }

  // -------------------------------
  // 4️⃣ Role-Based Rules
  // -------------------------------
  
  // Helper function to create unauthorized redirect
  const createUnauthorizedRedirect = () => {
    const response = NextResponse.redirect(new URL("/unauthorized", req.url));
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    return response;
  };

  // Admin-only section
  if (pathname.startsWith("/admin")) {
    if (token.role !== "admin") {
      return createUnauthorizedRedirect();
    }
    
    // For admin routes, create response and set no-cache headers
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    // Additional headers for Cloudflare
    response.headers.set('CDN-Cache-Control', 'no-store');
    response.headers.set('Vary', '*');
    
    return response;
  }

  // User-only account section
  if (pathname.startsWith("/account")) {
    if (token.role !== "user") {
      return createUnauthorizedRedirect();
    }
  }

  // User or Admin allowed for dashboard
  if (pathname.startsWith("/dashboard")) {
    if (!["user", "admin"].includes(token.role as string)) {
      return createUnauthorizedRedirect();
    }
  }

  // For all other protected routes
  const response = NextResponse.next();
  
  // Optional: Add cache headers for non-admin protected routes
  if (pathname.startsWith("/account") || pathname.startsWith("/dashboard")) {
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  }
  
  return response;
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
    "/dashboard/:path*",
  ],
};