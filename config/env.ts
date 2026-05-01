import "server-only";

const LOCAL_APP_URL = "http://localhost:3000";

function normalizeAppUrl(value?: string | null) {
  const trimmedValue = value?.trim().replace(/^["']|["']$/g, "");
  if (!trimmedValue) return null;

  try {
    const url = new URL(trimmedValue);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.origin.replace(/\/$/, "");
  } catch {
    return null;
  }
}

function isLocalAppUrl(value: string) {
  try {
    const hostname = new URL(value).hostname.toLowerCase();
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname === "[::1]"
    );
  } catch {
    return false;
  }
}

function resolveAppUrl() {
  const configuredUrl =
    normalizeAppUrl(process.env.APP_URL) ||
    normalizeAppUrl(process.env.NEXT_PUBLIC_APP_URL) ||
    normalizeAppUrl(process.env.NEXT_PUBLIC_SERVER_URL) ||
    normalizeAppUrl(process.env.FRONTEND_URL) ||
    normalizeAppUrl(process.env.NEXTAUTH_URL);

  const appUrl = configuredUrl || LOCAL_APP_URL;

  if (process.env.NODE_ENV === "production" && isLocalAppUrl(appUrl)) {
    throw new Error(
      "APP_URL or NEXT_PUBLIC_APP_URL must be configured to a public URL in production."
    );
  }

  return appUrl;
}

export const APP_URL = resolveAppUrl();

export function buildAppUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${APP_URL}${normalizedPath}`;
}

export const MONGODB_URI = process.env.MONGODB_URI as string;

export const SERVER_URL = APP_URL;
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME as string;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY as string;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET as string;
export const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER as string;
export const GOOGLE_CLIENT_ID =  process.env.GOOGLE_CLIENT_ID  as string;
export const GOOGLE_CLIENT_SECRET =  process.env.GOOGLE_CLIENT_SECRET as string;
export const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET as string;
export const MAX_ATTEMPTS = parseInt(process.env.MAX_ATTEMPTS as string);
export const TEMP_LOCK_TIME = parseInt(process.env.TEMP_LOCK_TIME as string);
export const HARDLOCK_THRESHOLD = parseInt(process.env.HARDLOCK_THRESHOLD as string);
export const HARDLOCK_WINDOW = parseInt(process.env.HARDLOCK_WINDOW as string);
export const JWT_SECRET = process.env.JWT_SECRET as string;
export const JWT_EXPIRES_IN = parseInt(process.env.JWT_EXPIRES_IN as string);
export const RESET_TOKEN_EXPIRES_MIN = parseInt(process.env.RESET_TOKEN_EXPIRES_MIN as string);
export const RATE_LIMIT_MAX_REQ = parseInt(process.env.RATE_LIMIT_MAX_REQ as string);
export const FRONTEND_URL = APP_URL;
export const RESEND_API_KEY = process.env.RESEND_API_KEY as string;
export const MAIL_FROM = process.env.MAIL_FROM as string;
export const EMAIL_FROM = process.env.EMAIL_FROM as string;
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL as string;
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD as string;
export const ORDER_EXPIRY_HOURS = parseInt(process.env.ORDER_EXPIRY_HOURS as string);
export const MIN_QTY_PER_ITEM = parseInt(process.env.MIN_QTY_PER_ITEM as string);
export const ALLOWED_EXT_FOR_PAYMENT_PROOF: string[] = JSON.parse(process.env.ALLOWED_EXT_FOR_PAYMENT_PROOF || "[]");
export const ALLOWED_MIME_TYPE_FOR_PAYMENT_PROOF: string[] = JSON.parse(process.env.ALLOWED_MIME_TYPE_FOR_PAYMENT_PROOF || "[]");
export const MAX_SIZE_FOR_PAYMENT_PROOF = parseInt(process.env.MAX_SIZE_FOR_PAYMENT_PROOF as string);
export const SEND_TO = process.env.SEND_TO as string;
export const SERVER_PRODUCTION_URL =
  APP_URL;

  export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME as string;
  export const APP_DESCRIPTION = process.env.NEXT_PUBLIC_APP_DESCRIPTION as string;
  export const FOUNDING_DATE = process.env.NEXT_PUBLIC_FOUNDING_DATE as string;
  export const PRICE_RANGE = process.env.NEXT_PUBLIC_PRICE_RANGE as string;
