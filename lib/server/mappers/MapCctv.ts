import { CCTV_PART_LABELS, CctvPartType } from "@/constants/cctv";
import {
  ICctvInstallationRequest,
  ICctvPart,
  CctvInstallationStatus,
} from "@/models/cctvInstallationModel";
import { Types } from "mongoose";

type PopulatedUser = {
  _id: Types.ObjectId;
  name?: string;
  email?: string;
};

export interface CctvPartMapped {
  id: string;
  name: string;
  type: CctvPartType;
  typeLabel: string;
  brand?: string;
  modelName?: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isRequired: boolean;
  isActive: boolean;
}

export interface CctvInstallationItemMapped {
  id: string;
  partId: string;
  type: CctvPartType;
  typeLabel: string;
  name: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  notes?: string;
}

export interface CctvInstallationRequestMapped {
  id: string;
  orderId?: string;
  user: {
    id: string;
    name?: string;
    email?: string;
  };
  items: CctvInstallationItemMapped[];
  customerDetails: {
    name: string;
    phone: string;
    email: string;
    siteAddress: string;
    notes?: string;
  };
  subtotal: number;
  grandTotal: number;
  status: CctvInstallationStatus;
  paymentStatus: "pending" | "submitted" | "paid" | "failed";
  paymentMethod?: "COD" | "OnlineUpload";
  adminRemarks?: string;
  createdAt: string;
  updatedAt: string;
}

function isPopulatedUser(user: unknown): user is PopulatedUser {
  return typeof user === "object" && user !== null && "_id" in user;
}

export function mapCctvPart(part: ICctvPart): CctvPartMapped {
  return {
    id: part._id.toString(),
    name: part.name,
    type: part.type,
    typeLabel: CCTV_PART_LABELS[part.type],
    brand: part.brand,
    modelName: part.modelName,
    description: part.description,
    price: part.price ?? 0,
    imageUrl: part.imageUrl,
    isRequired: part.isRequired ?? false,
    isActive: part.isActive ?? true,
  };
}

export function mapCctvParts(parts: ICctvPart[]): CctvPartMapped[] {
  return parts.map(mapCctvPart);
}

export function mapCctvInstallationRequest(
  request: ICctvInstallationRequest
): CctvInstallationRequestMapped {
  const rawUser = request.user as unknown;
  const user = isPopulatedUser(rawUser)
    ? {
        id: rawUser._id.toString(),
        name: rawUser.name,
        email: rawUser.email,
      }
    : {
        id: request.user?.toString() || "unknown",
      };

  return {
    id: request._id.toString(),
    orderId: request.order ? request.order.toString() : undefined,
    user,
    items: (request.items || []).map((item) => ({
      id: `${item.part.toString()}-${item.type}`,
      partId: item.part.toString(),
      type: item.type,
      typeLabel: CCTV_PART_LABELS[item.type],
      name: item.name,
      imageUrl: item.imageUrl,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
      notes: item.notes,
    })),
    customerDetails: request.customerDetails,
    subtotal: request.subtotal ?? 0,
    grandTotal: request.grandTotal ?? 0,
    status: request.status,
    paymentStatus: request.paymentStatus,
    paymentMethod: request.paymentMethod,
    adminRemarks: request.adminRemarks,
    createdAt: request.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: request.updatedAt?.toISOString() || new Date().toISOString(),
  };
}

export function mapCctvInstallationRequests(
  requests: ICctvInstallationRequest[]
): CctvInstallationRequestMapped[] {
  return requests.map(mapCctvInstallationRequest);
}
