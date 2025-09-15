"use client";
import React, { useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ProductMock } from "@/data/product-mock";
import { Icon } from "@iconify/react/dist/iconify.js";
import PageHeader from "@/components/text/page-header";
import ProductCard from "@/components/card/product-card";

const HotDeals = () => {
  const sliderRef = useRef<Slider | null>(null);
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
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 900,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          initialSlide: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const handleNext = () => {
    sliderRef.current?.slickNext();
  };

  const handlePrev = () => {
    sliderRef.current?.slickPrev();
  };

  return (
    <main className="grid grid-cols-3 items-center gap-x-8">
      <video loop autoPlay muted className="w-full h-full object-fill">
        <source
          src="https://cdn.pixabay.com/video/2018/11/14/19321-300877558_large.mp4"
          type="video/mp4"
        ></source>
      </video>
      <div className="col-span-2">
        <PageHeader title="Our Hot Deals" />
        {ProductMock.length > 3 ? (
          <div className="relative">
            <Slider {...settings} ref={sliderRef} className="my-10">
              {ProductMock.map((item, index) => (
                <div key={index} className="px-2">
                  <ProductCard products={item} />
                </div>
              ))}
            </Slider>

            <div className="absolute top-1/2 -translate-y-1/2 -left-2">
              <button
                onClick={handlePrev}
                className="cursor-pointer rounded-full  bg-primary shadow-sm  hover:bg-primarymain/80 text-white border-zinc-300 p-3 hover:scale-110 ease-in-out duration-300   text-lg"
              >
                <Icon icon="iconamoon:arrow-left-2-light" />
              </button>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 -right-2">
              <button
                onClick={handleNext}
                className="cursor-pointer rounded-full  bg-primary shadow-sm  hover:bg-primarymain/80 text-white border-zinc-300 p-3 hover:scale-110 ease-in-out duration-300   text-lg"
              >
                <Icon icon="iconamoon:arrow-right-2-light" />
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-x-4 my-10">
            {ProductMock.map((item, index) => (
              <div key={index} className="px-2">
                <ProductCard products={item} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default HotDeals;
