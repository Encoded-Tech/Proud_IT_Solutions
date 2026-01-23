import React from "react";
import Hero from "./hero";
import Article from "./article";

import ListCategories from "@/components/server/ListCategories";
import HomeProducts from "@/components/server/ListHomeProducts";
import HeroBanners from "./hero-banners";

import { getAllMedia } from "@/lib/server/actions/admin/media/mediaActions";
import { ImageMediaItem } from "@/types/media";
import { Metadata } from "next";
import { APP_DESCRIPTION, APP_NAME } from "@/config/env";

type HeroBannerDTO = {
  _id: string;
  imageUrl: string;
  placement: string;
};

export const metadata: Metadata = {
  title: {
    template: `%s | ${APP_NAME}`,
    default: APP_NAME,
  },
  description: APP_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: []
    
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: [], // optional, but good for social
  },
};

const HomeMain = async () => {
  const mediaRes = await getAllMedia();

  const heroBanners: HeroBannerDTO[] =
    mediaRes.success && mediaRes.data
      ? mediaRes.data
          .filter(
            (item): item is ImageMediaItem =>
              item.type === "image" &&
              (item.placement === "hero_first" ||
                item.placement === "hero_second" ||
                item.placement === "hero_third" ||
                item.placement === "hero_fourth" ||
                item.placement === "build-user-pc")
          )
          .map((item) => ({
            _id: item.id,
            imageUrl: item.imageUrl,
            placement: item.placement,
          }))
      : [];

  const hasHeroBanners = heroBanners.length > 0;

  return (
    <>

    
      {/* ✅ HERO FALLBACK LOGIC */}
<main>
        {hasHeroBanners ? (
        <div className="max-w-7xl xl:mx-auto mx-4 my-12">
          <HeroBanners banners={heroBanners}  />
        </div>
      ) : (
        <Hero />
      )}

      {/* Rest of homepage */}
      <div className="max-w-7xl xl:mx-auto mx-4 my-20 space-y-20">
        <ListCategories page="home" />
        <HomeProducts showBestSellers />
        <Article />
      </div>
</main>
    </>
  );
};

export default HomeMain;
