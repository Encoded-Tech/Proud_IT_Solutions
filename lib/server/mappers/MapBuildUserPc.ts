import { IBuildRequest } from "@/models/buildMyPcModel";
import { Types } from "mongoose";

/** ----------------------------------
 * USER LITE
 * ---------------------------------*/
export interface UserLite {
  id: string;
  name?: string;
  email?: string;
}

/** ----------------------------------
 * PART DTO
 * ---------------------------------*/
export interface IBuildPartMapped {
  id: string;
  partId: string;
  type: string;
  name: string;
  imageUrl?: string;
  price: number;
  quantity: number;
}

/** ----------------------------------
 * BUILD DTO
 * ---------------------------------*/
export interface IBuildRequestMapped {
  id: string;
  user: UserLite;

  parts: IBuildPartMapped[];

  subtotal: number;

  grandTotal: number;

  status:
    | "draft"
    | "submitted"
    | "reviewed"
    | "approved"
    | "rejected"
    | "checked_out";

  compatibilityPassed: boolean;
  compatibilityStatus: "pending" | "passed" | "failed";

  adminNotes?: string;
  orderId?: string;

  createdAt: string;
  updatedAt: string;
}

type PopulatedUser = {
  _id: Types.ObjectId;
  name?: string;
  email?: string;
};

const isPopulatedUser = (user: unknown): user is PopulatedUser => {
  return typeof user === "object" && user !== null && "_id" in user;
};

export const mapBuildRequest = (
  doc: IBuildRequest & { _id: Types.ObjectId }
): IBuildRequestMapped => {
  const rawUser = doc.user as unknown;

  /** -----------------
   * USER MAP (safe)
   * ----------------- */
  let userMapped: UserLite;

  if (rawUser && isPopulatedUser(rawUser)) {
    userMapped = {
      id: rawUser._id?.toString() || "unknown",
      name: rawUser.name || "Unknown User",
      email: rawUser.email || undefined,
    };
  } else if (doc.user) {
    // handle if it's ObjectId
    userMapped = {
      id: (doc.user as Types.ObjectId)?.toString() || "unknown",
    };
  } else {
    // fallback if null
    userMapped = {
      id: "unknown",
      name: "Unknown User",
    };
  }

  /** -----------------
   * PARTS MAP (safe)
   * ----------------- */
  const partsMapped: IBuildPartMapped[] = (doc.parts || []).map((p) => ({
    id: `${p.part?.toString() || "unknown"}-${p.type}`,
    partId: p.part?.toString() || "unknown",
    type: p.type || "unknown",
    name: p.name || "Unknown Part",
    imageUrl: p.imageUrl,
    price: p.price ?? 0,
    quantity: p.quantity ?? 1,
  }));

  /** -----------------
   * FINAL DTO
   * ----------------- */
  return {
    id: doc._id?.toString() || "unknown",
    user: userMapped,
    parts: partsMapped,
    subtotal: doc.subtotal ?? 0,
    grandTotal: doc.grandTotal ?? 0,
    status: doc.status || "draft",
    compatibilityPassed: doc.compatibilityPassed ?? false,
    compatibilityStatus: doc.compatibilityStatus || "pending",
    adminNotes: doc.adminNotes,
    orderId: doc.orderId?.toString(),
    createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: doc.updatedAt?.toISOString() || new Date().toISOString(),
  };
};

export const mapBuildRequests = (
  docs: (IBuildRequest & { _id: Types.ObjectId })[]
): IBuildRequestMapped[] => docs.map(mapBuildRequest);
