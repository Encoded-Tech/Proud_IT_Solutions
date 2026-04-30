"use client";

import { ArrowRightIcon } from "lucide-react";
import Image from "@/components/ui/optimized-image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface HeroBannersProps {
  banners: {
    _id: string;
    imageUrl: string;
    placement: string;
  }[];
  className?: string;
}

const heroContent: Record<
  string,
  {
    badge: string;
    title: string;
    description: string;
    ctaLabel: string;
    href: string;
  }
> = {
  hero_first: {
    badge: "Hero First",
    title: "Fresh Arrivals for You",
    description:
      "Discover the newest laptops, monitors, and productivity gear curated for everyday shoppers.",
    ctaLabel: "Shop New Arrivals",
    href: "/shop?sort=newest",
  },
  hero_second: {
    badge: "Hero Second",
    title: "Explore Proud Nepal Deals",
    description:
      "Unlock current store offers on premium devices, work-from-home essentials, and accessories.",
    ctaLabel: "Explore Deals",
    href: "/promotions",
  },
  hero_third: {
    badge: "Trending Now",
    title: "Shop Trending Collections",
    description:
      "Browse crowd-favorite setups, gaming accessories, and high-demand products in one scroll.",
    ctaLabel: "Shop Trending",
    href: "/shop?sort=popular",
  },
  hero_fourth: {
    badge: "Limited-Time",
    title: "Discover Popular Picks",
    description:
      "Move fast on limited bundles and value-led combinations built for shoppers comparing options.",
    ctaLabel: "View Collection",
    href: "/promotions",
  },
  "build-user-pc": {
    badge: "Build My PC",
    title: "Customize Your Next PC Setup",
    description:
      "Choose parts, compare performance, and build a workstation or gaming rig with expert guidance.",
    ctaLabel: "Build Your PC",
    href: "/build-my-pc",
  },
};

const defaultContent = {
  badge: "Featured Promotion",
  title: "Shop premium electronics with confidence",
  description:
    "Explore the latest arrivals, strong offers, and trusted product categories from the homepage.",
  ctaLabel: "Shop Now",
  href: "/shop",
};

export default function HeroBanners({ banners, className }: HeroBannersProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
        setIsAnimating(false);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const goToSlide = (index: number) => {
    if (index === currentIndex || isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsAnimating(false);
    }, 500);
  };

  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
      setIsAnimating(false);
    }, 500);
  };

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
      setIsAnimating(false);
    }, 500);
  };

  if (!banners.length) return null;

  return (
    <section className={`w-full ${className ?? ""}`} aria-label="Homepage hero banner carousel">
      <div className="relative h-full overflow-hidden rounded-[30px] border border-slate-200 bg-slate-950 shadow-[0_28px_90px_rgba(15,23,42,0.16)]">
        <div className="relative h-full min-h-[320px]">
          {banners.map((banner, index) => {
            const content = heroContent[banner.placement] ?? defaultContent;

            return (
              <div
                key={banner._id}
                className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                  index === currentIndex ? "opacity-100 scale-100" : "opacity-0 scale-105"
                }`}
                aria-hidden={index !== currentIndex}
              >
                <Image
                  src={banner.imageUrl}
                  alt={content.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  quality={90}
                  sizes="(max-width: 1024px) 100vw, 1280px"
                />

                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/88 via-slate-950/38 to-red-950/28" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_24%)]" />

                <div className="relative flex h-full items-end p-6 sm:p-8 lg:p-10">
                  <div
                    className={`max-w-2xl transition-all duration-700 delay-150 ${
                      index === currentIndex
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0"
                    }`}
                  >
                    <span className="inline-flex rounded-full border border-white/20 bg-white/12 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white backdrop-blur-sm">
                      {content.badge}
                    </span>
                    <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                      {content.title}
                    </h2>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-slate-200 sm:text-base">
                      {content.description}
                    </p>

                    <Link
                      href={content.href}
                      className="group mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-lg transition duration-300 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                    >
                      <span>{content.ctaLabel}</span>
                      <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {banners.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              disabled={isAnimating}
              className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-lg transition duration-300 hover:scale-105 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed sm:left-5"
              aria-label="Previous banner"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={nextSlide}
              disabled={isAnimating}
              className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-lg transition duration-300 hover:scale-105 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed sm:right-5"
              aria-label="Next banner"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
              {banners.map((banner, index) => (
                <button
                  key={banner._id}
                  onClick={() => goToSlide(index)}
                  disabled={isAnimating}
                  className={`rounded-full transition-all duration-500 disabled:cursor-not-allowed ${
                    index === currentIndex
                      ? "h-2.5 w-10 bg-white shadow-md"
                      : "h-2.5 w-2.5 bg-white/55 hover:bg-white/80"
                  }`}
                  aria-label={`Go to banner ${index + 1}`}
                  aria-current={index === currentIndex ? "true" : "false"}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
