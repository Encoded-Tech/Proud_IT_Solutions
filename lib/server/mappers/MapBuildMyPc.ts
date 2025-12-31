// // lib/mappers/MapBuildRequest.ts

// import { IBuildRequest, IPart } from "@/models/buildMyPcModel";


// /** DTO for Build My PC request (client-side) */
// export interface BuildRequestDTO {
//   _id: string;
//   userId?: string;
//   name?: string;
//   phone?: string;
//   email?: string;
//   budgetNPR?: number;
//   uses?: string[];
//   targetResolution?: string;
//   targetFPS?: number;
//   cpuPreference?: string;
//   cpuModel?: string;
//   gpuPreference?: string;
//   gpuModel?: string;
//   ramGB?: number;
//   ramType?: string;
//   osPreference?: string;
//   rgbPreference?: boolean;
//   smallFormFactor?: boolean;
//   storage?: {
//     nvme?: boolean;
//     ssdGB?: number;
//     hddGB?: number;
//   };
//   peripherals?: {
//     monitor?: boolean;
//     keyboard?: boolean;
//     mouse?: boolean;
//     ups?: boolean;
//   };
//   recommendedParts?: {
//     cpu?: IPart;
//     motherboard?: IPart;
//     ram?: IPart;
//     gpu?: IPart;
//     storagePrimary?: IPart;
//     storageSecondary?: IPart;
//     psu?: IPart;
//     case?: IPart;
//     cooler?: IPart;
//     monitor?: IPart;
//     keyboard?: IPart;
//     mouse?: IPart;
//     ups?: IPart;
//   };
//   status?: string;
//   adminNotes?: string;
//   priceEstimate?: number;
//   finalPrice?: number;
//   deliveryETA?: string;
//   createdAt?: string;
//   updatedAt?: string;
// }



// /** Mapper for single server document → client DTO */
// export function mapBuildRequest(serverData: IBuildRequest): BuildRequestDTO {
//   return {
//     _id: serverData._id.toString(),
//     userId: serverData.userId?.toString(),
//     name: serverData.name,
//     phone: serverData.phone,
//     email: serverData.email,
//     budgetNPR: serverData.budgetNPR,
//     uses: serverData.uses || [],
//     targetResolution: serverData.targetResolution,
//     targetFPS: serverData.targetFPS,
//     cpuPreference: serverData.cpuPreference,
//     cpuModel: serverData.cpuModel,
//     gpuPreference: serverData.gpuPreference,
//     gpuModel: serverData.gpuModel,
//     ramGB: serverData.ramGB,
//     ramType: serverData.ramType,
//     osPreference: serverData.osPreference,
//     rgbPreference: serverData.rgbPreference,
//     smallFormFactor: serverData.smallFormFactor,
//     storage: serverData.storage
//       ? {
//           nvme: serverData.storage.nvme,
//           ssdGB: serverData.storage.ssdGB,
//           hddGB: serverData.storage.hddGB,
//         }
//       : undefined,
//     peripherals: serverData.peripherals
//       ? {
//           monitor: serverData.peripherals.monitor,
//           keyboard: serverData.peripherals.keyboard,
//           mouse: serverData.peripherals.mouse,
//           ups: serverData.peripherals.ups,
//         }
//       : undefined,
//     recommendedParts: serverData.recommendedParts
//       ? { ...serverData.recommendedParts }
//       : undefined,
//     status: serverData.status,
//     adminNotes: serverData.adminNotes,
//     priceEstimate: serverData.priceEstimate,
//     finalPrice: serverData.finalPrice,
//     deliveryETA: serverData.deliveryETA,
//     createdAt: serverData.createdAt?.toISOString(),
//     updatedAt: serverData.updatedAt?.toISOString(),
//   };
// }

// /** Mapper for array of server documents → array of client DTOs */
// export function mapBuildRequestsArray(serverData: IBuildRequest[]): BuildRequestDTO[] {
//   return serverData.map(mapBuildRequest);
// }


// lib/mappers/MapBuildRequest.ts

import { IBuildRequest, IPart } from "@/models/buildMyPcModel";
import { Types } from "mongoose";

/** Mongo ObjectId or already-string id */
type IdLike = Types.ObjectId | string | undefined;

/** Date coming from Mongoose or already serialized */
type DateLike = Date | string | undefined;

/** Safely normalize Mongo ObjectId → string */
export const toStringId = (value: IdLike): string | undefined => {
  if (!value) return undefined;
  return typeof value === "string" ? value : value.toString();
};

/** Safely normalize Date → ISO string */
export const toISOStringSafe = (value: DateLike): string | undefined => {
  if (!value) return undefined;
  return value instanceof Date ? value.toISOString() : value;
};

/** ---------- DTO ---------- */
export interface BuildRequestDTO {
  _id: string;
  userId?: string;

  name?: string;
  phone?: string;
  email?: string;

  budgetNPR?: number;
  uses?: string[];

  targetResolution?: string;
  targetFPS?: number;

  cpuPreference?: string;
  cpuModel?: string;
  gpuPreference?: string;
  gpuModel?: string;
  ramGB?: number;
  ramType?: string;
  osPreference?: string;
  rgbPreference?: boolean;
  smallFormFactor?: boolean;

  storage?: {
    nvme?: boolean;
    ssdGB?: number;
    hddGB?: number;
  };

  peripherals?: {
    monitor?: boolean;
    keyboard?: boolean;
    mouse?: boolean;
    ups?: boolean;
  };

  recommendedParts?: Record<string, IPart>;

  status?: string;

  /** 🔥 NEW */
  quoteId?: string;
  paymentStatus?: string;
  checkoutOrderId?: string;

  advanceAmount?: number;
  remainingAmount?: number;

  adminNotes?: string;
  priceEstimate?: number;
  finalPrice?: number;
  deliveryETA?: string;

  createdAt?: string;
  updatedAt?: string;
}

/** ---------- Single Mapper ---------- */
export function mapBuildRequest(serverData: IBuildRequest): BuildRequestDTO {
  return {
    _id: toStringId(serverData._id)!,
    userId: toStringId(serverData.userId),

    name: serverData.name,
    phone: serverData.phone,
    email: serverData.email,

    budgetNPR: serverData.budgetNPR,
    uses: serverData.uses ?? [],

    targetResolution: serverData.targetResolution,
    targetFPS: serverData.targetFPS,

    cpuPreference: serverData.cpuPreference,
    cpuModel: serverData.cpuModel,
    gpuPreference: serverData.gpuPreference,
    gpuModel: serverData.gpuModel,
    ramGB: serverData.ramGB,
    ramType: serverData.ramType,
    osPreference: serverData.osPreference,
    rgbPreference: serverData.rgbPreference,
    smallFormFactor: serverData.smallFormFactor,

    storage: serverData.storage
      ? { ...serverData.storage }
      : undefined,

    peripherals: serverData.peripherals
      ? { ...serverData.peripherals }
      : undefined,

    recommendedParts: serverData.recommendedParts
      ? Object.fromEntries(
          Object.entries(serverData.recommendedParts).map(([k, v]) => [
            k,
            { ...(v as IPart) },
          ])
        )
      : undefined,

    status: serverData.status,

    /** 🔥 PAYMENT & QUOTE */
    quoteId: serverData.quoteId,
    paymentStatus: serverData.paymentStatus,
    checkoutOrderId: toStringId(serverData.checkoutOrderId),

    advanceAmount: serverData.advanceAmount,
    remainingAmount: serverData.remainingAmount,

    adminNotes: serverData.adminNotes,
    priceEstimate: serverData.priceEstimate,
    finalPrice: serverData.finalPrice,
    deliveryETA: serverData.deliveryETA,

    createdAt: toISOStringSafe(serverData.createdAt),
    updatedAt: toISOStringSafe(serverData.updatedAt),
  };
}


/** ---------- Array Mapper ---------- */
export const mapBuildRequestsArray = (data: IBuildRequest[]): BuildRequestDTO[] =>
  data.map(mapBuildRequest);
