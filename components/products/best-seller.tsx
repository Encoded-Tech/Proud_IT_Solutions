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

// Fallback videos in order
const fallbackVideos = [
  "https://cdn.pixabay.com/video/2023/06/30/169476-841382886_large.mp4",
  "https://cdn.pixabay.com/video/2017/06/01/9486-220088143_large.mp4",
];

const BestSellers = ({ bestSellers, title, media }: Props) => {
  const sliderRef = useRef<Slider | null>(null);

  // Map each placement to either the media video or fallback
  const videoItems = placements.map((placement, idx) => {
    const mediaVideo = media.find((m) => m.placement === placement && m.type === "video");
    if (mediaVideo) return mediaVideo;
    // fallback video if not set
    return { videoUrl: fallbackVideos[idx] } as AnyMediaItem;
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
      { breakpoint: 1200, settings: { slidesToShow: 3, slidesToScroll: 1, infinite: true, dots: true } },
      { breakpoint: 1024, settings: { slidesToShow: 2, slidesToScroll: 1, infinite: true, dots: true } },
      { breakpoint: 900, settings: { slidesToShow: 2, slidesToScroll: 1, initialSlide: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
  };

  const handleNext = () => sliderRef.current?.slickNext();
  const handlePrev = () => sliderRef.current?.slickPrev();

  return (
    <main className="grid grid-cols-3 items-center gap-x-8">
      {/* Videos Column */}
      <div className="flex flex-col gap-6">
        {videoItems.map((video, index) => (
          <video
            key={index}
            loop
            autoPlay
            muted
            controls
            className="w-full h-1/2 object-cover rounded-lg shadow-md"
          >
            <source src={video.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ))}
      </div>

      {/* Best Sellers Slider */}
      <div className="col-span-2">
        <PageHeader title={title} />
        {bestSellers.length > 3 ? (
          <div className="relative">
            <Slider {...settings} ref={sliderRef} className="my-10">
              {bestSellers.map((item) => (
                <div key={item.id} className="px-2">
                  <ProductCard product={item} label="Best Seller" />
                </div>
              ))}
            </Slider>

            {/* Slider Arrows */}
            <div className="absolute top-1/2 -translate-y-1/2 -left-2">
              <button
                onClick={handlePrev}
                className="cursor-pointer rounded-full bg-primary/80 shadow-sm hover:bg-primarymain/80 text-white border-zinc-300 p-3 hover:scale-110 ease-in-out duration-300 text-lg"
              >
                <Icon icon="iconamoon:arrow-left-2-light" />
              </button>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 -right-2">
              <button
                onClick={handleNext}
                className="cursor-pointer rounded-full bg-primary/80 shadow-sm hover:bg-primarymain/80 text-white border-zinc-300 p-3 hover:scale-110 ease-in-out duration-300 text-lg"
              >
                <Icon icon="iconamoon:arrow-right-2-light" />
              </button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-x-8 my-10">
            {bestSellers.map((item) => (
              <div key={item.id} className="px-2">
                <ProductCard product={item} label="Best Seller" />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default BestSellers;
