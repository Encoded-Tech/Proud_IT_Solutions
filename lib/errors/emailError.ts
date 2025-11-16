import { ERROR_DICTIONARY } from "../constants";
import { NodemailerErrorType } from "../types";

export function handleEmailError(error: NodemailerErrorType) {
  if (error.response?.includes("SMTP")) {
    return { statusCode: 502, message: ERROR_DICTIONARY.EMAIL_FAILURE, code: "EMAIL_FAILURE" };
  }
  return null;
}