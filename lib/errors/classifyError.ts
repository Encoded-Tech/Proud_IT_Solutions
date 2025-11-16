import { AppError } from "../class";
import { MongooseError } from "mongoose";
import { handleMongoError, handleMongooseError, handleEmailError } from "../errors";
import { ERROR_DICTIONARY } from "../constants";
import { MongoErrorType, NodemailerErrorType } from "../types";

export function classifyError(error: unknown) {
  const safeError = error instanceof Error ? error : new Error(String(error));

  let statusCode = 500;
  let friendlyMessage = ERROR_DICTIONARY.UNKNOWN;
  let errorCode = "UNKNOWN";

  if (safeError instanceof AppError) {
    statusCode = safeError.statusCode;
    friendlyMessage = safeError.message;
    errorCode = safeError.errorCode || "APP_ERROR";
  } else if (safeError instanceof MongooseError) {
    const mongooseHandled = handleMongooseError(safeError);
    if (mongooseHandled) {
      statusCode = mongooseHandled.statusCode;
      friendlyMessage = mongooseHandled.message;
      errorCode = mongooseHandled.code;
    }
  }

  const mongoHandled = handleMongoError(safeError as MongoErrorType);
  if (mongoHandled) {
    statusCode = mongoHandled.statusCode;
    friendlyMessage = mongoHandled.message;
    errorCode = mongoHandled.code;
  }

  const emailHandled = handleEmailError(safeError as NodemailerErrorType);
  if (emailHandled) {
    statusCode = emailHandled.statusCode;
    friendlyMessage = emailHandled.message;
    errorCode = emailHandled.code;
  }

  return { safeError, statusCode, friendlyMessage, errorCode };
}
