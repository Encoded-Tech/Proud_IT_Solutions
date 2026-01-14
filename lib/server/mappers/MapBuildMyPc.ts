import { IBuildRequest } from "@/models/buildMyPcModel";
import { Types, Document } from "mongoose";

/** USER LITE TYPE */
export interface UserLite {
  id: string;
  name?: string;
  email?: string;
}

/** BUILD PART MAPPED TYPE */
export interface IBuildPartMapped {
  id: string;       // unique key for frontend (partId + type)
  partId: string;   // original PartOption ObjectId as string
  type: string;
  name: string;
  imageUrl?: string;
  price: number;
  quantity: number;
}

/** FINAL BUILD REQUEST MAPPED TYPE */
export interface IBuildRequestMapped {
  id: string;
  user: UserLite;
  parts: IBuildPartMapped[];
  subtotal: number;
  grandTotal: number;
  status: "draft" | "submitted" | "reviewed" | "approved" | "rejected" | "checked_out";
  compatibilityPassed: boolean;
  compatibilityStatus: "pending" | "passed" | "failed";
  adminNotes?: string;
  orderId?: string;
  createdAt: string;
  updatedAt: string;
}

/** TYPE GUARD: check if user is populated */
const isPopulatedUser = (
  user: Types.ObjectId | { _id: Types.ObjectId; name: string; email: string }
): user is { _id: Types.ObjectId; name: string; email: string } => {
  return typeof user === "object" && "_id" in user && "name" in user && "email" in user;
};

/** MAP SINGLE BUILD REQUEST */
export const mapBuildRequest = (doc: IBuildRequest & Document): IBuildRequestMapped => {
  const user = doc.user;

  const userMapped: UserLite = isPopulatedUser(user)
    ? { id: user._id.toString(), name: user.name, email: user.email }
    : { id: user instanceof Types.ObjectId ? user.toString() : "", name: undefined, email: undefined };

  return {
    id: doc._id.toString(),
    user: userMapped,
    parts: doc.parts.map((p) => ({
      id: `${p.part.toString()}-${p.type}`,
      partId: p.part.toString(),
      type: p.type,
      name: p.name,
      price: p.price,
      imageUrl: p.imageUrl,
      quantity: p.quantity,
    })),
    subtotal: doc.subtotal,
    grandTotal: doc.grandTotal,
    status: doc.status,
    compatibilityPassed: doc.compatibilityPassed ?? false,
    compatibilityStatus: doc.compatibilityStatus,
    adminNotes: doc.adminNotes,
    orderId: doc.orderId?.toString(),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
};

/** MAP MULTIPLE BUILD REQUESTS */
export const mapBuildRequests = (docs: (IBuildRequest & Document)[]): IBuildRequestMapped[] => {
  return docs.map(mapBuildRequest);
};
