"use client";
import React from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import Image from "next/image";

const Hero = () => {
  const settings = {
    dots: false,
    fade: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3500,
    waitForAnimate: false,
    pauseOnHover: false,
    arrows: false,
  };
  return (
    <>
      <Slider {...settings}>
        {slideimages.map((item, index) => (
          <div key={index}>
            <figure className="">
              <Image
                src={item.img}
                alt="hero"
                width={1000}
                height={500}
                priority
                className="h-screen w-full object-cover "
              />
            </figure>
          </div>
        ))}
      </Slider>
    </>
  );
};
const slideimages = [
  {
    img: "/banner/banner.png",
  },
  {
    img: "/banner/banner.png",
  },
];
export default Hero;
