import React from "react";
import Hero from "./hero";
import Categories from "@/components/products/categories";

const HomeMain = () => {
  return (
    <>
      <Hero />
      <div className="max-w-7xl xl:mx-auto mx-4 my-20 space-y-20">
        <Categories />
      </div>
    </>
  );
};

export default HomeMain;
