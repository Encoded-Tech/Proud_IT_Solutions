import React from "react";
import Hero from "./hero";
import Article from "./article";

import ListCategories from "@/components/server/ListCategories";
import HomeProducts from "@/components/server/ListHomeProducts";
import HeroBanners from "./hero-banners";

import { getAllMedia } from "@/lib/server/actions/admin/media/mediaActions";
import { ImageMediaItem } from "@/types/media";

import HomePromoLinks from "./homePromoLinks";


type HeroBannerDTO = {
  _id: string;
  imageUrl: string;
  placement: string;
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

  {/*Seo section*/}
  <h1 className="sr-only">
        Trusted Electronics Store in Nepal for Laptops, PCs & Accessories
      </h1>

      <section className="sr-only">
  <h2>Best Electronics Store in Kathmandu, Nepal</h2>
  <p>
    Buy laptops, desktops, printers, monitors, PC components and accessories
    from a trusted electronics shop in Nepal, located in Putalisadak.
  </p>

  <h2>Best Laptops, customized PCs, and Accessories</h2>
  <p>
    We offer gaming laptops, business laptops, custom PCs, monitors, keyboards,
    mice, UPS, printers and more at competitive prices in Nepal.
  </p>
</section>
{/*Seo section*/}

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

      </div>
      <HomePromoLinks />
      <div className="max-w-7xl xl:mx-auto mx-4 my-20 space-y-20">
 <Article />
      </div>
             
</main>
    </>
  );
};

export default HomeMain;
