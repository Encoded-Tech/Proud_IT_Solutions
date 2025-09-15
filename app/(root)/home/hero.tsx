import Image from "next/image";
import React from "react";

const Hero = () => {
  return (
    <main className="max-w-7xl xl:mx-auto mx-4 grid grid-cols-2 items-center gap-6 my-8 ">
      <div className="col-span-1">
        <Image
          src={heroimg[0].img}
          alt="hero"
          width={1000}
          height={500}
          priority
          className="h-[50vh] w-full object-cover "
        />
      </div>
      <div className="col-span-1">
        {" "}
        <Image
          src={heroimg[1].img}
          alt="hero"
          width={1000}
          height={500}
          priority
          className="h-[40vh] w-full object-cover "
        />
      </div>
    </main>
  );
};

export default Hero;

const heroimg = [
  {
    img: "/banner/hero1.png",
  },
  {
    img: "/banner/hero2.png",
  },
];
