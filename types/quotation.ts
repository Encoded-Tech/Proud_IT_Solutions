export type QuotationValueMode = "amount" | "percentage";

export interface QuotationItemInput {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface QuotationPartyDetails {
  clientName: string;
  clientCompanyName?: string;
  clientAddress?: string;
  clientContact?: string;
}

export interface QuotationAssetPaths {
  letterpad: string;
  signature: string;
  stamp: string;
}

export interface QuotationPreparedBy {
  heading?: string;
  name?: string;
  role?: string;
  contact?: string;
  email?: string;
}

export interface QuotationDraft {
  id?: string;
  quotationNumber: string;
  quotationDate: string;
  subject: string;
  introduction?: string;
  party: QuotationPartyDetails;
  items: QuotationItemInput[];
  currency: string;
  discountMode: QuotationValueMode;
  discountValue: number;
  taxMode: QuotationValueMode;
  taxValue: number;
  terms?: string;
  preparedBy: QuotationPreparedBy;
  assets: QuotationAssetPaths;
}

export interface QuotationItemComputed extends QuotationItemInput {
  serialNumber: number;
  lineTotal: number;
}

export interface QuotationTotals {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  grandTotal: number;
}

export interface QuotationRecord extends QuotationDraft, QuotationTotals {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuotationPageSlice {
  pageNumber: number;
  totalPages: number;
  items: QuotationItemComputed[];
  isFirstPage: boolean;
  isLastPage: boolean;
  isFinalPage: boolean;
  isContinuationPage: boolean;
}
