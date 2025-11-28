"use client";
import { cn } from "@/lib/utils";
import { MediaType } from "@/types/product";
import Image from "next/image";
import React, { useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const ProductImages = ({
  media,
  featureImage,
}: {
  media: MediaType[];
  featureImage: string;
}) => {
  const [current, setCurrent] = useState(0);

  const mediaWithFeature = [{ mediaUrl: featureImage }, ...media];

  const settings = {
    infinite: true,
    speed: 800,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    centerMode: true,
    dots: false,
    arrows: false,
    centerPadding: "0px",
    vertical: true,
    verticalSwiping: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 3,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 2,
          initialSlide: 2,
          vertical: false,
          verticalSwiping: false,
        },
      },
      {
        breakpoint: 420,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          vertical: false,
          verticalSwiping: false,
          centerPadding: "0px",
          centerMode: true,
        },
      },
    ],
  };

  return (
    <div className="flex flex-col md:flex-row w-full gap-2">
      <div className="w-72 md:w-1/2">
        {mediaWithFeature.length > 3 ? (
          <Slider {...settings}>
            {mediaWithFeature.map((item, index) => (
              <div
                key={index}
                onClick={() => setCurrent(index)}
                className={cn(
                  "cursor-pointer p-1",
                  current === index && "border border-secondarymain rounded-lg"
                )}
              >
                <Image
                  src={item.mediaUrl}
                  alt="product-image"
                  height={100}
                  width={100}
                  className="object-cover w-full rounded-md max-h-[7em]"
                />
              </div>
            ))}
          </Slider>
        ) : (
          <div className="flex md:flex-col flex-row gap-2">
            {mediaWithFeature.map((item, index) => (
              <div
                key={index}
                onClick={() => setCurrent(index)}
                className={cn(
                  "cursor-pointer p-1",
                  current === index && "border border-secondarymain rounded-lg"
                )}
              >
                <Image
                  src={item.mediaUrl}
                  alt="product-image"
                  height={100}
                  width={100}
                  className="object-cover md:w-full rounded-md h-[5em]"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="order-1">
        <Image
          src={mediaWithFeature[current]?.mediaUrl}
          alt="product image"
          height={1000}
          width={1000}
          className="lg:h-[30em] h-[20em] sm:object-contain rounded-md object-center"
        />
      </div>
    </div>
  );
};

export default ProductImages;
