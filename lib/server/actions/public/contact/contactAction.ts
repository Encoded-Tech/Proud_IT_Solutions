"use server";

import { z } from "zod";
import Contact from "@/models/contactModel";
import { sendEmail } from "@/lib/helpers/sendEmail";
import { contactSchema, ContactFormData } from "@/lib/validations/Zod";
import { SEND_TO } from "@/config/env";

/* ----------------------- SERVER ACTION ----------------------- */

export async function submitContactForm(
  formData: unknown
): Promise<{
  success: boolean;
  message: string;
  data?: ContactFormData;
  errors?: z.ZodFormattedError<ContactFormData>;
}> {
  try {
    // 1️⃣ Validate incoming data
    const parseResult = contactSchema.safeParse(formData);
    if (!parseResult.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: parseResult.error.format(),
      };
    }
    const data = parseResult.data;

    // 2️⃣ Save to database
    const newContact = await Contact.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      description: data.description,
      organization: data.organization,
      preferredContact: data.preferredContact,
    });
    await newContact.save();

    // 3️⃣ Send detailed email to admin/support
    await sendEmail({
      from: `"${data.name}" <${data.email}>`,
      to: SEND_TO, // Admin/support email
      replyTo: data.email,
      subject: `New Contact Form Submission from ${data.name}`,
      html: `
        <h2>📬 New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone}</p>
        <p><strong>Organization:</strong> ${data.organization || "N/A"}</p>
        <p><strong>Preferred Contact Method:</strong> ${data.preferredContact}</p>
        <p><strong>Message:</strong></p>
        <blockquote style="border-left: 3px solid #ccc; padding-left: 10px; color: #555;">
          ${data.description}
        </blockquote>
        <hr />
        <p>Submission received on: ${new Date().toLocaleString()}</p>
      `,
    });

    // 4️⃣ Send friendly confirmation email to user
    await sendEmail({
      to: data.email,
      subject: "We Received Your Message – Proud IT Solutions",
      html: `
        <h2>Hi ${data.name},</h2>
        <p>Thank you for reaching out to Proud IT Solutions. We have received your message and will respond as soon as possible.</p>
        <p><strong>Your Submitted Details:</strong></p>
        <ul>
          <li><strong>Name:</strong> ${data.name}</li>
          <li><strong>Email:</strong> ${data.email}</li>
          <li><strong>Phone:</strong> ${data.phone}</li>
          <li><strong>Organization:</strong> ${data.organization || "N/A"}</li>
          <li><strong>Preferred Contact:</strong> ${data.preferredContact}</li>
        </ul>
        <p><strong>Your Message:</strong></p>
        <blockquote style="border-left: 3px solid #ccc; padding-left: 10px; color: #555;">
          ${data.description}
        </blockquote>
        <p>We appreciate your interest and will get back to you shortly.</p>
        <p>Best regards,<br/>Proud IT Solutions Team</p>
      `,
    });


    // 5️⃣ Return success
    return {
      success: true,
      message: "Your message has been sent successfully to our support team. please check your email for confirmation.",
      data,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unexpected server error";
    console.error("SUBMIT CONTACT FORM ERROR:", errorMessage);
    return {
      success: false,
      message: "Server error occurred. Please try again later.",
    };
  }
}
