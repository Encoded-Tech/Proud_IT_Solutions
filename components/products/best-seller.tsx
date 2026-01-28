"use client";
import React, { useRef } from "react";
import PageHeader from "../text/page-header";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import ProductCard from "../card/product-card";
import { Icon } from "@iconify/react/dist/iconify.js";

import { productType } from "@/types/product";
import { AnyMediaItem, MediaPlacement } from "@/types/media";

interface Props {
  bestSellers: productType[];
  title: string;
  media: AnyMediaItem[];
}

const placements: MediaPlacement[] = [
  "best_seller_video_1",
  "best_seller_video_2",
];

const fallbackVideos = [
  "https://cdn.pixabay.com/video/2023/06/30/169476-841382886_large.mp4",
  "https://cdn.pixabay.com/video/2017/06/01/9486-220088143_large.mp4",
];

const BestSellers = ({ bestSellers, title, media }: Props) => {
  const sliderRef = useRef<Slider | null>(null);

  const videoItems = placements.map((placement, idx) => {
    const mediaVideo = media.find(
      (m) => m.placement === placement && m.type === "video"
    );
    return mediaVideo ?? ({ videoUrl: fallbackVideos[idx] } as AnyMediaItem);
  });

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
      { breakpoint: 1200, settings: { slidesToShow: 3 } },
      { breakpoint: 1024, settings: { slidesToShow: 3  } },
      { breakpoint: 480, settings: { slidesToShow: 2 } },
    ],
  };

  const handleNext = () => sliderRef.current?.slickNext();
  const handlePrev = () => sliderRef.current?.slickPrev();

  return (
    <main className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:items-center lg:gap-x-8">
      {/* ================= VIDEOS ================= */}
      <div className="flex flex-col gap-6">
        {videoItems.map((video, index) => (
          <div
            key={index}
            className="w-full overflow-hidden rounded-lg shadow-md aspect-video"
          >
            <video
              loop
              autoPlay
              muted
              controls
              playsInline
              className="h-full w-full object-cover"
            >
              <source src={video.videoUrl} type="video/mp4" />
            </video>
          </div>
        ))}
      </div>

      {/* ================= BEST SELLERS ================= */}
      <div className="  lg:col-span-2">
        <PageHeader title={title} />

        {bestSellers.length >= 2 ? (
          <div className="relative">
            <Slider {...settings} ref={sliderRef} className="my-10">
              {bestSellers.map((item) => (
                <div key={item.id} className="px-2">
                  <ProductCard product={item} label="Best Seller" />
                </div>
              ))}
            </Slider>

            {/* ARROWS (desktop only visually) */}
            <div className="absolute top-1/2 -translate-y-1/2 -left-2 hidden md:block">
              <button
                onClick={handlePrev}
                className="rounded-full bg-primary/80 p-3 text-white hover:scale-110"
              >
                <Icon icon="iconamoon:arrow-left-2-light" />
              </button>
            </div>

            <div className="absolute top-1/2 -translate-y-1/2 -right-2 hidden md:block">
              <button
                onClick={handleNext}
                className="rounded-full bg-primary/80 p-3 text-white hover:scale-110"
              >
                <Icon icon="iconamoon:arrow-right-2-light" />
              </button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-x-8 my-10">
            {bestSellers.map((item) => (
              <ProductCard key={item.id} product={item} label="Best Seller" />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default BestSellers;
