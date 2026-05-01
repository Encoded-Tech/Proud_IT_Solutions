import Link from "next/link";
import { buildMetadata } from "@/app/seo/utils/metadata";
import { notFound, redirect } from "next/navigation";
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
    <main className="mx-4 my-10 max-w-4xl xl:mx-auto">
      <Link
        href="/promotions"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-red-600 transition hover:text-red-700"
      >
        ← Back to promotions
      </Link>

      <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-red-500">
          Promotion
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900">
          {promotion.subject}
        </h1>
        {promotion.previewText && (
          <p className="mt-3 text-lg text-slate-500">{promotion.previewText}</p>
        )}

        <div className="mt-8 space-y-5 text-base leading-8 text-slate-700">
          {renderParagraphs(promotion.body)}
        </div>

        {promotion.ctaLabel && promotion.ctaUrl && (
          <div className="mt-8">
            <Link
              href={promotion.targetPath || promotion.ctaUrl}
              className="inline-flex rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              {promotion.ctaLabel}
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
