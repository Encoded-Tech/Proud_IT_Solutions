import Link from "next/link";
import { buildMetadata } from "@/app/seo/utils/metadata";
import { fetchPublishedPromotions } from "@/lib/server/fetchers/fetchPromotions";

export const metadata = buildMetadata({
  title: "Promotions and Offers in Nepal",
  description:
    "Browse the latest Proud Nepal promotions, campaign announcements, and special offers on laptops, PCs, accessories, and electronics in Nepal.",
  path: "/promotions",
  keywords: [
    "Nepal electronics offers",
    "Proud Nepal promotions",
    "laptop deals Nepal",
    "PC offers Nepal",
    "electronics discounts Nepal",
    "computer accessories offers Nepal",
  ],
});

function formatDate(value: string | Date | null | undefined) {
  return value
    ? new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";
}

export default async function PromotionsPage() {
  const response = await fetchPublishedPromotions();
  const promotions = response.data ?? [];

  return (
    <main className="mx-4 my-10 max-w-7xl xl:mx-auto">
      <div className="rounded-[32px] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-red-50 p-8 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-red-500">
          Promotions
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900">
          Latest Offers and Campaign Updates
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Browse the same campaign announcements that are sent to newsletter subscribers.
        </p>
      </div>

      {!response.success && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          {response.message}
        </div>
      )}

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {promotions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-sm text-slate-500">
            No public promotions are available right now.
          </div>
        ) : (
          promotions.map((promotion) => (
            <Link
              key={promotion.id}
              href={`/promotions/${promotion.slug}`}
              className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center justify-end">
                <span className="text-xs text-slate-400">{formatDate(promotion.publishedAt)}</span>
              </div>
              <h2 className="mt-4 text-xl font-black tracking-tight text-slate-900 transition group-hover:text-red-600">
                {promotion.subject}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {promotion.previewText || promotion.body.slice(0, 150)}
              </p>
              {promotion.targetLabel && (
                <p className="mt-4 text-xs font-medium text-slate-400">
                  Linked to {promotion.targetLabel}
                </p>
              )}
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
