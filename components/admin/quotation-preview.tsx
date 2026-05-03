"use client";

import { forwardRef } from "react";
import { format } from "date-fns";
import {
  buildQuotationPages,
  computeQuotationTotals,
  ELECTRONIC_SIGNATURE_NOTE,
  formatCurrency,
  getExpandedQuotationRowHeightMm,
  STATIC_QUOTATION_HIGHLIGHTS,
  STATIC_QUOTATION_PREPARED_BY,
} from "@/lib/helpers/quotation";
import { QuotationDraft } from "@/types/quotation";

interface QuotationPreviewProps {
  draft: QuotationDraft;
}

function SignatureBlock({
  stamp,
  signature,
}: {
  stamp?: string;
  signature?: string;
}) {
  const hasStamp = Boolean(stamp);
  const hasSignature = Boolean(signature);

  return (
    <div className="signature-block">
      {hasSignature && !hasStamp ? (
        <img
          src={signature}
          alt="Authorized stamp and signature"
          data-signature-image
          draggable={false}
          className="signature-combined-image"
        />
      ) : null}

      {hasStamp ? (
        <div className="signature-layered">
          <img
            src={stamp!}
            alt="Company stamp"
            data-stamp-image
            draggable={false}
            className="stamp-image"
          />

          {hasSignature ? (
            <img
              src={signature}
              alt="Authorized signature"
              data-signature-image
              draggable={false}
              className="signature-image"
            />
          ) : null}
        </div>
      ) : null}

      <p className="authorized-text">AUTHORIZED SIGNATORY</p>
      <p className="signature-note">{ELECTRONIC_SIGNATURE_NOTE}</p>

      <style jsx>{`
        .signature-block {
          display: flex;
          width: 56mm;
          min-height: 36mm;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          text-align: center;
        }

        .signature-combined-image {
          display: block;
          width: 25mm !important;
          height: auto !important;
          max-width: none !important;
          max-height: none !important;
          object-fit: contain;
          object-position: center;
          margin: 0 auto 0.1mm !important;
          transform: none !important;
          position: static !important;
        }

        .signature-layered {
          position: relative;
          width: 48mm;
          height: 34mm;
          margin: 0 auto 0.4mm;
          overflow: visible;
        }

        .stamp-image {
          position: absolute;
          top: 0;
          left: 50%;
          width: 30mm;
          height: 30mm;
          object-fit: contain;
          object-position: center;
          transform: translateX(-50%);
        }

        .signature-image {
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 42mm;
          height: 16mm;
          object-fit: contain;
          object-position: center;
          transform: translateX(-50%);
        }

        .authorized-text {
          margin: 0 !important;
          color: #020617 !important;
          font-size: 2mm;
          font-weight: 900;
          line-height: 1.1;
          letter-spacing: 0.3mm;
          text-transform: uppercase;
        }

        .signature-note {
          margin: 0.4mm 0 0 !important;
          max-width: 52mm;
          color: #334155 !important;
          font-size: 1.55mm;
          font-weight: 600;
          line-height: 1.2;
        }
      `}</style>
    </div>
  );
}

const QuotationPreview = forwardRef<HTMLElement, QuotationPreviewProps>(function QuotationPreview(
  { draft },
  ref
) {
  const totals = computeQuotationTotals(draft);
  const pages = buildQuotationPages(draft);
  const page = pages[0];
  const expandedRowHeightMm = getExpandedQuotationRowHeightMm(page.items.length);
  const formattedDate = draft.quotationDate
    ? format(new Date(draft.quotationDate), "MMMM d, yyyy")
    : "";

  return (
    <div className="space-y-4">
      <article
        ref={ref}
        className="quotation-page quotation-export-safe relative mx-auto w-full max-w-[210mm] overflow-hidden"
        data-quotation-export="true"
        style={{
          width: "210mm",
          height: "297mm",
          minHeight: "297mm",
          maxHeight: "297mm",
          backgroundColor: "#ffffff",
          boxShadow: "0 24px 60px rgba(15, 23, 42, 0.16)",
          WebkitPrintColorAdjust: "exact",
          printColorAdjust: "exact",
        }}
      >
        <style jsx>{`
          .quotation-page {
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
            overflow: hidden !important;
            position: relative;
            background: #ffffff;
          }

          .quotation-export-safe {
            width: 210mm;
            height: 297mm;
            position: relative;
            background-color: #ffffff !important;
            color: #0f172a !important;
            overflow: hidden;
          }

          .quotation-export-safe * {
            color-scheme: light;
          }

          .q-text-900 {
            color: #0f172a !important;
          }

          .q-text-800 {
            color: #1e293b !important;
          }

          .q-text-700 {
            color: #334155 !important;
          }

          .q-text-600 {
            color: #475569 !important;
          }

          .q-text-white {
            color: #ffffff !important;
          }

          .quotation-export-safe .quotation-title,
          .quotation-export-safe .client-details,
          .quotation-export-safe .quotation-meta,
          .quotation-export-safe .regards-block,
          .quotation-export-safe .authorized-text,
          .quotation-export-safe .small-text {
            color: #0f172a !important;
          }

          .quotation-export-safe .quotation-items-table {
            background-color: #ffffff !important;
            color: #0f172a !important;
            border-color: #cbd5e1 !important;
          }

          .quotation-export-safe .quotation-items-table th {
            background-color: #dc2626 !important;
            color: #ffffff !important;
            border-color: #ef4444 !important;
          }

          .quotation-export-safe .quotation-items-table td {
            color: #0f172a !important;
            border-color: #cbd5e1 !important;
          }

          .quotation-export-safe .total-row td {
            background-color: #f8fafc !important;
            color: #0f172a !important;
            border-color: #cbd5e1 !important;
          }

          .quotation-export-safe .stamp-image,
          .quotation-export-safe .signature-image {
            background-color: transparent !important;
          }

          .letterpad-footer-mask {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            height: 19mm;
            background: #ffffff;
            z-index: 1;
          }

          .custom-letterpad-footer {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            height: 18.5mm;
            z-index: 2;
            overflow: hidden;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .custom-footer-shape {
            position: absolute;
            inset: 0;
            width: 210mm;
            height: 18.5mm;
          }

          .footer-left {
            position: absolute;
            left: 10.5mm;
            bottom: 3.4mm;
            color: #ffffff !important;
            font-size: 3mm;
            font-weight: 900;
            line-height: 1.18;
            letter-spacing: 0;
          }

          .footer-right {
            position: absolute;
            right: 9.5mm;
            bottom: 3.4mm;
            color: #ffffff !important;
            font-size: 2.9mm;
            font-weight: 900;
            line-height: 1.18;
            text-align: right;
            white-space: nowrap;
          }

          .footer-left p,
          .footer-right p {
            margin: 0;
            color: #ffffff !important;
          }

          .quotation-content {
            position: absolute;
            z-index: 3;
            top: 46mm;
            left: 16mm;
            right: 16mm;
            bottom: 22mm;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }

          .signature-area-bottom {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 6mm;
            display: grid;
            grid-template-columns: 1fr 64mm;
            gap: 8mm;
            align-items: end;
          }

          @media print {
            .stamp-image,
            .signature-image {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          }
        `}</style>
        <div
          className="relative min-h-[297mm] w-full overflow-hidden"
          data-letterpad-layer
          style={{
            backgroundImage: `url('${draft.assets.letterpad || "/assets/quotation/letterpad.png"}')`,
            backgroundSize: "100% 100%",
            backgroundPosition: "left top",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="letterpad-footer-mask" />
          <div className="custom-letterpad-footer" aria-hidden="true">
            <svg
              className="custom-footer-shape"
              viewBox="0 0 210 18"
              preserveAspectRatio="none"
            >
              <path d="M0 0 H150 L142 18 H0 Z" fill="#ef3b2d" />
              <path d="M150 0 H210 V18 H142 Z" fill="#0b8f43" />
              <path d="M142 0 H151 L143 18 H134 Z" fill="#ffffff" />
            </svg>

            <div className="footer-left">
              <p>Contact</p>
              <p>9867174242</p>
            </div>

            <div className="footer-right">
              <p>Website: proudnepal.com.np</p>
              <p>Email: proudnepalits@gmail.com</p>
            </div>
          </div>
          <div className="quotation-content q-text-900">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="client-details max-w-[115mm]">
                  <h1 className="quotation-title q-text-900 text-center text-[15px] font-black uppercase tracking-[0.22em]">
                    Quotation
                  </h1>
                  <div className="q-text-800 mt-3 space-y-1 text-[10.5px] leading-5">
                    <p>
                      <span className="q-text-800 font-bold">Client Name:</span> {draft.party.clientName}
                    </p>
                    {draft.party.clientCompanyName ? (
                      <p>
                        <span className="q-text-800 font-bold">Company:</span> {draft.party.clientCompanyName}
                      </p>
                    ) : null}
                    {draft.party.clientAddress ? (
                      <p>
                        <span className="q-text-800 font-bold">Address:</span> {draft.party.clientAddress}
                      </p>
                    ) : null}
                    {draft.party.clientContact ? (
                      <p>
                        <span className="q-text-800 font-bold">Phone / Email:</span> {draft.party.clientContact}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="quotation-meta min-w-[50mm] px-1 py-1 text-[10px]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="q-text-700 font-bold">Quotation No.</span>
                    <span className="q-text-900 font-semibold">{draft.quotationNumber}</span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between gap-3">
                    <span className="q-text-700 font-bold">Date</span>
                    <span className="q-text-900">{formattedDate}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <p className="q-text-900 text-[11.5px] font-bold uppercase tracking-[0.12em]">
                  {draft.subject}
                </p>
                {draft.introduction ? (
                  <p className="q-text-800 mt-1.5 whitespace-pre-wrap text-[10.5px] leading-5">
                    {draft.introduction}
                  </p>
                ) : null}
              </div>

              <div
                className="mt-3 overflow-hidden"
                style={{
                  border: "1px solid #cbd5e1",
                  backgroundColor: "rgba(255, 255, 255, 0.96)",
                }}
              >
                <table className="quotation-items-table w-full border-collapse table-fixed">
                  <thead>
                    <tr
                      className="q-text-white"
                      style={{ backgroundColor: "#dc2626", color: "#ffffff" }}
                    >
                      <th
                        className="q-text-white w-[8%] px-2 py-1.5 text-left text-[9.5px] font-bold uppercase tracking-[0.12em]"
                        style={{ borderRight: "1px solid #ef4444", color: "#ffffff" }}
                      >
                        S.N.
                      </th>
                      <th
                        className="q-text-white w-[52%] px-2 py-1.5 text-left text-[9.5px] font-bold uppercase tracking-[0.12em]"
                        style={{ borderRight: "1px solid #ef4444", color: "#ffffff" }}
                      >
                        Description
                      </th>
                      <th
                        className="q-text-white w-[12%] px-2 py-1.5 text-right text-[9.5px] font-bold uppercase tracking-[0.12em]"
                        style={{ borderRight: "1px solid #ef4444", color: "#ffffff" }}
                      >
                        Qty
                      </th>
                      <th
                        className="q-text-white w-[14%] px-2 py-1.5 text-right text-[9.5px] font-bold uppercase tracking-[0.12em]"
                        style={{ borderRight: "1px solid #ef4444", color: "#ffffff" }}
                      >
                        Price
                      </th>
                      <th
                        className="q-text-white w-[14%] px-2 py-1.5 text-right text-[9.5px] font-bold uppercase tracking-[0.12em]"
                        style={{ color: "#ffffff" }}
                      >
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {page.items.map((item) => (
                      <tr key={item.id} className="align-top" style={{ backgroundColor: "#ffffff" }}>
                        <td
                          className="q-text-800 px-2 py-1.5 text-[10px] font-medium"
                          style={{
                            ...(expandedRowHeightMm ? { height: `${expandedRowHeightMm}mm` } : {}),
                            borderTop: "1px solid #cbd5e1",
                            borderRight: "1px solid #cbd5e1",
                          }}
                        >
                          {item.serialNumber}
                        </td>
                        <td
                          className="q-text-800 px-2 py-1.5 text-[10px] leading-4"
                          style={{
                            ...(expandedRowHeightMm ? { height: `${expandedRowHeightMm}mm` } : {}),
                            borderTop: "1px solid #cbd5e1",
                            borderRight: "1px solid #cbd5e1",
                          }}
                        >
                          {item.description}
                        </td>
                        <td
                          className="q-text-800 px-2 py-1.5 text-right text-[10px]"
                          style={{
                            ...(expandedRowHeightMm ? { height: `${expandedRowHeightMm}mm` } : {}),
                            borderTop: "1px solid #cbd5e1",
                            borderRight: "1px solid #cbd5e1",
                          }}
                        >
                          {item.quantity}
                        </td>
                        <td
                          className="q-text-800 px-2 py-1.5 text-right text-[10px]"
                          style={{
                            ...(expandedRowHeightMm ? { height: `${expandedRowHeightMm}mm` } : {}),
                            borderTop: "1px solid #cbd5e1",
                            borderRight: "1px solid #cbd5e1",
                          }}
                        >
                          {formatCurrency(item.unitPrice, draft.currency)}
                        </td>
                        <td
                          className="q-text-900 px-2 py-1.5 text-right text-[10px] font-semibold"
                          style={{
                            ...(expandedRowHeightMm ? { height: `${expandedRowHeightMm}mm` } : {}),
                            borderTop: "1px solid #cbd5e1",
                          }}
                        >
                          {formatCurrency(item.lineTotal, draft.currency)}
                        </td>
                      </tr>
                    ))}
                    <tr className="total-row" style={{ backgroundColor: "#f8fafc" }}>
                      <td
                        colSpan={4}
                        className="q-text-800 px-2 py-2 text-right text-[10px] font-bold uppercase tracking-[0.08em]"
                        style={{ borderTop: "1px solid #cbd5e1" }}
                      >
                        Total
                      </td>
                      <td
                        className="q-text-900 px-2 py-2 text-right text-[10.2px] font-bold"
                        style={{ borderTop: "1px solid #cbd5e1" }}
                      >
                        {formatCurrency(totals.grandTotal, draft.currency)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="signature-area-bottom">
              <div className="space-y-3">
                <div className="notes space-y-1.5 px-1 py-1 pl-3">
                  {STATIC_QUOTATION_HIGHLIGHTS.map((item) => (
                    <div key={item} className="q-text-800 flex items-start gap-2 text-[9.5px] leading-4">
                      <span className="q-text-700 pt-[1px] text-[10px] font-semibold">
                        &#10003;
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="regards-block q-text-800 mt-40 px-1 py-1 text-[9.5px] leading-4">
                  <p className="q-text-700 text-[10px] font-medium tracking-[0.02em]">
                    {STATIC_QUOTATION_PREPARED_BY.heading}
                  </p>
                  <p className="q-text-900 mt-2 text-[10px] font-semibold">
                    {STATIC_QUOTATION_PREPARED_BY.name}
                  </p>
                  <div className="q-text-700 mt-2 space-y-0.5 text-[9.5px]">
                    <p className="q-text-700 font-medium">Call</p>
                    <p className="q-text-900 font-medium tracking-[0.04em]">
                      {STATIC_QUOTATION_PREPARED_BY.contact}
                    </p>
                    <p className="q-text-700 pt-1 font-medium">Email</p>
                    <p className="q-text-900 font-medium tracking-[0.02em]">
                      {STATIC_QUOTATION_PREPARED_BY.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-end justify-end">
                <SignatureBlock
                  stamp={draft.assets.stamp}
                  signature={draft.assets.signature}
                />
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
});

export default QuotationPreview;
