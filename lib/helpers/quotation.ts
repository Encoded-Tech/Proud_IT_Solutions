import {
  QuotationDraft,
  QuotationItemComputed,
  QuotationPageSlice,
  QuotationTotals,
} from "@/types/quotation";

export const DEFAULT_QUOTATION_ASSETS = {
  letterpad: "/assets/quotation/letterpad.png",
  signature: "/assets/quotation/signature.png",
  stamp: "",
} as const;

export const DEFAULT_QUOTATION_TERMS =
  "Prices are valid for 7 days from the quotation date. Delivery timelines depend on stock availability. Warranty and support follow the respective product brand policy.";

export const STATIC_QUOTATION_HIGHLIGHTS = [
  "1 Year Part Replacement Warranty in Printer",
  "13% VAT Included",
  "Free Laptop Bag, Mouse and Mousepad",
] as const;

export const STATIC_QUOTATION_PREPARED_BY = {
  heading: "Regards",
  name: "ProudNepal Service & Warranty Team",
  contact: "9867174242",
  email: "proudnepalits@gmail.com",
  website: "proudnepal.com.np",
} as const;

export const ELECTRONIC_SIGNATURE_NOTE =
  "Electronic Signature is Valid Under the Quotation Stamp or Sign";

export function formatCurrency(value: number, currency = "NPR") {
  const normalizedCurrency = currency.trim().toUpperCase();
  const safeValue = Number.isFinite(value) ? value : 0;
  const hasDecimals = Math.abs(safeValue % 1) > 0;
  const fractionDigits = hasDecimals ? 2 : 0;

  if (normalizedCurrency === "RS" || normalizedCurrency === "NRS") {
    return `Rs. ${new Intl.NumberFormat("en-NP", {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(safeValue)}`;
  }

  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: normalizedCurrency || "NPR",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(safeValue);
}

export function computeQuotationTotals(draft: QuotationDraft): QuotationTotals {
  const subtotal = draft.items.reduce((sum, item) => {
    const quantity = Math.max(0, Number(item.quantity) || 0);
    const unitPrice = Math.max(0, Number(item.unitPrice) || 0);
    return sum + quantity * unitPrice;
  }, 0);

  const discountAmount =
    draft.discountMode === "percentage"
      ? subtotal * (Math.max(0, draft.discountValue) / 100)
      : Math.max(0, draft.discountValue);

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = 0;
  const grandTotal = taxableAmount;

  return {
    subtotal,
    discountAmount,
    taxableAmount,
    taxAmount,
    grandTotal,
  };
}

export function computeQuotationItems(draft: QuotationDraft): QuotationItemComputed[] {
  return draft.items.map((item, index) => ({
    ...item,
    serialNumber: index + 1,
    lineTotal: Math.max(0, Number(item.quantity) || 0) * Math.max(0, Number(item.unitPrice) || 0),
  }));
}

export function getExpandedQuotationRowHeightMm(itemCount: number) {
  if (itemCount <= 1) return 30;
  if (itemCount === 2) return 24;
  if (itemCount === 3) return 19;
  if (itemCount === 4) return 15;
  return 0;
}

export function buildQuotationPages(draft: QuotationDraft): QuotationPageSlice[] {
  const computedItems = computeQuotationItems(draft);
  return [
    {
      pageNumber: 1,
      totalPages: 1,
      items: computedItems,
      isFirstPage: true,
      isLastPage: true,
    },
  ];
}
