"use server";

import { connectDB } from "@/db";
import { requireAdmin } from "@/lib/auth/requireSession";
import { sendEmail } from "@/lib/helpers/sendEmail";
import { mapContactToDTO } from "@/lib/server/mappers/MapContact";
import Contact from "@/models/contactModel";
import { revalidatePath } from "next/cache";
import { z } from "zod";

/* ----------------------------- */
/* Get All Contacts              */
/* ----------------------------- */
export async function getAllContacts() {
  await connectDB();
  await requireAdmin();

  try {
    const contacts = await Contact.find({})
      .sort({ createdAt: -1 });

    const mapped = contacts.map(mapContactToDTO);

    return {
      success: true,
      message: "Contacts fetched successfully",
      data: mapped,
    };
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return {
      success: false,
      message: "Error fetching contacts",
      data: [],
    };
  }
}

/* ----------------------------- */
/* Mark Contact as Read          */
/* ----------------------------- */
export async function markContactAsRead(contactId: string) {
  await connectDB();
  await requireAdmin();

  try {
    const contact = await Contact.findById(contactId);

    if (!contact) {
      return {
        success: false,
        message: "Contact not found",
      };
    }

    // Only update if not already read
    if (!contact.read) {
      await Contact.findByIdAndUpdate(contactId, {
        $set: {
          read: true,
          readAt: new Date(),
        },
      });

      revalidatePath("/admin/inbox");
    }

    return {
      success: true,
      message: "Contact marked as read",
    };
  } catch (error) {
    console.error("Error marking contact as read:", error);
    return {
      success: false,
      message: "Error marking contact as read",
    };
  }
}

/* ----------------------------- */
/* Validation Schema             */
/* ----------------------------- */
const replySchema = z.object({
  contactId: z.string().min(1),
  replyMessage: z
    .string()
    .min(5, "Reply must be at least 5 characters")
    .max(2000, "Reply too long"),
  subject: z
    .string()
    .min(3)
    .max(150)
    .optional(),
});

/* ----------------------------- */
/* Reply to Contact Action       */
/* ----------------------------- */
export async function replyToContactAction(formData: FormData) {
  await connectDB();
  await requireAdmin();

  try {
    /* ----------------------------- */
    /* Parse FormData                */
    /* ----------------------------- */
    const raw = {
      contactId: formData.get("contactId") as string,
      replyMessage: formData.get("replyMessage") as string,
      subject: formData.get("subject") as string,
    };

    const validated = replySchema.parse(raw);

    /* ----------------------------- */
    /* Find Contact                  */
    /* ----------------------------- */
    const contact = await Contact.findById(validated.contactId);

    if (!contact) {
      return {
        success: false,
        message: "Contact not found",
      };
    }

    // Prevent duplicate replies
    if (contact.replied) {
      return {
        success: false,
        message: "Already replied to this contact",
      };
    }

    /* ----------------------------- */
    /* Email Template                */
    /* ----------------------------- */
    const emailHTML = `
      <div style="font-family: Arial, sans-serif; line-height:1.6;">
        <h2>Reply from Proud IT Solutions</h2>

        <p>Dear ${contact.name},</p>

        <p>Thank you for contacting us. Here is our response:</p>

        <div style="
          background:#f5f5f5;
          padding:15px;
          border-radius:8px;
          margin:20px 0;
          white-space:pre-line;
        ">
          ${validated.replyMessage}
        </div>

        <hr />

        <p><strong>Your Original Message:</strong></p>

        <div style="
          background:#fafafa;
          padding:12px;
          border-left:4px solid #ddd;
          white-space:pre-line;
        ">
          ${contact.description}
        </div>

        <br />

        <p>
          Best regards,<br/>
          Proud IT Solutions Team
        </p>
      </div>
    `;

    /* ----------------------------- */
    /* Send Email                   */
    /* ----------------------------- */
    await sendEmail({
      to: contact.email,
      subject:
        validated.subject ||
        `Re: ${contact.subject || "Your inquiry"}`,
      html: emailHTML,
    });

    /* ----------------------------- */
    /* Mark as Replied AND Read     */
    /* ----------------------------- */
    const now = new Date();
    await Contact.findByIdAndUpdate(contact._id, {
      $set: {
        replied: true,
        repliedAt: now,
        read: true,
        readAt: contact.readAt || now, // Preserve existing readAt if already read
      },
    }, { new: true });

    /* ----------------------------- */
    /* Revalidate Page Cache        */
    /* ----------------------------- */
    revalidatePath("/admin/inbox");

    return {
      success: true,
      message: "Reply sent successfully",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(errorMessage);

    return {
      success: false,
      message: errorMessage || "Failed to send reply email",
    };
  }
}