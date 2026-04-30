"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Download, Eye, FilePlus2, Loader2, Printer, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import QuotationItemRow from "@/components/admin/quotation-item-row";
import QuotationPreview from "@/components/admin/quotation-preview";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  computeQuotationTotals,
  DEFAULT_QUOTATION_ASSETS,
  DEFAULT_QUOTATION_TERMS,
  formatCurrency,
  STATIC_QUOTATION_PREPARED_BY,
} from "@/lib/helpers/quotation";
import {
  deleteQuotationAction,
  saveQuotationAction,
} from "@/lib/server/actions/admin/quotation/quotationActions";
import { quotationSchema } from "@/lib/validations/quotation";
import { QuotationDraft, QuotationItemInput, QuotationRecord } from "@/types/quotation";

interface QuotationMakerProps {
  initialQuotations: QuotationRecord[];
  nextQuotationNumber: string;
  defaults: {
    currency: string;
    terms: string;
    assets: {
      letterpad: string;
      signature: string;
      stamp: string;
    };
  };
}

function createItem(): QuotationItemInput {
  return {
    id: crypto.randomUUID(),
    description: "",
    quantity: 1,
    unitPrice: 0,
  };
}

function createBlankDraft(
  quotationNumber: string,
  defaults: QuotationMakerProps["defaults"]
): QuotationDraft {
  return {
    quotationNumber,
    quotationDate: new Date().toISOString().slice(0, 10),
    subject: "Quotation",
    introduction: "",
    party: {
      clientName: "",
      clientCompanyName: "",
      clientAddress: "",
      clientContact: "",
    },
    items: [createItem()],
    currency: defaults.currency || "NPR",
    discountMode: "amount",
    discountValue: 0,
    taxMode: "amount",
    taxValue: 0,
    terms: defaults.terms || DEFAULT_QUOTATION_TERMS,
    preparedBy: {
      name: STATIC_QUOTATION_PREPARED_BY.name,
      role: "",
      contact: STATIC_QUOTATION_PREPARED_BY.contact,
    },
    assets: {
      letterpad: defaults.assets.letterpad || DEFAULT_QUOTATION_ASSETS.letterpad,
      signature: defaults.assets.signature || DEFAULT_QUOTATION_ASSETS.signature,
      stamp: defaults.assets.stamp || DEFAULT_QUOTATION_ASSETS.stamp,
    },
  };
}

function getNextQuotationNumberFromList(quotations: QuotationRecord[]) {
  const year = new Date().getFullYear();
  const sequences = quotations
    .map((item) => item.quotationNumber)
    .filter((number) => number.startsWith(`QT-${year}-`))
    .map((number) => Number(number.split("-").pop()) || 0);

  const nextSequence = (sequences.length ? Math.max(...sequences) : 0) + 1;
  return `QT-${year}-${String(nextSequence).padStart(3, "0")}`;
}

export default function QuotationMaker({
  initialQuotations,
  nextQuotationNumber,
  defaults,
}: QuotationMakerProps) {
  const [quotations, setQuotations] = useState(initialQuotations);
  const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(
    initialQuotations[0]?.id ?? null
  );
  const [draft, setDraft] = useState<QuotationDraft>(() =>
    initialQuotations[0] ?? createBlankDraft(nextQuotationNumber, defaults)
  );
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<QuotationRecord | null>(null);
  const [isPending, startTransition] = useTransition();
  const previewRef = useRef<HTMLElement | null>(null);
  const quotationPageRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!selectedQuotationId) return;
    const selected = quotations.find((item) => item.id === selectedQuotationId);
    if (!selected) return;

    setDraft(selected);
    setFormErrors({});
  }, [quotations, selectedQuotationId]);

  const totals = useMemo(() => computeQuotationTotals(draft), [draft]);

  const createNewDraft = () => {
    const generatedNumber = getNextQuotationNumberFromList(quotations);
    setSelectedQuotationId(null);
    setDraft(createBlankDraft(generatedNumber, defaults));
    setFormErrors({});
  };

  const setField = <K extends keyof QuotationDraft>(key: K, value: QuotationDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const setPartyField = (field: keyof QuotationDraft["party"], value: string) => {
    setDraft((current) => ({
      ...current,
      party: {
        ...current.party,
        [field]: value,
      },
    }));
  };

  const setAssetField = (field: keyof QuotationDraft["assets"], value: string) => {
    setDraft((current) => ({
      ...current,
      assets: {
        ...current.assets,
        [field]: value,
      },
    }));
  };

  const handleItemChange = (
    index: number,
    field: keyof Pick<QuotationItemInput, "description" | "quantity" | "unitPrice">,
    value: string | number
  ) => {
    setDraft((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        if (field === "description") {
          return { ...item, description: String(value) };
        }

        const parsedNumber = Math.max(0, Number(value) || 0);
        return {
          ...item,
          [field]:
            field === "quantity" ? Math.max(1, Math.floor(parsedNumber || 1)) : parsedNumber,
        };
      }),
    }));
  };

  const addItem = () => {
    if (draft.items.length >= 10) {
      toast.error("Maximum 10 items are allowed in one quotation. Create another quotation for more items.");
      return;
    }

    setDraft((current) => ({
      ...current,
      items: [...current.items, createItem()],
    }));
  };

  const removeItem = (index: number) => {
    setDraft((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleSave = () => {
    const parsed = quotationSchema.safeParse({
      ...draft,
      discountValue: Number(draft.discountValue) || 0,
      taxValue: 0,
      taxMode: "amount",
      items: draft.items.map((item) => ({
        ...item,
        quantity: Number(item.quantity) || 0,
        unitPrice: Number(item.unitPrice) || 0,
      })),
    });

    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      const flattened = parsed.error.flatten();

      Object.entries(flattened.fieldErrors).forEach(([field, messages]) => {
        if (messages?.[0]) nextErrors[field] = messages[0];
      });

      setFormErrors(nextErrors);
      toast.error("Please fix the quotation form errors before saving.");
      return;
    }

    setFormErrors({});
    startTransition(async () => {
      const response = await saveQuotationAction(draft);

      if (!response.success || !response.data) {
        toast.error(response.message);
        return;
      }

      setQuotations((current) => {
        const exists = current.some((item) => item.id === response.data!.id);
        const updated = exists
          ? current.map((item) => (item.id === response.data!.id ? response.data! : item))
          : [response.data!, ...current];

        return updated.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      });
      setSelectedQuotationId(response.data.id);
      setDraft(response.data);
      toast.success(response.message);
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;

    startTransition(async () => {
      const response = await deleteQuotationAction(deleteTarget.id);
      if (!response.success) {
        toast.error(response.message);
        return;
      }

      const remaining = quotations.filter((item) => item.id !== deleteTarget.id);
      setQuotations(remaining);
      setDeleteTarget(null);

      if (selectedQuotationId === deleteTarget.id) {
        if (remaining[0]) {
          setSelectedQuotationId(remaining[0].id);
          setDraft(remaining[0]);
        } else {
          setSelectedQuotationId(null);
          setDraft(createBlankDraft(getNextQuotationNumberFromList([]), defaults));
        }
      }

      toast.success(response.message);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!quotationPageRef.current) {
      toast.error("Quotation preview is not ready for export.");
      return;
    }

    try {
      const { downloadQuotationPdf } = await import("@/lib/helpers/quotation-pdf");
      await downloadQuotationPdf(
        quotationPageRef.current,
        draft,
        `${draft.quotationNumber || "quotation"}.pdf`
      );
      toast.success("Quotation downloaded.");
    } catch (error) {
      console.error("Failed to download quotation PDF:", error);
      toast.error("Failed to download quotation PDF.");
    }
  };

  const scrollToPreview = () => {
    previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="quotation-admin-shell space-y-6">
      <style jsx global>{`
        @page {
          size: A4;
          margin: 0;
        }

        @media print {
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          body * {
            visibility: hidden;
          }

          .quotation-print-stage,
          .quotation-print-stage * {
            visibility: visible;
          }

          .quotation-print-stage {
            position: absolute;
            inset: 0;
            width: 100%;
            margin: 0 !important;
            padding: 0 !important;
          }

          .admin-no-print,
          .admin-no-print * {
            display: none !important;
            visibility: hidden !important;
          }

          .quotation-page {
            box-shadow: none !important;
            margin: 0 auto !important;
            max-height: 297mm !important;
          }
        }
      `}</style>

      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-red-500" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-red-500">
            Quotation Admin
          </span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          Professional Quotation Maker
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-500">
          Create multi-page A4 quotations using the exact Proud Nepal letterpad background,
          then print or save the same preview as PDF.
        </p>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[0.95fr_1.05fr]">
        <div className="admin-no-print space-y-6">
          <section className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-black tracking-tight text-slate-900">
                  Saved Quotations
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Load, update, or remove existing quotations from the admin system.
                </p>
              </div>
              <Button
                type="button"
                onClick={createNewDraft}
                className="rounded-xl bg-red-600 hover:bg-red-700"
              >
                <FilePlus2 className="h-4 w-4" />
                New Quotation
              </Button>
            </div>

            <div className="mt-4 max-h-[320px] space-y-3 overflow-y-auto pr-1">
              {quotations.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-400">
                  No quotations have been saved yet.
                </div>
              ) : (
                quotations.map((quotation) => (
                  <div
                    key={quotation.id}
                    className={`rounded-2xl border p-4 transition ${
                      selectedQuotationId === quotation.id
                        ? "border-red-200 bg-red-50/70"
                        : "border-slate-200 bg-slate-50/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedQuotationId(quotation.id)}
                        className="min-w-0 text-left"
                      >
                        <p className="font-semibold text-slate-900">{quotation.quotationNumber}</p>
                        <p className="mt-1 text-sm text-slate-600">{quotation.subject}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          {quotation.party.clientName} • {quotation.quotationDate}
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(quotation)}
                        className="rounded-lg border border-slate-200 p-2 text-red-600 transition hover:bg-red-50"
                        aria-label={`Delete ${quotation.quotationNumber}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-black tracking-tight text-slate-900">
                  Quotation Details
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Fill the client, pricing, and asset fields. The A4 preview updates instantly.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
                Grand Total:{" "}
                <span className="font-black text-slate-900">
                  {formatCurrency(totals.grandTotal, draft.currency)}
                </span>
              </div>
            </div>

            <div className="mt-5 space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Quotation Number
                  </label>
                  <Input
                    value={draft.quotationNumber}
                    onChange={(event) => setField("quotationNumber", event.target.value)}
                    className="border-slate-200 bg-white"
                  />
                  {formErrors.quotationNumber ? (
                    <p className="mt-1 text-xs text-red-600">{formErrors.quotationNumber}</p>
                  ) : null}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Quotation Date
                  </label>
                  <Input
                    type="date"
                    value={draft.quotationDate}
                    onChange={(event) => setField("quotationDate", event.target.value)}
                    className="border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Client Name
                  </label>
                  <Input
                    value={draft.party.clientName}
                    onChange={(event) => setPartyField("clientName", event.target.value)}
                    className="border-slate-200 bg-white"
                  />
                  {formErrors.party ? (
                    <p className="mt-1 text-xs text-red-600">{formErrors.party}</p>
                  ) : null}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Client Company
                  </label>
                  <Input
                    value={draft.party.clientCompanyName || ""}
                    onChange={(event) => setPartyField("clientCompanyName", event.target.value)}
                    className="border-slate-200 bg-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Client Address
                  </label>
                  <Textarea
                    rows={3}
                    value={draft.party.clientAddress || ""}
                    onChange={(event) => setPartyField("clientAddress", event.target.value)}
                    className="border-slate-200 bg-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Client Phone / Email
                  </label>
                  <Input
                    value={draft.party.clientContact || ""}
                    onChange={(event) => setPartyField("clientContact", event.target.value)}
                    placeholder="+977 ... / client@email.com"
                    className="border-slate-200 bg-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Subject / Title
                  </label>
                  <Input
                    value={draft.subject}
                    onChange={(event) => setField("subject", event.target.value)}
                    className="border-slate-200 bg-white"
                  />
                  {formErrors.subject ? (
                    <p className="mt-1 text-xs text-red-600">{formErrors.subject}</p>
                  ) : null}
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Introduction / Message
                  </label>
                  <Textarea
                    rows={4}
                    value={draft.introduction || ""}
                    onChange={(event) => setField("introduction", event.target.value)}
                    placeholder="Short introduction before the quotation table"
                    className="border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">
                      Quotation Items
                    </h3>
                    <p className="text-sm text-slate-500">
                      Add line items with description, quantity, unit price, and totals. Maximum
                      10 items per quotation.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addItem}
                    disabled={draft.items.length >= 10}
                    className="rounded-xl border-slate-200"
                  >
                    Add Item
                  </Button>
                </div>
                {draft.items.length >= 10 ? (
                  <p className="mb-3 text-sm text-amber-700">
                    Maximum 10 items reached. Create another quotation for additional items.
                  </p>
                ) : null}
                <div className="space-y-3">
                  {draft.items.map((item, index) => (
                    <QuotationItemRow
                      key={item.id}
                      item={item}
                      index={index}
                      onChange={handleItemChange}
                      onRemove={removeItem}
                      disableRemove={draft.items.length === 1}
                    />
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">
                    Pricing Controls
                  </h3>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                        Currency
                      </label>
                      <Input
                        value={draft.currency}
                        onChange={(event) => setField("currency", event.target.value.toUpperCase())}
                        className="border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                        Discount Type
                      </label>
                      <select
                        value={draft.discountMode}
                        onChange={(event) =>
                          setField("discountMode", event.target.value as QuotationDraft["discountMode"])
                        }
                        className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-200"
                      >
                        <option value="amount">Fixed Amount</option>
                        <option value="percentage">Percentage</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                        Discount Value
                      </label>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={draft.discountValue}
                        onChange={(event) =>
                          setField("discountValue", Math.max(0, Number(event.target.value) || 0))
                        }
                        className="border-slate-200 bg-white"
                      />
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span>{formatCurrency(totals.subtotal, draft.currency)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Discount</span>
                      <span>- {formatCurrency(totals.discountAmount, draft.currency)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-200 pt-2 font-black uppercase tracking-[0.08em] text-slate-900">
                      <span>Payable Total</span>
                      <span>{formatCurrency(totals.grandTotal, draft.currency)}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">
                    Letter Pad Assets
                  </h3>
                  <div className="mt-4 grid items-start gap-4">
                    <div className="rounded-[24px] border border-slate-200 bg-white/80 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500">
                            Letter Pad Image Path
                          </label>
                          <Input
                            value={draft.assets.letterpad}
                            onChange={(event) => setAssetField("letterpad", event.target.value)}
                            className="h-11 w-full rounded-xl border-slate-200 bg-white px-3 text-sm leading-5 text-slate-700 focus-visible:border-red-300 focus-visible:ring-red-200"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500">
                            Signature Image Path
                          </label>
                          <Input
                            value={draft.assets.signature}
                            onChange={(event) => setAssetField("signature", event.target.value)}
                            className="h-11 w-full rounded-xl border-slate-200 bg-white px-3 text-sm leading-5 text-slate-700 focus-visible:border-red-300 focus-visible:ring-red-200"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-[linear-gradient(160deg,#ffffff,#f8fafc)] shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
                      <div className="border-b border-slate-200 bg-white/70 px-5 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-red-600">
                          Fixed Regards Block
                        </p>
                      </div>
                      <div className="space-y-3 p-4">
                        <div className="rounded-2xl bg-white/90 px-4 py-3.5 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
                          <div className="flex flex-col gap-1.5">
                            <p className="text-[11px] font-medium tracking-[0.01em] text-slate-700">
                              {STATIC_QUOTATION_PREPARED_BY.heading}
                            </p>
                            <p className="text-sm font-semibold leading-5 text-slate-900">
                              {STATIC_QUOTATION_PREPARED_BY.name}
                            </p>
                            <div className="space-y-0.5 text-sm text-slate-700">
                              <p className="font-medium">Call</p>
                              <p className="break-all font-medium text-slate-900">
                                {STATIC_QUOTATION_PREPARED_BY.contact}
                              </p>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs leading-5 text-slate-500">
                          This regards block is fixed for all quotations and appears in the same
                          styled format on the live preview and exported PDF.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:flex-wrap">
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={isPending}
                  className="rounded-xl bg-red-600 hover:bg-red-700"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {selectedQuotationId ? "Update Quotation" : "Save Quotation"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={scrollToPreview}
                  className="rounded-xl border-slate-200"
                >
                  <Eye className="h-4 w-4" />
                  Preview Quotation
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrint}
                  className="rounded-xl border-slate-200"
                >
                  <Printer className="h-4 w-4" />
                  Print Quotation
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDownloadPdf}
                  className="rounded-xl border-slate-200"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </div>
          </section>
        </div>

        <section
          ref={(node) => {
            previewRef.current = node;
          }}
          className="quotation-print-stage space-y-4"
        >
          <div className="admin-no-print rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-red-50 p-2 text-red-500">
                  <Eye className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight text-slate-900">
                    Quotation Preview
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    This live preview shows exactly how the quotation will look when you print it
                    or download it as PDF. The letter pad, signature, and fixed regards block
                    update this layout directly.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrint}
                  className="rounded-xl border-slate-200"
                >
                  <Printer className="h-4 w-4" />
                  Print Quotation
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDownloadPdf}
                  className="rounded-xl border-slate-200"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </div>
          </div>
          <QuotationPreview
            ref={(node) => {
              quotationPageRef.current = node;
            }}
            draft={draft}
          />
        </section>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete quotation?"
        description={
          deleteTarget
            ? `This will permanently delete ${deleteTarget.quotationNumber}. This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={handleDelete}
        pending={isPending}
        tone="danger"
      />
    </div>
  );
}
