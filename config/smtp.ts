import SMTPTransport from "nodemailer/lib/smtp-transport";
import { RESEND_EMAIL_HOST, RESEND_EMAIL_PASS, RESEND_EMAIL_USER } from "./env";


export function smtpConfig(port: number, secure: boolean): SMTPTransport.Options {
  return {
    host: RESEND_EMAIL_HOST,
    port,
    secure,
    auth: {
      user: RESEND_EMAIL_USER,
      pass: RESEND_EMAIL_PASS,
    },
  };
}