
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { RouteHandler } from "../types";


export type UserRole = "admin" | "user";


interface AuthOptions {
  roles?: UserRole[] ;
}

export interface AuthenticatedRequest extends NextRequest {
  auth?: {
    id: string;
    role: UserRole;
    emailVerified: boolean;
    providerId?: string;
    email?: string;
  };
}


export function withAuth(
  handler: RouteHandler<AuthenticatedRequest>,
  options: AuthOptions = {}
): RouteHandler {
  return async (...args) => {
    const req = args[0] as AuthenticatedRequest;
    const context = args[1];

   const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    console.log("TOKEN:", token);


    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!token.emailVerified) {
      return NextResponse.json(
        { success: false, message: "Email not verified" },
        { status: 403 }
      );
    }

    if (options.roles && !options.roles.includes(token.role as UserRole)) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Access denied" },
        { status: 403 }
      );
    }

   (req as AuthenticatedRequest).auth = {
  id: (token.id || token.providerId) as string, // fallback to providerId
  role: token.role as UserRole,
  emailVerified: token.emailVerified as boolean,
  email: token.email as string,
  providerId: token.providerId as string | undefined,
};
    
    return handler(
      ...(context ? [req, context] : [req])
    );
  };
}

