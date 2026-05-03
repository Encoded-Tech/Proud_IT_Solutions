"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/db";
import { requireAdmin } from "@/lib/auth/requireSession";
import {
  computeQuotationTotals,
  DEFAULT_QUOTATION_ASSETS,
  DEFAULT_QUOTATION_TERMS,
  STATIC_QUOTATION_PREPARED_BY,
} from "@/lib/helpers/quotation";
import { quotationSchema } from "@/lib/validations/quotation";
import Quotation from "@/models/quotationModel";
import { QuotationDraft, QuotationRecord } from "@/types/quotation";

interface ActionResult<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
}

function serializeQuotation(doc: any): QuotationRecord {
  return {
    id: doc._id.toString(),
    quotationNumber: doc.quotationNumber,
    quotationDate: new Date(doc.quotationDate).toISOString().slice(0, 10),
    subject: doc.subject,
    introduction: doc.introduction ?? "",
    party: {
      clientName: doc.party.clientName,
      clientCompanyName: doc.party.clientCompanyName ?? "",
      clientAddress: doc.party.clientAddress ?? "",
      clientContact: doc.party.clientContact ?? "",
    },
    items: doc.items.map((item: any) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    currency: doc.currency,
    discountMode: doc.discountMode,
    discountValue: doc.discountValue,
    taxMode: doc.taxMode,
    taxValue: doc.taxValue,
    subtotal: doc.subtotal,
    discountAmount: doc.discountAmount,
    taxableAmount: doc.taxableAmount,
    taxAmount: doc.taxAmount,
    grandTotal: doc.grandTotal,
    terms: doc.terms ?? "",
    preparedBy: {
      heading: doc.preparedBy?.heading ?? STATIC_QUOTATION_PREPARED_BY.heading,
      name: doc.preparedBy?.name ?? STATIC_QUOTATION_PREPARED_BY.name,
      role: doc.preparedBy?.role ?? "",
      contact: doc.preparedBy?.contact ?? STATIC_QUOTATION_PREPARED_BY.contact,
      email: doc.preparedBy?.email ?? STATIC_QUOTATION_PREPARED_BY.email,
    },
    assets: {
      letterpad: doc.assets.letterpad,
      signature: doc.assets.signature ?? "",
      stamp: doc.assets.stamp ?? "",
    },
    createdAt: new Date(doc.createdAt).toISOString(),
    updatedAt: new Date(doc.updatedAt).toISOString(),
  };
}

async function buildNextQuotationNumber() {
  const year = new Date().getFullYear();
  const latest = (await Quotation.findOne({
    quotationNumber: { $regex: `^QT-${year}-` },
  })
    .sort({ createdAt: -1 })
    .lean()) as { quotationNumber?: string } | null;

  const lastSequence = latest?.quotationNumber
    ? Number(latest.quotationNumber.split("-").pop()) || 0
    : 0;

  return `QT-${year}-${String(lastSequence + 1).padStart(3, "0")}`;
}

export async function getQuotationDashboardData(): Promise<
  ActionResult<{
    quotations: QuotationRecord[];
    nextQuotationNumber: string;
    defaults: {
      currency: string;
      terms: string;
      assets: typeof DEFAULT_QUOTATION_ASSETS;
    };
  }>
> {
  try {
    await requireAdmin();
    await connectDB();

    const [quotationDocs, nextQuotationNumber] = await Promise.all([
      Quotation.find({}).sort({ updatedAt: -1 }).lean(),
      buildNextQuotationNumber(),
    ]);

    return {
      success: true,
      message: "Quotation dashboard loaded.",
      data: {
        quotations: quotationDocs.map(serializeQuotation),
        nextQuotationNumber,
        defaults: {
          currency: "NPR",
          terms: DEFAULT_QUOTATION_TERMS,
          assets: DEFAULT_QUOTATION_ASSETS,
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unable to load quotations.",
    };
  }
}

export async function saveQuotationAction(
  input: QuotationDraft
): Promise<ActionResult<QuotationRecord>> {
  try {
    const admin = await requireAdmin();
    await connectDB();

    const parsed = quotationSchema.parse({
      ...input,
      discountValue: Number(input.discountValue) || 0,
      taxValue: 0,
      taxMode: "amount",
      items: input.items.map((item) => ({
        ...item,
        quantity: Number(item.quantity) || 0,
        unitPrice: Number(item.unitPrice) || 0,
      })),
    });

    const totals = computeQuotationTotals(parsed);

    const payload = {
      quotationNumber: parsed.quotationNumber,
      quotationDate: new Date(parsed.quotationDate),
      subject: parsed.subject,
      introduction: parsed.introduction || null,
      party: {
        clientName: parsed.party.clientName,
        clientCompanyName: parsed.party.clientCompanyName || null,
        clientAddress: parsed.party.clientAddress || null,
        clientContact: parsed.party.clientContact || null,
      },
      items: parsed.items,
      currency: parsed.currency,
      discountMode: parsed.discountMode,
      discountValue: parsed.discountValue,
      taxMode: "amount",
      taxValue: 0,
      subtotal: totals.subtotal,
      discountAmount: totals.discountAmount,
      taxableAmount: totals.taxableAmount,
      taxAmount: totals.taxAmount,
      grandTotal: totals.grandTotal,
      terms: parsed.terms || null,
      preparedBy: {
        heading: parsed.preparedBy.heading || STATIC_QUOTATION_PREPARED_BY.heading,
        name: parsed.preparedBy.name || null,
        role: parsed.preparedBy.role || null,
        contact: parsed.preparedBy.contact || null,
        email: parsed.preparedBy.email || null,
      },
      assets: {
        letterpad: parsed.assets.letterpad,
        signature: parsed.assets.signature || null,
        stamp: parsed.assets.stamp || null,
      },
      createdBy: admin.id,
    };

    const existingWithNumber = await Quotation.findOne({
      quotationNumber: parsed.quotationNumber,
      ...(parsed.id ? { _id: { $ne: parsed.id } } : {}),
    }).lean();

    if (existingWithNumber) {
      return {
        success: false,
        message: "Quotation number already exists. Use a unique quotation number.",
      };
    }

    const doc = parsed.id
      ? await Quotation.findByIdAndUpdate(parsed.id, payload, { new: true, runValidators: true })
      : await Quotation.create(payload);

    if (!doc) {
      return {
        success: false,
        message: "Quotation could not be saved.",
      };
    }

    revalidatePath("/admin/quotations");

    return {
      success: true,
      message: parsed.id ? "Quotation updated successfully." : "Quotation saved successfully.",
      data: serializeQuotation(doc),
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unable to save quotation.",
    };
  }
}

export async function deleteQuotationAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await connectDB();

    await Quotation.findByIdAndDelete(id);
    revalidatePath("/admin/quotations");

    return {
      success: true,
      message: "Quotation deleted successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unable to delete quotation.",
    };
  }
}
