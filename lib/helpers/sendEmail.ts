
import { EMAIL_FROM } from "@/config/env";
import { createMailer } from "@/config/nodemailer";

// Reusable email sending function
export async function sendEmail(opts: {
  from?: string;
    to: string;
    subject: string;
    replyTo?: string;
    html: string;
    text?: string;
  }) {
    const transporter = await createMailer();
  
    await transporter.sendMail({
      from: `"Proud IT Solutions" <${EMAIL_FROM}>`,
      to: opts.to,
      subject: opts.subject,
      text: opts.text || "",
      html: opts.html,
    });
  
    console.log("📧 Email sent to:", opts.to);
  }
  