"use client";
import { ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

interface HeroBannersProps {
  banners: {
    _id: string;
    imageUrl: string;
    placement: string;
  }[];
}

const HeroBanners = ({ banners }: HeroBannersProps) => {
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
    <section className="w-full">
      <div className="relative w-full h-[280px] sm:h-[360px] md:h-[440px] lg:h-[520px] xl:h-[580px] rounded-xl overflow-hidden shadow-2xl">
        {/* Banner Slides */}
        <div className="relative w-full h-full">
          {banners.map((banner, index) => (
            <div
              key={banner._id}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                index === currentIndex
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-105"
              }`}
            >
              <Image
                src={banner.imageUrl}
                alt="Promotional banner"
                fill
                className="object-cover"
                priority={index === 0}
                quality={90}
              />

              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

{banners.map((banner, index) => {
  const isBuildPc = banner.placement === "build-user-pc";

  return (
    <div
      key={banner._id}
      className={`absolute inset-0 transition-all duration-700 ease-in-out ${
        index === currentIndex
          ? "opacity-100 scale-100"
          : "opacity-0 scale-105"
      }`}
    >
      <Image
        src={banner.imageUrl}
        
        alt="Promotional banner"
        fill
        className="object-cover"
        priority={index === 0}
        quality={90}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

      {/* CTA Button */}
      <div className="absolute top-6 right-6 sm:top-8 sm:right-8 z-20">
        <div
          className={`transition-all duration-700 delay-200 ${
            index === currentIndex
              ? "translate-y-0 opacity-100"
              : "-translate-y-6 opacity-0"
          }`}
        >
          <Link
            href={isBuildPc ? "/build-my-pc" : "/shop"}
            className="group inline-flex items-center gap-2.5 px-6 py-3 sm:px-7 sm:py-3.5
                       bg-white/90 backdrop-blur-md text-slate-900
                       font-semibold text-sm sm:text-base rounded-full
                       hover:bg-white transition-all duration-300
                       shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <span>{isBuildPc ? "Build Your PC" : "Shop Now"}</span>
            <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
})}




            </div>
          ))}
        </div>

        {/* Navigation Controls - Only show if multiple banners */}
        {banners.length > 1 && (
          <>
            {/* Previous Arrow */}
            <button
              onClick={prevSlide}
              disabled={isAnimating}
              className="absolute left-3 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full flex items-center justify-center transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl z-20"
              aria-label="Previous banner"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900 group-hover:-translate-x-0.5 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* Next Arrow */}
            <button
              onClick={nextSlide}
              disabled={isAnimating}
              className="absolute right-3 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full flex items-center justify-center transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl z-20"
              aria-label="Next banner"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900 group-hover:translate-x-0.5 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            {/* Pagination Dots */}
            <div className="absolute bottom-4 sm:bottom-5 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  disabled={isAnimating}
                  className={`transition-all duration-500 rounded-full disabled:cursor-not-allowed ${
                    index === currentIndex
                      ? "w-8 sm:w-10 h-2 sm:h-2.5 bg-white shadow-md"
                      : "w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/50 hover:bg-white/75"
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
};

export default HeroBanners;