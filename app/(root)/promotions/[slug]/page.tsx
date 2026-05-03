import Link from "next/link";
import Image from "@/components/ui/optimized-image";
import { buildMetadata } from "@/app/seo/utils/metadata";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, Sparkles, Tag } from "lucide-react";
import {
  fetchPromotionBySlug,
  fetchPublishedPromotions,
} from "@/lib/server/fetchers/fetchPromotions";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const response = await fetchPublishedPromotions();
  const promotions = response.data ?? [];

  if (promotions.length === 0) {
    return [{ slug: "__placeholder__" }];
  }

  return promotions.map((promotion) => ({ slug: promotion.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const response = await fetchPromotionBySlug(slug);
  const promotion = response.data;

  if (!response.success || !promotion) {
    return buildMetadata({
      title: "Promotion Not Found",
      description: "The requested promotion is not available.",
      path: `/promotions/${slug}`,
      index: false,
    });
  }

  return buildMetadata({
    title: promotion.subject,
    description: (promotion.previewText || promotion.body).replace(/\s+/g, " ").trim().slice(0, 160),
    path: `/promotions/${promotion.slug}`,
    keywords: [
      "Nepal promotions",
      "electronics offers Nepal",
      "Proud Nepal campaign",
      promotion.subject,
    ],
  });
}

function renderParagraphs(body: string) {
  return body.split(/\n{2,}/).map((paragraph, index) => (
    <p key={index}>{paragraph}</p>
  ));
}

function formatDate(value: string | Date | null | undefined) {
  return value
    ? new Date(value).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "—";
}

export default async function PromotionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (slug === "__placeholder__") {
    notFound();
  }

  const response = await fetchPromotionBySlug(slug);

  if (!response.success || !response.data) {
    redirect("/promotions");
  }

  const promotion = response.data;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/promotions"
        className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 transition hover:text-red-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to promotions
      </Link>

      <section className="mt-6 overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.1)]">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative bg-slate-950">
            {promotion.imageUrl && (
              <Image
                src={promotion.imageUrl}
                alt={promotion.subject}
                width={1400}
                height={1000}
                className="h-full min-h-[320px] w-full object-cover lg:min-h-[720px]"
                sizes="(max-width: 1024px) 100vw, 55vw"
                priority
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/30 to-transparent" />
            <div className="absolute inset-0 flex items-end p-6 sm:p-8 lg:p-10">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white backdrop-blur">
                  <Sparkles className="h-3.5 w-3.5 text-red-300" />
                  Promotion
                </div>
                <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">
                  {promotion.subject}
                </h1>
                {promotion.previewText && (
                  <p className="mt-4 max-w-xl text-base leading-7 text-slate-200 sm:text-lg">
                    {promotion.previewText}
                  </p>
                )}
                <div className="mt-5 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 backdrop-blur">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(promotion.publishedAt)}
                  </span>
                  {promotion.targetLabel && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 backdrop-blur">
                      <Tag className="h-3.5 w-3.5" />
                      {promotion.targetLabel}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 backdrop-blur">
                    Newsletter campaign
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 p-6 sm:p-8 lg:p-10">
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-red-500">
                Campaign summary
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {promotion.previewText || promotion.body.replace(/\s+/g, " ").trim().slice(0, 220)}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[22px] border border-slate-200 bg-white p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Published
                </p>
                <p className="mt-2 text-lg font-black text-slate-900">{formatDate(promotion.publishedAt)}</p>
              </div>
              <div className="rounded-[22px] border border-slate-200 bg-white p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Audience
                </p>
                <p className="mt-2 text-lg font-black text-slate-900">{promotion.audience}</p>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-5 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60">
                Action
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Open the linked destination or continue exploring the promotions feed.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {promotion.ctaLabel && promotion.ctaUrl && (
                  <Link
                    href={promotion.targetPath || promotion.ctaUrl}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-red-50"
                  >
                    {promotion.ctaLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
                <Link
                  href="/promotions"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Browse more
                </Link>
              </div>
            </div>

            {promotion.targetLabel && (
              <div className="rounded-[24px] border border-slate-200 bg-white p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Linked destination
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-800">{promotion.targetLabel}</p>
                <p className="mt-1 break-all text-xs text-slate-500">{promotion.targetPath}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-red-500">
            Campaign body
          </p>
          <div className="mt-4 space-y-5 text-base leading-8 text-slate-700">
            {renderParagraphs(promotion.body)}
          </div>
        </article>

        <aside className="space-y-4">
          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
              Promotion details
            </p>
            <div className="mt-4 space-y-4 text-sm text-slate-600">
              <div>
                <p className="font-semibold text-slate-900">Published date</p>
                <p className="mt-1">{formatDate(promotion.publishedAt)}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Audience</p>
                <p className="mt-1">{promotion.audience}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Campaign type</p>
                <p className="mt-1">Public newsletter promotion</p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-red-500">
              Related note
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              The same layout and image now appear in the campaign email, so the public page and
              inbox version stay visually aligned.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
