"use client";

import React, { useRef } from "react";
import PageHeader from "../text/page-header";
import Image from "@/components/ui/optimized-image";
import Slider from "react-slick";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { CategoryType } from "@/types/product";
import { buildPublicCategoryCardOptions } from "@/lib/helpers/categorySelection";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function SliderClient({
  categories,
}: {
  categories: CategoryType[];
}) {
  const sliderRef = useRef<Slider | null>(null);
  const categoryCards = buildPublicCategoryCardOptions(categories);

  if (categoryCards.length === 0) return null;

  const settings = {
    infinite: categoryCards.length > 5,
    speed: 800,
    slidesToShow: Math.min(categoryCards.length, 5),
    slidesToScroll: 1,
    autoplay: categoryCards.length > 5,
    autoplaySpeed: 2500,
    centerMode: true,
    dots: false,
    arrows: false,
    centerPadding: "0px",
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: Math.min(categoryCards.length, 5),
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(categoryCards.length, 4),
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(categoryCards.length, 3),
        },
      },
      {
        breakpoint: 470,
        settings: {
          slidesToShow: Math.min(categoryCards.length, 2),
        },
      },
    ],
  };

  const handleNext = () => sliderRef.current?.slickNext();
  const handlePrev = () => sliderRef.current?.slickPrev();

  return (
    <div className="relative">
      <PageHeader title="Popular Categories" />

      {categoryCards.length > 5 ? (
        <section className="relative">
          <Slider ref={sliderRef} {...settings} className="my-10">
            {categoryCards.map((item) => (
              <div key={item.id} className="px-2">
           <Link href={item.href}>

                  {/* IMAGE + BADGE */}
                  <figure className="relative overflow-hidden rounded-md cursor-pointer group">
              {item.count > 0 && (
  <span
    aria-label={`${item.count} ${
      item.count === 1 ? "Product" : "Products"
    }`}
    className="absolute top-2 right-2 z-10 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white shadow-md ring-1 ring-black/5"
  >
    {item.count}{" "}
    {item.count === 1 ? "Product" : "Products"}
  </span>
)}


                    <Image
                      src={item.image}
                      alt={item.label}
                      width={1000}
                      height={500}
                      loading="lazy"
                      className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </figure>

                  {/* CATEGORY NAME */}
                  <div className="flex justify-center mt-3">
                    <h2 className="font-medium text-md text-center line-clamp-2 min-h-[3rem]">
                      {item.label}
                    </h2>
                  </div>
                </Link>
              </div>
            ))}
          </Slider>

          {/* CUSTOM ARROWS */}
          <button
            aria-label="Previous categories"
            onClick={handlePrev}
            className="absolute top-1/2 -left-2 -translate-y-1/2 rounded-full bg-primary/80 p-3 text-white shadow-sm transition hover:scale-110 hover:bg-primarymain/80"
          >
            <Icon icon="iconamoon:arrow-left-2-light" />
          </button>

          <button
            aria-label="Next categories"
            onClick={handleNext}
            className="absolute top-1/2 -right-2 -translate-y-1/2 rounded-full bg-primary/80 p-3 text-white shadow-sm transition hover:scale-110 hover:bg-primarymain/80"
          >
            <Icon icon="iconamoon:arrow-right-2-light" />
          </button>
        </section>
      ) : (
        /* FALLBACK GRID */
        <section className="grid grid-cols-2 gap-4 my-10 sm:grid-cols-3 md:grid-cols-5">
          {categoryCards.map((item) => (
        <div key={item.id} className="px-2">
              <Link  href={item.href}>

              
                <figure className="relative overflow-hidden rounded-md cursor-pointer group">
                  {item.count > 0 && (
                    <span className="absolute top-2 right-2 z-10 rounded-full bg-black/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                      {item.count > 99
                        ? "99+"
                        : item.count}
                    </span>
                  )}

                  <Image
                    src={item.image}
                    alt={item.label}
                    width={1000}
                    height={500}
                    loading="lazy"
                    className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </figure>

                <h2 className="mt-3 text-center font-medium text-md line-clamp-2 min-h-[3rem]">
                  {item.label}
                </h2>
             
            </Link>
        </div>
          ))}
        </section>
      )}
    </div>
  );
}
