"use client";

import React, { useRef } from "react";
import Image from "@/components/ui/optimized-image";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import Link from "next/link";
import { CategoryType } from "@/types/product";
import { buildPublicCategoryCardOptions } from "@/lib/helpers/categorySelection";

const ShopCategories = ({ categories }: { categories: CategoryType[] }) => {
  const sliderRef = useRef<Slider | null>(null);
  const categoryCards = buildPublicCategoryCardOptions(categories);

  if (categoryCards.length === 0) return null;

  const settings = {
    infinite: categoryCards.length > 5,
    speed: 700,
    slidesToShow: Math.min(categoryCards.length, 5),
    slidesToScroll: 1,
    autoplay: categoryCards.length > 5,
    autoplaySpeed: 2400,
    centerMode: categoryCards.length > 5,
    dots: false,
    arrows: false,
    centerPadding: "0px",
    lazyLoad: "ondemand" as const,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: Math.min(categoryCards.length, 5),
          slidesToScroll: 2,
          infinite: categoryCards.length > 5,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(categoryCards.length, 4),
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(categoryCards.length, 3),
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 470,
        settings: {
          slidesToShow: Math.min(categoryCards.length, 2),
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white px-4 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] md:px-6">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-300 to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(248,250,252,0.95),rgba(255,255,255,0.65))]" />

      <div className="relative mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Browse Categories
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            Shop by category
          </h2>
        </div>
        <Link
          href="/shop/categories"
          className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-red-200 hover:text-red-600 sm:inline-flex"
        >
          View all
        </Link>
      </div>

      <div className="relative">
        <Slider {...settings} ref={sliderRef}>
          {categoryCards.map((item) => (
            <div key={item.id} className="px-2">
              <Link
                href={item.href}
                className="group block rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-red-200 hover:shadow-lg"
              >
                <figure className="relative aspect-[4/3] overflow-hidden rounded-lg bg-slate-100">
                  <Image
                    src={item.image}
                    alt={item.label}
                    fill
                    sizes="(max-width: 470px) 50vw, (max-width: 768px) 33vw, 20vw"
                    loading="lazy"
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                </figure>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="line-clamp-1 text-sm font-semibold text-slate-900">
                      {item.label}
                    </h3>
                    <p className="text-xs font-medium text-slate-500">
                      {item.count} Product{item.count !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-600 transition group-hover:border-red-200 group-hover:bg-red-50 group-hover:text-red-600">
                    {item.label.charAt(0).toUpperCase()}
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default ShopCategories;
