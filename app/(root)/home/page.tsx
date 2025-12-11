import React from "react";
import Hero from "./hero";

import BestSellers from "@/components/products/best-sellers";
import Article from "./article";
import Sale from "@/components/products/sale";
import HotDeals from "./hot-deals";

import ListCategories from "@/components/server/ListCategories";

const HomeMain = () => {
  return (
    <>
      <Hero />
      <div className="max-w-7xl xl:mx-auto mx-4 my-20 space-y-20">
       <ListCategories page="home" />
        <BestSellers />
        <Sale />
        <HotDeals />
        <Article />
      </div>
    </>
  );
};

export default HomeMain;
