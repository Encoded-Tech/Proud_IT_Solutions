import React from "react";




import ListCategories from "@/components/server/ListCategories";

import HomeProducts from "@/components/server/ListHomeProducts";

import ListProducts from "@/components/server/ListProducts";

const page = () => {
  return (
    <div className="max-w-7xl xl:mx-auto mx-4 my-10 md:space-y-12 space-y-8">
      <h2 className="font-medium text-lighttext">
        Home / <span className="text-black "> Shop</span>
      </h2>
<ListCategories page="shop" />
     <ListProducts />
     <HomeProducts showHotDeals={true} showNewArrivals={false} showBestSellers={false} />
    </div>
  );
};

export default page;
