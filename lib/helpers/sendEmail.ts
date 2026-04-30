import { EMAIL_FROM, RESEND_EMAIL_USER } from "@/config/env";
import { createMailer } from "@/config/nodemailer";

const EMAIL_ADDRESS_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmailAddress(value?: string | null): value is string {
  return !!value && EMAIL_ADDRESS_PATTERN.test(value.trim());
}

function getEnvelopeFrom(from?: string) {
  if (isValidEmailAddress(from)) {
    return from.trim();
  }

  if (isValidEmailAddress(EMAIL_FROM)) {
    return EMAIL_FROM.trim();
  }

  if (isValidEmailAddress(RESEND_EMAIL_USER)) {
    return RESEND_EMAIL_USER.trim();
  }

  throw new Error("No valid sender email is configured.");
}

export async function sendEmail(opts: {
  from?: string;
  to: string;
  subject: string;
  replyTo?: string;
  html: string;
  text?: string;
  headers?: Record<string, string>;
  envelopeFrom?: string;
}) {
  try {
    const transporter = await createMailer();
    const envelopeFrom = getEnvelopeFrom(opts.envelopeFrom);
    const formattedFrom = opts.from || `"Proud IT Solutions" <${envelopeFrom}>`;

    await transporter.sendMail({
      from: formattedFrom,
      sender: envelopeFrom,
      to: opts.to,
      subject: opts.subject,
      text: opts.text || "",
      html: opts.html,
      replyTo: opts.replyTo,
      headers: opts.headers,
      envelope: {
        from: envelopeFrom,
        to: opts.to,
      },
    });

    console.log("Email sent to:", opts.to);
  } catch (error) {
    console.error("sendEmail failed:", error);
    throw new Error(
      error instanceof Error
        ? `Email delivery failed: ${error.message}`
        : "Email delivery failed."
    );
  }
}
