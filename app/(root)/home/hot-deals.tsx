"use client";
import React, { useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { Icon } from "@iconify/react/dist/iconify.js";
import PageHeader from "@/components/text/page-header";
import ProductCard from "@/components/card/product-card";
import { productType } from "@/types/product";
import { AnyMediaItem, MediaPlacement } from "@/types/media";

type Props = {
  hotDeals: productType[];
  title: string;
  media: AnyMediaItem[];
};

const placement: MediaPlacement = "hot_deals_video";
const fallbackVideo =
  "https://cdn.pixabay.com/video/2018/11/14/19321-300877558_large.mp4";

const HotDeals = ({ hotDeals, title, media }: Props) => {
  const sliderRef = useRef<Slider | null>(null);

  const hotDealVideo =
    media.find((m) => m.placement === placement && m.type === "video")
      ?.videoUrl || fallbackVideo;

  const settings = {
    infinite: true,
    speed: 800,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    dots: false,
    arrows: false,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 3, dots: true } },
      { breakpoint: 1024, settings: { slidesToShow: 3, dots: true } },
      { breakpoint: 900, settings: { slidesToShow: 3 } },
      { breakpoint: 480, settings: { slidesToShow: 2 } },
    ],
  };

  const handleNext = () => sliderRef.current?.slickNext();
  const handlePrev = () => sliderRef.current?.slickPrev();

  return (
 <main className="grid grid-cols-1 lg:grid-cols-3 items-start lg:items-stretch gap-y-8 lg:gap-x-8">

      {/* ================= VIDEO ================= */}
   {/* ================= VIDEO ================= */}
<div className="w-full mb-6 lg:mb-0">
  <div className="w-full aspect-video lg:aspect-auto lg:h-full overflow-hidden rounded-lg shadow-md">
    <video
      loop
      autoPlay
      muted
      controls
      playsInline
      className="w-full h-full object-cover"
    >
      <source src={hotDealVideo} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  </div>
</div>


      {/* ================= SLIDER ================= */}
      <div className="w-full lg:col-span-2">
        <PageHeader title={title} />

        {hotDeals.length > 2 ? (
          <div className="relative">
            <Slider {...settings} ref={sliderRef} className="my-8">
              {hotDeals.map((item) => (
                <div key={item.id} className="px-2">
                  <ProductCard product={item} label="Hot Deal" />
                </div>
              ))}
            </Slider>

            {/* Arrows (desktop only) */}
            <div className="absolute hidden md:block top-1/2 -translate-y-1/2 -left-2">
              <button
                onClick={handlePrev}
                className="rounded-full bg-primary/80 p-3 text-white hover:scale-110 transition"
              >
                <Icon icon="iconamoon:arrow-left-2-light" />
              </button>
            </div>

            <div className="absolute hidden md:block top-1/2 -translate-y-1/2 -right-2">
              <button
                onClick={handleNext}
                className="rounded-full bg-primary/80 p-3 text-white hover:scale-110 transition"
              >
                <Icon icon="iconamoon:arrow-right-2-light" />
              </button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-x-8 my-8">
            {hotDeals.map((item) => (
              <ProductCard key={item.id} product={item} label="Hot Deal" />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default HotDeals;
