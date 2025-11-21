import { ERROR_DICTIONARY } from "../constants";
import { MongoErrorType } from "../types";

export function handleMongoError(error: MongoErrorType, resourceName?: string) {
  if (error.code === 11000) {
    const field = error.keyValue ? Object.keys(error.keyValue)[0] : "field";
    const value = error.keyValue ? error.keyValue[field] : "";  

    const fieldNameMap: Record<string, string> = {
      slug: "name",
      name: "name",
      title: "title",
      categoryName: "name"
    };
    const readableField = fieldNameMap[field] || field;

     // Use resourceName if provided, fallback to generic "Record"
     const entity = resourceName
     ? resourceName.charAt(0).toUpperCase() + resourceName.slice(1)
     : "Record";

    return {
      statusCode: 409,
      code: "DB_DUPLICATE",
      message: `${entity} with this ${readableField} '${value}' already exists`,
    };
  }
  if (error.message?.includes("ECONNREFUSED") || error.message?.includes("connection failed")) {
    return { statusCode: 503, message: ERROR_DICTIONARY.DB_CONNECTION, code: "DB_CONNECTION" };
  }
  if (error.message?.includes("timeout")) {
    return { statusCode: 504, message: ERROR_DICTIONARY.DB_TIMEOUT, code: "DB_TIMEOUT" };
  }
  if (error.message?.includes("rate limit") || error.code === 16386) {
    return { statusCode: 429, message: ERROR_DICTIONARY.RATE_LIMIT, code: "RATE_LIMIT" };
  }
  return null;
}