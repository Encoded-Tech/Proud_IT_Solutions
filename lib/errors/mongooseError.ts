import { MongooseError } from "mongoose";

export function handleMongooseError(error: MongooseError) {
  if (error.name === "ValidationError") {
    return { statusCode: 400, message: `Validation error: ${error.message}`, code: "VALIDATION" };
  }
  if (error.name === "CastError") {
    return { statusCode: 400, message: "Invalid ID format provided", code: "VALIDATION" };
  }
  return null;
}