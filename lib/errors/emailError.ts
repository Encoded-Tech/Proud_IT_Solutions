import { ERROR_DICTIONARY } from "../constants";
import { EmailErrorType } from "../types";

export function handleEmailError(error: EmailErrorType) {
  if (
    error.response?.includes("SMTP") ||
    error.message?.includes("Email delivery failed") ||
    error.message?.includes("Resend API request failed")
  ) {
    return { statusCode: 502, message: ERROR_DICTIONARY.EMAIL_FAILURE, code: "EMAIL_FAILURE" };
  }
  return null;
}
