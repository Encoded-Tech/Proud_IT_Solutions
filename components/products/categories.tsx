"use client";
import React, { useRef } from "react";
import PageHeader from "../text/page-header";
import Image from "next/image";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import Link from "next/link";
import { Icon } from "@iconify/react/dist/iconify.js";

const Categories = () => {
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

  const handleNext = () => {
    sliderRef.current?.slickNext();
  };

  const handlePrev = () => {
    sliderRef.current?.slickPrev();
  };
  return (
    <div className="relative">
      <PageHeader title="Popular Categories" />
      {categorydata.length > 5 ? (
        <section>
          <Slider {...settings} ref={sliderRef} className="my-10">
            {categorydata.map((item, index) => (
              <div key={index} className="px-2">
                <Link href="/">
                  <figure className="overflow-hidden rounded-md cursor-pointer">
                    <Image
                      src={item.img}
                      alt="hero"
                      width={1000}
                      height={500}
                      priority
                      className="lg:h-46   hover:scale-110 ease-in-out duration-300"
                    />
                  </figure>

                  <div className="flex flex-col justify-center items-center my-2">
                    <h2 className="font-medium text-md">{item.title}</h2>
                    <p className="text-zinc-500 font-medium text-sm">
                      {item.num} Products
                    </p>
                  </div>
                </Link>
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
        </section>
      ) : (
        <section className="grid grid-cols-5 my-10">
          {categorydata.map((item, index) => (
            <div key={index} className="px-2">
              <Link href="/">
                <figure className="overflow-hidden rounded-md cursor-pointer">
                  <Image
                    src={item.img}
                    alt="hero"
                    width={1000}
                    height={500}
                    priority
                    className="h-46  hover:scale-110 ease-in-out duration-300"
                  />
                </figure>

                <div className="flex flex-col justify-center items-center my-2">
                  <h2 className="font-medium text-lg">{item.title}</h2>
                  <p className="text-zinc-500 font-medium">
                    {item.num} Products
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

export default Categories;

const categorydata = [
  {
    title: "Keyboards",
    num: 23,
    img: "/category/ct1.jpg",
  },
  {
    title: "Headsets",
    num: 23,
    img: "/category/ct2.jpg",
  },
  {
    title: "Mouse",
    num: 23,
    img: "/category/ct3.jpg",
  },
  {
    title: "Gamepads",
    num: 23,
    img: "/category/ct4.jpg",
  },
  {
    title: "Keyboards",
    num: 23,
    img: "/category/ct5.jpg",
  },
  {
    title: "Mat",
    num: 23,
    img: "/category/ct1.jpg",
  },
  {
    title: "HeadSets",
    num: 23,
    img: "/category/ct2.jpg",
  },
  {
    title: "Keyboards",
    num: 23,
    img: "/category/ct3.jpg",
  },
];
