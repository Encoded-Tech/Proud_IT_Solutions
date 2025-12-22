import { NextRequest } from "next/server";
import { AuthenticatedRequest } from "../HOF/withAuth";
import User from "@/models/userModel";

/**
 * Resolves the authenticated user's Mongo _id from a request.
 * Supports direct auth.id or OAuth providerId.
 */
export async function getAuthUserId(req: NextRequest): Promise<string> {
  const authReq = req as AuthenticatedRequest;

  if (!authReq.auth) {
    throw new Error("UNAUTHORIZED");
  }

  // If auth.id is present, verify it exists in Mongo
  if (authReq.auth.id) {
    const user = await User.findById(authReq.auth.id).select("_id");
    if (!user) throw new Error("UNAUTHORIZED");
    // Ensure auth.id is normalized to Mongo _id string
    authReq.auth.id = user._id.toString();
    return authReq.auth.id;
  }

  // Fallback: use providerId (Google or other OAuth)
  if (authReq.auth.providerId) {
    const user = await User.findOne({ providerId: authReq.auth.providerId }).select("_id");
    if (!user) throw new Error("UNAUTHORIZED");

    // Cache the Mongo _id for downstream usage
    authReq.auth.id = user._id.toString();
    return authReq.auth.id;
  }

  // If neither id nor providerId exist, throw
  throw new Error("UNAUTHORIZED");
}
