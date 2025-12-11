"use client";
import React, { useRef } from "react";
import Image from "next/image";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import Link from "next/link";
import { CategoryType } from "@/types/product";

const ShopCategories = ({ categories }: { categories: CategoryType[] }) => {
  const sliderRef = useRef<Slider | null>(null);

  const settings = {
    infinite: true,
    speed: 800,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    centerMode: true,
    dots: true,
    arrows: false,
    centerPadding: "0px",
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 3,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 2,
          initialSlide: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 2,
          initialSlide: 2,
        },
      },
      {
        breakpoint: 470,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="relative  md:p-6 p-4 rounded-md bg-primary/20">
      {categories.length > 5 ? (
        <section>
          <Slider {...settings} ref={sliderRef} className="my-10">
            {categories.map((item, index) => (
              <div key={index} className="px-2">
                <Link href="/shop">
                  <figure className="overflow-hidden rounded-md cursor-pointer">
                    <Image
                      src={item.categoryImage}
                      alt="hero"
                      width={1000}
                      height={500}
                      priority
                      className="lg:h-46  hover:scale-110 ease-in-out duration-300"
                    />
                  </figure>

                  <div className="flex flex-col justify-center items-center my-2">
                    <h2 className="font-medium text-md">{item.categoryName}</h2>
                    <p className="text-zinc-500 font-medium text-sm">
                      {item.productCount} Products
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </Slider>
        </section>
      ) : (
        <section className="grid grid-cols-5 my-10">
          {categories.map((item, index) => (
            <div key={index} className="px-2">
              <Link href="/shop">
                <figure className="overflow-hidden rounded-md cursor-pointer">
                  <Image
                    src={item.categoryImage}
                    alt="hero"
                    width={1000}
                    height={500}
                    priority
                    className="lg:h-46  hover:scale-110 ease-in-out duration-300"
                  />
                </figure>

                <div className="flex flex-col justify-center items-center my-2">
                  <h2 className="font-medium text-md">{item.categoryName}</h2>
                  <p className="text-zinc-500 font-medium text-sm">
                    {item.productCount} Products
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

export default ShopCategories;

