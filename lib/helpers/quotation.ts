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
  [
    "Prices are valid for 7 days from the quotation date.",
    "Delivery timelines depend on stock availability.",
    "Warranty and support follow the respective product brand policy.",
  ].join("\n");

export const STATIC_QUOTATION_HIGHLIGHTS = [
  "Prices are valid for 7 days from the quotation date.",
  "Delivery timelines depend on stock availability.",
  "Warranty and support follow the respective product brand policy.",
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

export function normalizeQuotationNotes(value?: string | null) {
  const fallback = DEFAULT_QUOTATION_TERMS;
  const source = value && value.trim() ? value.trim() : fallback;
  const oldOneLineDefault =
    "Prices are valid for 7 days from the quotation date. Delivery timelines depend on stock availability. Warranty and support follow the respective product brand policy.";

  if (source === oldOneLineDefault) {
    return DEFAULT_QUOTATION_TERMS;
  }

  return source;
}

export function quotationNotesToList(value?: string | null) {
  return normalizeQuotationNotes(value)
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export const FIRST_PAGE_NON_FINAL_ITEM_LIMIT = 18;
export const CONTINUATION_PAGE_NON_FINAL_ITEM_LIMIT = 24;
export const FINAL_PAGE_ITEM_LIMIT = 8;
export const FINAL_PAGE_MIN_ITEM_COUNT = 1;

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
  const pages: Array<{ items: QuotationItemComputed[]; isFinalPage: boolean }> = [];
  let cursor = 0;
  let pageIndex = 0;

  if (computedItems.length === 0) {
    pages.push({
      items: computedItems,
      isFinalPage: true,
    });
  }

  while (cursor < computedItems.length) {
    const remaining = computedItems.length - cursor;

    if (remaining <= FINAL_PAGE_ITEM_LIMIT) {
      pages.push({
        items: computedItems.slice(cursor),
        isFinalPage: true,
      });
      break;
    }

    const pageLimit =
      pageIndex === 0
        ? FIRST_PAGE_NON_FINAL_ITEM_LIMIT
        : CONTINUATION_PAGE_NON_FINAL_ITEM_LIMIT;
    const maxTakeWithoutStealingFinal = remaining - FINAL_PAGE_MIN_ITEM_COUNT;
    const takeCount = Math.min(pageLimit, maxTakeWithoutStealingFinal);

    pages.push({
      items: computedItems.slice(cursor, cursor + takeCount),
      isFinalPage: false,
    });
    cursor += takeCount;
    pageIndex += 1;
  }

  const totalPages = pages.length;

  return pages.map((page, index) => {
    return {
      pageNumber: index + 1,
      totalPages,
      items: page.items,
      isFirstPage: index === 0,
      isLastPage: page.isFinalPage,
      isFinalPage: page.isFinalPage,
      isContinuationPage: index > 0 && !page.isFinalPage,
    };
  });
}
