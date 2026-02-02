import React from "react";




import ListCategories from "@/components/server/ListCategories";

import HomeProducts from "@/components/server/ListHomeProducts";

import ListProducts from "@/components/server/ListProducts";
import { Metadata } from "next";
import { APP_NAME, SERVER_PRODUCTION_URL } from "@/config/env";

export const metadata: Metadata = {
  title: {
    template: `%s | ${APP_NAME}`,
    default: `Shop Gadgets in Nepal | Laptops, PCs & Accessories | ${APP_NAME}`,
  },
 keywords: [
  "shop electronics Nepal",
  "buy electronics online Nepal",
  "online electronics store Nepal",
  "electronics shopping Nepal",
  "electronics price in Nepal",
  "buy gadgets Nepal",
  "electronics marketplace Nepal",
  "best electronics deals Nepal",
  "laptops and accessories Nepal",
  "buy laptops online Nepal",
  "gaming pc shop Nepal",
  "custom pc build Nepal",
  "computer accessories Nepal",
  "mobile phones shop Nepal",
  "buy smartphones Nepal",
  "genuine gadgets Nepal",
  "electronics with warranty Nepal",
  "tech store online Nepal",
  "electronics delivery Nepal",
  "trusted electronics shop Nepal",
],

  description: `Shop laptops, custom PCs, printers, monitors, and computer accessories in Nepal. Find the best deals in Kathmandu & Putalisadak with trusted products from ${APP_NAME}.`,
  alternates: {
    canonical: `${SERVER_PRODUCTION_URL}/shop`,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: `Shop Gadgets in Nepal | Laptops, PCs & Accessories | ${APP_NAME}`,
    description: `Browse and buy laptops, custom PCs, printers, monitors, and accessories from a trusted electronics store in Kathmandu, Nepal.`,
    url: `${SERVER_PRODUCTION_URL}/shop`,
    images: [],
  },
  twitter: {
    card: "summary_large_image",
    title: `Shop Gadgets in Nepal | ${APP_NAME}`,
    description: `Buy laptops, custom PCs, printers, monitors, and accessories online in Kathmandu & Nepal.`,
    images: []
  },
 
};


const page = () => {
  return (
    <main className="max-w-7xl xl:mx-auto mx-4 my-10 md:space-y-12 space-y-8">
      {/* Seo section */}
      <div className="sr-only">
  {/* H1 for SEO */}
  <h1>Shop Laptops, PCs, and Accessories Online in Nepal</h1>

  {/* Keyword-rich intro paragraph */}
  <p>
    Welcome to Proud Nepal, the most trusted electronics store in Nepal! 
    Shop high-quality laptops, custom PCs, monitors, printers, and computer 
    accessories—all at unbeatable prices. Whether you are in Kathmandu, Putalisadak, 
    or anywhere in Nepal, discover the latest gadgets, hot deals, and top-rated 
    electronics to upgrade your home, office, or gaming setup. Build your perfect PC, 
    find powerful laptops, and get authentic accessories with fast delivery and 
    reliable support—all in one place at <a href="https://proudnepal.com.np/">Proud Nepal</a>.
  </p>
</div>
    {/* Seo section */}

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
