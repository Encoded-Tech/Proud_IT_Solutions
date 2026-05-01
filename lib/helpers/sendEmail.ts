import "server-only";

import { EMAIL_FROM, MAIL_FROM, RESEND_API_KEY } from "@/config/env";

const EMAIL_ADDRESS_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_FROM = "Proud Nepal <no-reply@proudnepal.com.np>";
const RESEND_EMAIL_ENDPOINT = "https://api.resend.com/emails";
const LOCALHOST_URL_PATTERN = /https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(?:[/?#][^\s"'<>)]*)?/i;

function isValidEmailAddress(value?: string | null): value is string {
  return !!value && EMAIL_ADDRESS_PATTERN.test(value.trim());
}

function getSenderEmail(value?: string | null) {
  const trimmedValue = value?.trim();
  if (!trimmedValue) return null;

  if (EMAIL_ADDRESS_PATTERN.test(trimmedValue)) {
    return trimmedValue;
  }

  const bracketedEmail = trimmedValue.match(/<([^>]+)>/)?.[1];
  if (isValidEmailAddress(bracketedEmail)) {
    return bracketedEmail.trim();
  }

  return null;
}

function getVerifiedFrom() {
  const configuredFrom = MAIL_FROM?.trim() || EMAIL_FROM?.trim() || DEFAULT_FROM;
  const angleOnlyEmail = configuredFrom.match(/^<([^>]+)>$/)?.[1]?.trim();
  const from = angleOnlyEmail || configuredFrom;

  if (from && getSenderEmail(from)) {
    return from;
  }

  return DEFAULT_FROM;
}

function htmlToText(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getProviderMessageId(responseBody: unknown) {
  if (
    responseBody &&
    typeof responseBody === "object" &&
    "id" in responseBody &&
    typeof (responseBody as { id?: unknown }).id === "string"
  ) {
    return (responseBody as { id: string }).id;
  }

  return null;
}

function logEmailDebug(input: {
  from: string;
  replyTo?: string;
  to: string;
  subject: string;
  providerMessageId: string | null;
}) {
  console.log("email.delivery.debug", {
    from: input.from,
    replyTo: input.replyTo || null,
    to: input.to,
    subject: input.subject,
    providerMessageId: input.providerMessageId,
  });
}

function assertNoProductionLocalhostLinks(opts: {
  html: string;
  text?: string;
  headers?: Record<string, string>;
}) {
  if (process.env.NODE_ENV !== "production") return;

  const values = [
    opts.html,
    opts.text || "",
    ...Object.values(opts.headers || {}),
  ];

  if (values.some((value) => LOCALHOST_URL_PATTERN.test(value))) {
    throw new Error("Refusing to send production email with a localhost URL.");
  }
}

export async function sendEmail(opts: {
  from?: string;
  to: string;
  subject: string;
  replyTo?: string;
  reply_to?: string;
  html: string;
  text?: string;
  headers?: Record<string, string>;
  envelopeFrom?: string;
}) {
  try {
    assertNoProductionLocalhostLinks(opts);

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured.");
    }

    const replyTo = opts.reply_to || opts.replyTo;
    const from = getVerifiedFrom();
    const text = opts.text?.trim() || htmlToText(opts.html);
    const payload: Record<string, unknown> = {
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text,
    };

    if (replyTo) payload.reply_to = replyTo;
    if (opts.headers) payload.headers = opts.headers;

    const response = await fetch(RESEND_EMAIL_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "User-Agent": "proudnepal-web",
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(
        `Resend API request failed with status ${response.status}: ${responseText}`
      );
    }

    const responseBody = responseText ? JSON.parse(responseText) : null;
    logEmailDebug({
      from,
      replyTo,
      to: opts.to,
      subject: opts.subject,
      providerMessageId: getProviderMessageId(responseBody),
    });
    return responseBody;
  } catch (error) {
    console.error("sendEmail failed:", error);
    throw new Error(
      error instanceof Error
        ? `Email delivery failed: ${error.message}`
        : "Email delivery failed."
    );
  }
}
