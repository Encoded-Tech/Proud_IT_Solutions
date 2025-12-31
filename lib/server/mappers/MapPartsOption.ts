// mappers/MapPartOption.ts

import { IPartOption } from "@/models/partsOption";
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


/** Map single part option */
export function mapPartOption(part: IPartOption) {
  return {
    _id: toStringId(part._id),
    name: part.name,
    type: part.type,
    brand: part.brand,
    modelName: part.modelName,
    price: part.price,
      imageUrl: part.imageUrl,
    socket: part.socket,
    chipset: part.chipset,
    ramType: part.ramType,
    wattage: part.wattage,
    lengthMM: part.lengthMM,
    storageType: part.storageType,
    capacityGB: part.capacityGB,
    isActive: part.isActive,
    createdAt: toISOStringSafe(part.createdAt),
    updatedAt: toISOStringSafe(part.updatedAt),
  };
}

/** Map array of parts */
export const mapPartOptionsArray = (parts: IPartOption[]) =>
  parts.map(mapPartOption);
