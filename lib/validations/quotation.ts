import { z } from "zod";

export const quotationItemSchema = z.object({
  id: z.string().trim().min(1),
  description: z.string().trim().min(1, "Description is required.").max(600),
  quantity: z.number().min(1, "Quantity must be at least 1.").max(99999),
  unitPrice: z.number().min(0, "Unit price cannot be negative.").max(999999999),
});

export const quotationSchema = z.object({
  id: z.string().trim().optional(),
  quotationNumber: z.string().trim().min(1, "Quotation number is required.").max(50),
  quotationDate: z.string().trim().min(1, "Quotation date is required."),
  subject: z.string().trim().min(1, "Subject is required.").max(180),
  introduction: z.string().trim().max(2000).optional().or(z.literal("")),
  party: z.object({
    clientName: z.string().trim().min(1, "Client name is required.").max(120),
    clientCompanyName: z.string().trim().max(160).optional().or(z.literal("")),
    clientAddress: z.string().trim().max(400).optional().or(z.literal("")),
    clientContact: z.string().trim().max(160).optional().or(z.literal("")),
  }),
  items: z
    .array(quotationItemSchema)
    .min(1, "Add at least one quotation item.")
    .max(10, "Maximum 10 items are allowed in one quotation. Create another quotation for more items."),
  currency: z.string().trim().min(1).max(10).default("NPR"),
  discountMode: z.enum(["amount", "percentage"]).default("amount"),
  discountValue: z.number().min(0).max(100000000).default(0),
  taxMode: z.enum(["amount", "percentage"]).default("percentage"),
  taxValue: z.number().min(0).max(100000000).default(0),
  terms: z.string().trim().max(3000).optional().or(z.literal("")),
  preparedBy: z.object({
    heading: z.string().trim().max(80).optional().or(z.literal("")),
    name: z.string().trim().max(120).optional().or(z.literal("")),
    role: z.string().trim().max(120).optional().or(z.literal("")),
    contact: z.string().trim().max(160).optional().or(z.literal("")),
    email: z.string().trim().email("Enter a valid email.").max(160).optional().or(z.literal("")),
  }),
  assets: z.object({
    letterpad: z.string().trim().min(1, "Letter pad path is required.").max(500),
    signature: z.string().trim().max(500).default(""),
    stamp: z.string().trim().max(500).default(""),
  }),
});

export type QuotationSchemaInput = z.infer<typeof quotationSchema>;
