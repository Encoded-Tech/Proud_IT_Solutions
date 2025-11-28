import nodemailer, { Transporter } from "nodemailer";
import { RESEND_EMAIL_PORT_STARTTLS, RESEND_EMAIL_PORT_TLS } from "./env";
import { smtpConfig } from "./smtp";

let cachedTransporter: Transporter | null = null;

// Create SMTP transporter with fallback logic
export async function createMailer(): Promise<Transporter> {
  if (cachedTransporter) return cachedTransporter;

  let transporter: Transporter;

  // Try port 465 (SSL)
  try {
    transporter = nodemailer.createTransport(
      smtpConfig(Number(RESEND_EMAIL_PORT_TLS), true)
    );

    await transporter.verify();
    console.log("✔ SMTP connected using 465 (SSL)");
    cachedTransporter = transporter;
    return transporter;

  } catch (error) {
    console.warn("⚠ 465 SSL failed, trying 587 STARTTLS:", error);
  }

  // Try port 587 (STARTTLS)
  try {
    transporter = nodemailer.createTransport(
      smtpConfig(Number(RESEND_EMAIL_PORT_STARTTLS), false)
    );

    await transporter.verify();
    console.log("✔ SMTP connected using 587 (STARTTLS)");
    cachedTransporter = transporter;
    return transporter;

  } catch (error) {
    console.error("❌ Both SMTP ports failed:", error);
    throw new Error("Unable to connect to SMTP server");
  }
}
        