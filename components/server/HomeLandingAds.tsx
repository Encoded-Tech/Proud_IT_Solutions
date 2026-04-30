import Link from "next/link";
import Image from "@/components/ui/optimized-image";
import { AnyMediaItem } from "@/types/media";

type Variant = "top" | "middle" | "footer";

interface HomeLandingAdsProps {
  media: AnyMediaItem[];
  variant: Variant;
}

function pickMedia(media: AnyMediaItem[], placements: string[]) {
  return placements
    .map((placement) => media.find((item) => item.placement === placement))
    .filter(Boolean) as AnyMediaItem[];
}

function AdCard({ item }: { item: AnyMediaItem }) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-slate-950 shadow-sm">
      <div className="relative aspect-[16/6] sm:aspect-[16/5]">
        {item.type === "image" ? (
          <Image
            src={item.imageUrl}
            alt="Promotional ad"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1280px"
            priority={false}
          />
        ) : (
          <video
            src={item.videoUrl}
            autoPlay
            loop
            muted
            playsInline
            controls={false}
            className="h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-black/15" />
      </div>
    </div>
  );
}

export default function HomeLandingAds({ media, variant }: HomeLandingAdsProps) {
  const topBanner = media.find((item) => item.placement === "home_top_banner");
  const splitAds = pickMedia(media, ["home_split_left", "home_split_right"]);
  const midBanner = media.find((item) => item.placement === "home_mid_banner");
  const footerBanner = media.find((item) => item.placement === "home_footer_banner");

  if (variant === "top") {
    if (!topBanner && splitAds.length === 0) return null;

    return (
      <section className="w-full bg-gradient-to-b from-slate-950 via-slate-950 to-white py-4 sm:py-6">
        <div className="mx-0 w-full px-4 sm:px-6 lg:px-8">
          <div className="rounded-[36px] border border-white/10 bg-white/5 p-3 shadow-[0_20px_80px_rgba(15,23,42,0.18)] backdrop-blur">
            <div className="mb-3 flex items-center justify-between gap-3 px-2 sm:px-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-red-200">
                  Sponsored Promotions
                </p>
                <h2 className="mt-1 text-lg font-black tracking-tight text-white sm:text-2xl">
                  Full-page ad placements
                </h2>
              </div>
              <Link
                href="/promotions"
                className="hidden rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10 sm:inline-flex"
              >
                View all promotions
              </Link>
            </div>

            <div className="grid gap-3 lg:grid-cols-[1.45fr_0.85fr]">
              {topBanner ? (
                <Link href="/promotions" className="block transition-transform hover:-translate-y-0.5">
                  <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-slate-900 shadow-2xl">
                    <div className="relative aspect-[16/10] md:aspect-[16/8]">
                      {topBanner.type === "image" ? (
                        <Image
                          src={topBanner.imageUrl}
                          alt="Promotional ad"
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 100vw, 70vw"
                          priority={false}
                        />
                      ) : (
                        <video
                          src={topBanner.videoUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          controls={false}
                          className="h-full w-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/10 to-black/25" />
                    </div>
                  </div>
                </Link>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {splitAds.length > 0 ? (
                  splitAds.map((item) => (
                    <Link  
                      key={item.id}
                      href="/promotions"
                      className="block transition-transform hover:-translate-y-0.5"
                    >
                      <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-slate-900 shadow-xl">
                        <div className="relative aspect-[16/7] lg:aspect-[16/8]">
                          {item.type === "image" ? (
                            <Image
                              src={item.imageUrl}
                              alt="Promotional ad"
                              fill
                              className="object-cover"
                              sizes="(max-width: 1024px) 100vw, 35vw"
                            />
                          ) : (
                            <video
                              src={item.videoUrl}
                              autoPlay
                              loop
                              muted
                              playsInline
                              controls={false}
                              className="h-full w-full object-cover"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/15" />
                        </div>
                      </div>
                    </Link>
                  ))
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (variant === "middle") {
    if (!midBanner) return null;

    return (
      <section className="mx-4 my-16 max-w-7xl xl:mx-auto">
        <Link href="/promotions" className="block transition-transform hover:-translate-y-0.5">
          <AdCard item={midBanner} />
        </Link>
      </section>
    );
  }

  if (!footerBanner) return null;

  return (
    <section className="mx-4 my-16 max-w-7xl xl:mx-auto">
      <Link href="/promotions" className="block transition-transform hover:-translate-y-0.5">
        <AdCard item={footerBanner} />
      </Link>
    </section>
  );
}
