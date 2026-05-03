import Link from "next/link";
import { buildMetadata } from "@/app/seo/utils/metadata";
import Image from "@/components/ui/optimized-image";
import { ArrowRight, CalendarDays, Sparkles, Tag } from "lucide-react";
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

function getSummary(promotion: { previewText?: string | null; body: string }) {
  return (
    promotion.previewText ||
    promotion.body
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 180)
  );
}

function clampPage(value: number, totalPages: number) {
  return Math.min(Math.max(1, value), Math.max(1, totalPages));
}

function getPageHref(page: number) {
  return page === 1 ? "/promotions" : `/promotions?page=${page}`;
}

function getPageNumbers(currentPage: number, totalPages: number) {
  const pages: number[] = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + maxVisible - 1);

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  return pages;
}

const PROMOTIONS_PER_PAGE = 5;

export default async function PromotionsPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const response = await fetchPublishedPromotions();
  const promotions = response.data ?? [];
  const params = (await searchParams) ?? {};
  const totalPages = Math.max(1, Math.ceil(promotions.length / PROMOTIONS_PER_PAGE));
  const currentPage = clampPage(Number(params.page ?? 1) || 1, totalPages);
  const pageStart = (currentPage - 1) * PROMOTIONS_PER_PAGE;
  const pagePromotions = promotions.slice(pageStart, pageStart + PROMOTIONS_PER_PAGE);
  const featuredPromotion = pagePromotions[0];
  const secondaryPromotions = pagePromotions.slice(1);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(circle_at_top_left,rgba(22,163,74,0.15),transparent_32%),radial-gradient(circle_at_top_right,rgba(220,38,38,0.16),transparent_34%),linear-gradient(180deg,rgba(248,250,252,1),rgba(255,255,255,0.94))]" />
      <section className="relative overflow-hidden rounded-[32px] border border-red-100 bg-[linear-gradient(135deg,rgba(127,29,29,0.98),rgba(185,28,28,0.94)_42%,rgba(22,101,52,0.95)_100%)] shadow-[0_30px_80px_rgba(127,29,29,0.18)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.15),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.18),transparent_32%)]" />
        <div className="relative grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-10">
          <div className="flex flex-col justify-between gap-8">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
                Promotions
              </div>
              <div className="max-w-2xl space-y-4">
                <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                  Campaigns, offers, and product stories with more presence.
                </h1>
                <p className="max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                  The latest newsletter campaigns are published here with stronger visuals,
                  clearer calls to action, and a layout built for scanning on mobile and desktop.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-100">
                  Live promotions
                </p>
                <p className="mt-2 text-2xl font-black text-white">{promotions.length}</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-rose-100">
                  Fresh update
                </p>
                <p className="mt-2 text-lg font-black text-white">
                  {featuredPromotion ? formatDate(featuredPromotion.publishedAt) : "—"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-200">
                  Browse
                </p>
                <p className="mt-2 text-lg font-black text-white">Newsletter feed</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {featuredPromotion ? (
              <Link
                href={`/promotions/${featuredPromotion.slug}`}
                className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-950 shadow-[0_24px_80px_rgba(127,29,29,0.36)]"
              >
                {featuredPromotion.imageUrl && (
                  <Image
                    src={featuredPromotion.imageUrl}
                    alt={featuredPromotion.subject}
                    width={1200}
                    height={900}
                    className="h-[340px] w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                    sizes="(max-width: 1024px) 100vw, 42vw"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/88 via-red-950/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 backdrop-blur">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDate(featuredPromotion.publishedAt)}
                    </span>
                    {featuredPromotion.targetLabel && (
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 backdrop-blur">
                        <Tag className="h-3.5 w-3.5" />
                        {featuredPromotion.targetLabel}
                      </span>
                    )}
                  </div>
                  <h2 className="mt-4 max-w-lg text-2xl font-black tracking-tight text-white sm:text-3xl">
                    {featuredPromotion.subject}
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-200">
                    {getSummary(featuredPromotion)}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-emerald-700 transition group-hover:bg-emerald-50">
                    Read promotion
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ) : (
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 text-slate-300">
                No public promotions are available right now.
              </div>
            )}
          </div>
        </div>
      </section>

      {!response.success && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          {response.message}
        </div>
      )}

      <div className="mt-8 space-y-4">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-[0.22em] text-slate-600">
              Recent campaigns
            </h2>
            <span className="text-xs text-slate-400">
              {promotions.length > 0
                ? `${promotions.length} live items`
                : "No live items"}
            </span>
          </div>

          {pagePromotions.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-emerald-200 bg-white p-8 text-sm text-slate-500">
              More promotions will appear here when campaigns are published.
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {pagePromotions.map((promotion, index) => (
                <Link
                  key={promotion.id}
                  href={`/promotions/${promotion.slug}`}
                  className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(22,101,52,0.12)]"
                >
                  <div className="grid gap-0">
                    {promotion.imageUrl && (
                      <div className="overflow-hidden bg-slate-100">
                        <Image
                          src={promotion.imageUrl}
                          alt={promotion.subject}
                          width={960}
                          height={640}
                          className={`w-full object-cover transition duration-500 group-hover:scale-[1.03] ${
                            index === 0 ? "h-60" : "h-48"
                          }`}
                          sizes="(max-width: 1024px) 100vw, 33vw"
                        />
                      </div>
                    )}

                    <div className="flex flex-col justify-between p-6">
                      <div>
                        <div className="flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                          <span className="inline-flex items-center gap-2">
                            <CalendarDays className="h-3.5 w-3.5 text-emerald-600" />
                            {formatDate(promotion.publishedAt)}
                          </span>
                          {promotion.targetLabel && (
                            <span className="max-w-[55%] truncate rounded-full bg-emerald-50 px-3 py-1 text-[10px] text-emerald-700">
                              {promotion.targetLabel}
                            </span>
                          )}
                        </div>
                        <h3
                          className={`mt-4 font-black tracking-tight text-slate-900 transition group-hover:text-red-600 ${
                            index === 0 ? "text-2xl" : "text-xl"
                          }`}
                        >
                          {promotion.subject}
                        </h3>
                        <p className="mt-3 text-sm leading-6 text-slate-600">
                          {getSummary(promotion)}
                        </p>
                      </div>

                      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                        <span className="text-xs font-medium text-slate-400">
                          {promotion.previewText ? "Preview text included" : "Full campaign body"}
                        </span>
                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition group-hover:text-red-600">
                          Open
                          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex flex-col gap-3 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Page <span className="font-semibold text-slate-800">{currentPage}</span> of{" "}
                <span className="font-semibold text-slate-800">{totalPages}</span>
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={getPageHref(clampPage(currentPage - 1, totalPages))}
                  aria-disabled={currentPage === 1}
                  className={`inline-flex h-10 items-center rounded-full border px-4 text-sm font-semibold transition ${
                    currentPage === 1
                      ? "pointer-events-none border-slate-200 bg-slate-100 text-slate-400"
                      : "border-slate-200 bg-white text-slate-700 hover:border-red-200 hover:text-red-600"
                  }`}
                >
                  Previous
                </Link>

                {getPageNumbers(currentPage, totalPages).map((page) => (
                  <Link
                    key={page}
                    href={getPageHref(page)}
                    aria-current={page === currentPage ? "page" : undefined}
                  className={`inline-flex h-10 min-w-10 items-center justify-center rounded-full border px-4 text-sm font-semibold transition ${
                    page === currentPage
                        ? "border-red-600 bg-red-600 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-red-200 hover:text-red-600"
                  }`}
                >
                  {page}
                </Link>
                ))}

                <Link
                  href={getPageHref(clampPage(currentPage + 1, totalPages))}
                  aria-disabled={currentPage === totalPages}
                  className={`inline-flex h-10 items-center rounded-full border px-4 text-sm font-semibold transition ${
                    currentPage === totalPages
                      ? "pointer-events-none border-slate-200 bg-slate-100 text-slate-400"
                      : "border-slate-200 bg-white text-slate-700 hover:border-red-200 hover:text-red-600"
                  }`}
                >
                  Next
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
