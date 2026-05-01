import { NextRequest } from "next/server";
import { AuthenticatedRequest } from "../HOF/withAuth";
import { resolveAuthUserId } from "./resolveAuthUser";

/**
 * Resolves the authenticated user's Mongo _id from a request.
 * Supports direct auth.id or OAuth providerId.
 */
export async function getAuthUserId(req: NextRequest): Promise<string> {
  const authReq = req as AuthenticatedRequest;

  if (!authReq.auth) {
    throw new Error("UNAUTHORIZED");
  }

  const userId = await resolveAuthUserId(authReq.auth);
  if (userId) {
    authReq.auth.id = userId;
    return userId;
  }

  throw new Error("UNAUTHORIZED");
}
