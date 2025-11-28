import React from "react";
import Hero from "./hero";
import Categories from "@/components/products/categories";
import BestSellers from "@/components/products/best-sellers";
import Article from "./article";
import Sale from "@/components/products/sale";
import HotDeals from "./hot-deals";

const HomeMain = () => {
  return (
    <>
      <Hero />
      <div className="max-w-7xl xl:mx-auto mx-4 my-20 space-y-20">
        <Categories />
        <BestSellers />
        <Sale />
        <HotDeals />
        <Article />
      </div>
    </>
  );
};

export default HomeMain;
