"use client";

import React, { useRef } from "react";
import PageHeader from "../text/page-header";
import Image from "next/image";
import Slider from "react-slick";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { CategoryType } from "@/types/product";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function SliderClient({
  categories,
}: {
  categories: CategoryType[];
}) {
  const sliderRef = useRef<Slider | null>(null);

  const settings = {
    infinite: true,
    speed: 800,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    centerMode: true,
    dots: false,
    arrows: false,
    centerPadding: "0px",
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 5,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 470,
        settings: {
          slidesToShow: 2,
        },
      },
    ],
  };

  const handleNext = () => sliderRef.current?.slickNext();
  const handlePrev = () => sliderRef.current?.slickPrev();

  return (
    <div className="relative">
      <PageHeader title="Popular Categories" />

      {categories.length > 5 ? (
        <section className="relative">
          <Slider ref={sliderRef} {...settings} className="my-10">
            {categories.map((item, index) => (
              <div key={index} className="px-2">
                <Link href="/shop">
                  {/* IMAGE + BADGE */}
                  <figure className="relative overflow-hidden rounded-md cursor-pointer group">
              {item.productCount > 0 && (
  <span
    aria-label={`${item.productCount} ${
      item.productCount === 1 ? "Product" : "Products"
    }`}
    className="absolute top-2 right-2 z-10 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white shadow-md ring-1 ring-black/5"
  >
    {item.productCount}{" "}
    {item.productCount === 1 ? "Product" : "Products"}
  </span>
)}


                    <Image
                      src={item.categoryImage}
                      alt={item.categoryName}
                      width={1000}
                      height={500}
                      loading="lazy"
                      className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </figure>

                  {/* CATEGORY NAME */}
                  <div className="flex justify-center mt-3">
                    <h2 className="font-medium text-md text-center line-clamp-2 min-h-[3rem]">
                      {item.categoryName}
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
          {categories.map((item, index) => (
            <Link key={index} href="/shop">
              <div className="px-2">
                <figure className="relative overflow-hidden rounded-md cursor-pointer group">
                  {item.productCount > 0 && (
                    <span className="absolute top-2 right-2 z-10 rounded-full bg-black/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                      {item.productCount > 99
                        ? "99+"
                        : item.productCount}
                    </span>
                  )}

                  <Image
                    src={item.categoryImage}
                    alt={item.categoryName}
                    width={1000}
                    height={500}
                    loading="lazy"
                    className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </figure>

                <h2 className="mt-3 text-center font-medium text-md line-clamp-2 min-h-[3rem]">
                  {item.categoryName}
                </h2>
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
