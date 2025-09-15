"use client";
import { ProductMock } from "@/data/product-mock";
import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useRef, useState } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider, { Settings } from "react-slick";
import Image from "next/image";

interface PageProps {
  params: {
    slug: string;
  };
}

const ProductPage = ({ params }: PageProps) => {
  const productItem = ProductMock.find((prod) => prod.slug === params.slug);

  const sliderRef = useRef<Slider>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const settings: Settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    fade: false,
    arrows: false,
    autoplay: true,
    pauseOnHover: false,
    autoplaySpeed: 3000,
    beforeChange: (oldIndex, newIndex) => setCurrentSlide(newIndex),
  };

  const goToSlide = (index: number) => {
    if (sliderRef.current) {
      sliderRef.current.slickGoTo(index);
    }
  };

  if (!productItem) {
    return <div className="text-center mt-20">Product not found</div>;
  }
  return (
    <main className="max-w-7xl mx-auto my-14">
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Slider {...settings} ref={sliderRef}>
            {cards.map((item, index) => (
              <div key={index} className="">
                <figure>
                  <Image
                    src={item.img}
                    alt="card"
                    width={1000}
                    height={1000}
                    className="h-[30em] bg-cover object-cover w-full brightness-75"
                  />
                </figure>
              </div>
            ))}
          </Slider>
          <div className="flex items-center gap-2">
            {cards.map((item, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`relative  overflow-hidden transition-all duration-300 ${
                  currentSlide === index
                    ? "ring-2 ring-white "
                    : "opacity-70"
                }`}
              >
                <Image
                  src={item.img}
                  alt={`Thumbnail ${item.title}`}
                  objectFit="cover"
                  height={1000}
                  width={1000}
                  className="brightness-75 h-[5em]"
                />
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="font-bold text-2xl">{productItem.name}</h2>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum,
            provident voluptatem minus sint officiis quod maiores. Ipsa cum
            provident assumenda labore atque cumque velit culpa eum in.
            Blanditiis, voluptatem! Ratione.
          </p>
          <div className="flex items-center gap-2">
            <p className="text-lighttext text-2xl">Rs.{productItem.price}</p>
            <del className="text-lighttext">Rs.{productItem.price}</del>
          </div>

          <div className="flex gap-2">
            <button className="px-6 py-2 rounded-md bg-primary hover:bg-primary/90 cursor-pointer ease-in-out duration-100 text-white w-full flex items-center gap-2 justify-center">
              <Icon icon="mynaui:cart-solid" width="24" height="24" />
              Add to Cart
            </button>
            <button className="px-6 py-2 rounded-md bg-green-500 hover:bg-green-500/90 cursor-pointer ease-in-out duration-100 text-white w-full flex items-center gap-2 justify-center">
              <Icon icon="mynaui:cart-solid" width="24" height="24" />
              Buy Now
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ProductPage;

const cards = [
  {
    title: "Langtang Base Camp Trek",
    img: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=2076&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Annapurna Base Camp Trek",
    img: "https://images.unsplash.com/photo-1584395631446-e41b0fc3f68d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Mardi Base Camp Trek",
    img: "https://images.unsplash.com/photo-1529556253689-cf147e0fb3d9?q=80&w=1931&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Everest Base Camp Trek",
    img: "https://images.unsplash.com/photo-1551932733-22b68c904545?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Dhaulagiri Base Camp Trek",
    img: "https://images.unsplash.com/photo-1592731057019-57ed336948ed?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];
