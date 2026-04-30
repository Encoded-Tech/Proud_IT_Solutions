"use server";

import { z } from "zod";
import Contact from "@/models/contactModel";
import { SEND_TO } from "@/config/env";
import { sanitize } from "@/lib/helpers/performValidation";
import { sendEmail } from "@/lib/helpers/sendEmail";
import { applyRateLimit, buildRateLimitKey } from "@/lib/security/rate-limit";
import { contactSchema, ContactFormData } from "@/lib/validations/Zod";

export async function submitContactForm(
  formData: unknown
): Promise<{
  success: boolean;
  message: string;
  data?: ContactFormData;
  errors?: z.ZodFormattedError<ContactFormData>;
}> {
  try {
    const parseResult = contactSchema.safeParse(formData);

    if (!parseResult.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: parseResult.error.format(),
      };
    }

    const data = parseResult.data;
    const rateLimit = applyRateLimit(
      buildRateLimitKey(["contact-form", data.email, data.phone]),
      {
        limit: 3,
        windowMs: 30 * 60 * 1000,
      }
    );

    if (!rateLimit.allowed) {
      return {
        success: false,
        message: "Too many contact requests. Please try again later.",
      };
    }

    const safeName = sanitize(data.name);
    const safeEmail = sanitize(data.email);
    const safePhone = sanitize(data.phone);
    const safeOrganization = data.organization ? sanitize(data.organization) : "";
    const safePreferredContact = sanitize(data.preferredContact);
    const safeDescription = sanitize(data.description);

    const newContact = await Contact.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      description: data.description,
      organization: data.organization,
      preferredContact: data.preferredContact,
    });

    await newContact.save();

    await sendEmail({
      from: `"${safeName}" <${safeEmail}>`,
      to: SEND_TO,
      replyTo: safeEmail,
      subject: `New Contact Form Submission from ${safeName}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Phone:</strong> ${safePhone}</p>
        <p><strong>Organization:</strong> ${safeOrganization || "N/A"}</p>
        <p><strong>Preferred Contact Method:</strong> ${safePreferredContact}</p>
        <p><strong>Message:</strong></p>
        <blockquote style="border-left: 3px solid #ccc; padding-left: 10px; color: #555;">
          ${safeDescription}
        </blockquote>
        <hr />
        <p>Submission received on: ${new Date().toLocaleString()}</p>
      `,
    });

    await sendEmail({
      to: safeEmail,
      subject: "We Received Your Message - Proud IT Solutions",
      html: `
        <h2>Hi ${safeName},</h2>
        <p>Thank you for reaching out to Proud IT Solutions. We have received your message and will respond as soon as possible.</p>
        <p><strong>Your Submitted Details:</strong></p>
        <ul>
          <li><strong>Name:</strong> ${safeName}</li>
          <li><strong>Email:</strong> ${safeEmail}</li>
          <li><strong>Phone:</strong> ${safePhone}</li>
          <li><strong>Organization:</strong> ${safeOrganization || "N/A"}</li>
          <li><strong>Preferred Contact:</strong> ${safePreferredContact}</li>
        </ul>
        <p><strong>Your Message:</strong></p>
        <blockquote style="border-left: 3px solid #ccc; padding-left: 10px; color: #555;">
          ${safeDescription}
        </blockquote>
        <p>We appreciate your interest and will get back to you shortly.</p>
        <p>Best regards,<br/>Proud IT Solutions Team</p>
      `,
    });

    return {
      success: true,
      message:
        "Your message has been sent successfully to our support team. please check your email for confirmation.",
      data,
    };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Unexpected server error";
    console.error("SUBMIT CONTACT FORM ERROR:", errorMessage);

    return {
      success: false,
      message: "Server error occurred. Please try again later.",
    };
  }
}
