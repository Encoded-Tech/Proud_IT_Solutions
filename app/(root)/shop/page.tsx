import React from "react";
import ShopCategories from "./shop-category";
import ShopGrid from "./shop-grid";
import HotDeals from "../home/hot-deals";

const page = () => {
  return (
    <div className="max-w-7xl xl:mx-auto mx-4 my-10 md:space-y-12 space-y-8">
      <h2 className="font-medium text-lighttext">
        Home / <span className="text-black "> Shop</span>
      </h2>
      <ShopCategories />
      <ShopGrid />
      <HotDeals />
    </div>
  );
};

export default page;
