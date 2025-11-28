
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { RouteHandler, ContextWithParams } from "../types";
import { JWT } from "next-auth/jwt";

export type UserRole = "admin" | "user";


interface AuthOptions {
  roles?: UserRole[] ;
}

export interface AuthenticatedRequest extends NextRequest {
  user: JWT & {
    id: string;
    role: "admin" | "user";
    emailVerified: boolean;
  };
}

export function withAuth(
  handler: RouteHandler<AuthenticatedRequest>,
  options: AuthOptions = {}
): RouteHandler {
  return async (req: NextRequest, context?: ContextWithParams) => {
    const token = await getToken({ req });

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
    
    if (options.roles && !options.roles.includes(token.role)) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Access denied" },
        { status: 403 }
      );
    }
   

    (req as AuthenticatedRequest).user = token as AuthenticatedRequest["user"];

    return handler(req as AuthenticatedRequest, context);
  };
}

