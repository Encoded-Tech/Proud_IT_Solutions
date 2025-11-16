import { ERROR_DICTIONARY } from "../constants";
import { MongoErrorType } from "../types";

export function handleMongoError(error: MongoErrorType) {
  if (error.code === 11000) {
    const field = error.keyValue ? Object.keys(error.keyValue)[0] : "field";
    return { statusCode: 409, message: `A record with this ${field} already exists`, code: "DB_DUPLICATE" };
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