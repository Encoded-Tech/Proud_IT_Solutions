import Link from "next/link";
import Image from "@/components/ui/optimized-image";
import { ArrowRight } from "lucide-react";
import { AnyMediaItem } from "@/types/media";
import HeroBanners from "./hero-banners";
import Hero from "./hero";
import { HomeBottomTile } from "@/types/home-media";

type HeroBannerDTO = {
  _id: string;
  imageUrl: string;
  placement: string;
};

type ExploreCardItem = {
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl: string;
  ctaText?: string;
  altText: string;
  sortOrder: number;
};

export const fallbackBottomTiles: ExploreCardItem[] = [
  { title: "Shop by Category", imageUrl: "/category/ct1.jpg", linkUrl: "/shop", ctaText: "View", altText: "Shop by Category", sortOrder: 1 },
  { title: "Featured Brands", imageUrl: "/category/ct3.jpg", linkUrl: "/shop?brand=Lenovo", ctaText: "View", altText: "Featured Brands", sortOrder: 2 },
  { title: "Trending Products", imageUrl: "/products/p2.jpg", linkUrl: "/shop?sort=popular", ctaText: "View", altText: "Trending Products", sortOrder: 3 },
  { title: "Best Deals", imageUrl: "/products/p4.jpg", linkUrl: "/promotions", ctaText: "View", altText: "Best Deals", sortOrder: 4 },
];

function pickMedia(media: AnyMediaItem[], placements: string[]) {
  return placements
    .map((placement) => media.find((item) => item.placement === placement))
    .filter(Boolean) as AnyMediaItem[];
}

function PromoMediaCard({
  item,
  label,
  className,
}: {
  item: AnyMediaItem;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href="/promotions"
      aria-label={label}
      className={`group relative block h-full overflow-hidden rounded-[24px] border border-white/10 bg-slate-950 shadow-[0_18px_48px_rgba(15,23,42,0.22)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${className ?? ""}`}
    >
      <div className="relative h-full min-h-[180px]">
        {item.type === "image" ? (
          <Image
            src={item.imageUrl}
            alt={label}
            fill
            sizes="(max-width: 1024px) 100vw, 34vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <video
            src={item.videoUrl}
            autoPlay
            loop
            muted
            playsInline
            controls={false}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-900/25 to-red-950/20" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white backdrop-blur-sm">
            {label}
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-white">
            <span>View</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function ExploreCard({ item }: { item: ExploreCardItem }) {
  return (
    <Link
      href={item.linkUrl || "#"}
      aria-label={item.title}
      className="group relative block overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
    >
      <div className="relative h-[110px]">
        <Image
          src={item.imageUrl}
          alt={item.altText || item.title}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-900/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="flex items-center justify-between gap-2 text-white">
            <div className="min-w-0">
              {item.subtitle && (
                <span className="block truncate text-[9px] font-semibold uppercase tracking-[0.18em] text-white/80">
                  {item.subtitle}
                </span>
              )}
              <span className="block truncate text-sm font-bold">{item.title}</span>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold">
              {item.ctaText && item.ctaText !== "View" ? <span>{item.ctaText}</span> : null}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function HomeMarketplacePromos({
  media = [],
  heroBanners = [],
  bottomTiles = [],
}: {
  media?: AnyMediaItem[];
  heroBanners?: HeroBannerDTO[];
  bottomTiles?: HomeBottomTile[];
}) {
  const topBanner = media.find((item) => item.placement === "home_top_banner");
  const splitAds = pickMedia(media, ["home_split_left", "home_split_right"]);
  const activeTiles = [...bottomTiles]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 4);
  const exploreCards: ExploreCardItem[] = fallbackBottomTiles.map(
    (fallback, index) => {
      const tile = activeTiles[index];
      if (!tile) return fallback;
      return {
        title: tile.title,
        subtitle: tile.subtitle,
        imageUrl: tile.imageUrl || fallback.imageUrl,
        linkUrl: tile.linkUrl || "#",
        ctaText: tile.ctaText || "View",
        altText: tile.altText || tile.title,
        sortOrder: tile.sortOrder,
      };
    }
  );

  return (
    <section
      aria-label="Homepage landing promotions"
      className="bg-[linear-gradient(180deg,#fff7f7_0%,#ffffff_18%,#f8fafc_18%,#e2e8f0_100%)]"
    >
      <div className="flex min-h-screen w-full flex-col gap-4 px-4 py-4 sm:px-6 lg:h-screen lg:max-h-screen lg:overflow-hidden lg:px-8 lg:py-5 xl:px-10 2xl:px-12">
        <div className="grid flex-1 gap-4 lg:min-h-0 lg:grid-cols-12">
          <div className="lg:col-span-8 lg:min-h-0">
            {heroBanners.length > 0 ? (
              <HeroBanners banners={heroBanners} className="h-full" />
            ) : (
              <Hero />
            )}
          </div>

          <div className="grid gap-4 lg:col-span-4 lg:min-h-0 lg:grid-rows-[1.15fr_1fr]">
            {topBanner ? (
              <PromoMediaCard
                item={topBanner}
                label="Explore Proud Nepal Deals"
                className="lg:min-h-0"
              />
            ) : (
              <div className="rounded-[24px] border border-white/10 bg-white/5" />
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:min-h-0 lg:grid-cols-2">
              {splitAds[0] ? (
                <PromoMediaCard
                  item={splitAds[0]}
                  label="Fresh Arrivals for You"
                  className="lg:min-h-0"
                />
              ) : (
                <div className="rounded-[24px] border border-white/10 bg-white/5" />
              )}
              {splitAds[1] ? (
                <PromoMediaCard
                  item={splitAds[1]}
                  label="Limited-Time Store Offers"
                  className="lg:min-h-0"
                />
              ) : (
                <div className="rounded-[24px] border border-white/10 bg-white/5" />
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {exploreCards.map((item) => (
            <ExploreCard key={item.title} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
