import crypto from "crypto";
import { buildAppUrl, JWT_SECRET } from "@/config/env";

function base64UrlEncode(value: string) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(payload: string) {
  return crypto.createHmac("sha256", JWT_SECRET).update(payload).digest("base64url");
}

export function createNewsletterUnsubscribeToken(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const payload = base64UrlEncode(normalizedEmail);
  const signature = signPayload(payload);
  return `${payload}.${signature}`;
}

export function verifyNewsletterUnsubscribeToken(token: string) {
  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    return { valid: false, email: null as string | null };
  }

  const expectedSignature = signPayload(payload);
  if (signature.length !== expectedSignature.length) {
    return { valid: false, email: null as string | null };
  }
  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );

  if (!isValid) {
    return { valid: false, email: null as string | null };
  }

  try {
    const email = base64UrlDecode(payload).trim().toLowerCase();
    return { valid: Boolean(email), email: email || null };
  } catch {
    return { valid: false, email: null };
  }
}

export function buildNewsletterUnsubscribeUrl(email: string) {
  const token = createNewsletterUnsubscribeToken(email);
  return buildAppUrl(`/newsletter/unsubscribe?token=${encodeURIComponent(token)}`);
}
