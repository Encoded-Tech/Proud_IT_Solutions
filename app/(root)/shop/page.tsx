import React from "react";




import ListCategories from "@/components/server/ListCategories";

import HomeProducts from "@/components/server/ListHomeProducts";

import ListProducts from "@/components/server/ListProducts";
import { APP_NAME } from "@/config/env";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: `%s | ${APP_NAME}`,
    default: `Shop | ${APP_NAME}`,
  },
  description: `Explore a wide range of products and build your perfect PC with ${APP_NAME}. Find the best deals, hot products, and new arrivals.`,
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: `Shop | ${APP_NAME}`,
    description: `Explore a wide range of products and build your perfect PC with ${APP_NAME}.`,
    images: [],
  },
  twitter: {
    card: "summary_large_image",
    title: `Shop | ${APP_NAME}`,
    description: `Explore a wide range of products and build your perfect PC with ${APP_NAME}.`,
    images: [], // optional
  },
};

const page = () => {
  return (
    <main className="max-w-7xl xl:mx-auto mx-4 my-10 md:space-y-12 space-y-8">
      <h2 className="font-medium text-lighttext">
        Home / <span className="text-black "> Shop</span>
      </h2>
<ListCategories page="shop" />
     <ListProducts />
     <HomeProducts showHotDeals={true} showNewArrivals={false} showBestSellers={false} />
    </main>
  );
};

export default page;
