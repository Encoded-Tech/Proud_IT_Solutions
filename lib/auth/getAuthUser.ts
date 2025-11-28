// lib/auth/getAuthUser.ts
import { NextRequest } from "next/server";

export const getAuthUserId = (req: NextRequest): string => {
  const currentUser = req.user;

  if (!currentUser || !currentUser.id) {
    // This should NEVER happen if withAuth is working
    throw new Error("Authenticated user missing on request");
  }

  return currentUser.id;
};
