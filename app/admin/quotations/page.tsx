import QuotationMaker from "@/components/admin/quotation-maker";
import { getQuotationDashboardData } from "@/lib/server/actions/admin/quotation/quotationActions";
import { connection } from "next/server";

export default async function AdminQuotationsPage() {
  await connection();
  const response = await getQuotationDashboardData();

  const data = response.data ?? {
    quotations: [],
    nextQuotationNumber: `QT-${new Date().getFullYear()}-001`,
    defaults: {
      currency: "NPR",
      terms: "",
      assets: {
        letterpad: "/assets/quotation/letterpad.png",
        signature: "/assets/quotation/signature.png",
        stamp: "",
      },
    },
  };

  return (
    <div className="space-y-4">
      {!response.success ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          {response.message}
        </div>
      ) : null}
      <QuotationMaker
        initialQuotations={data.quotations}
        nextQuotationNumber={data.nextQuotationNumber}
        defaults={data.defaults}
      />
    </div>
  );
}
