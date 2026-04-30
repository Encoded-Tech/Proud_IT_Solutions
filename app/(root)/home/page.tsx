import React from "react";
// import Article from "./article";

import ListCategories from "@/components/server/ListCategories";
import HomeProducts from "@/components/server/ListHomeProducts";
import HomeLandingAds from "@/components/server/HomeLandingAds";

import { getPublicMedia } from "@/lib/server/fetchers/fetchMedia";
import { ImageMediaItem } from "@/types/media";

import HomePromoLinks from "./homePromoLinks";
import HomeNewsletter from "./home-newsletter";
import HomeMarketplacePromos from "./home-marketplace-promos";
import { buildNoIndexMetadata } from "@/app/seo/utils/metadata";
import { Suspense } from "react";

export const metadata = buildNoIndexMetadata({
  title: "Home",
  description:
    "Duplicate homepage route used for navigation. Search engines should prefer the primary homepage.",
  path: "/home",
});


type HeroBannerDTO = {
  _id: string;
  imageUrl: string;
  placement: string;
};


const HomeMain = async () => {
  const mediaRes = await getPublicMedia();
  const mediaItems = mediaRes.success && mediaRes.data ? mediaRes.data : [];

  const heroBanners: HeroBannerDTO[] =
    mediaItems.length > 0
      ? mediaItems
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

      <HomeMarketplacePromos media={mediaItems} heroBanners={hasHeroBanners ? heroBanners : []} />


      {/* Rest of homepage */}
      <div className="max-w-7xl xl:mx-auto mx-4 my-20 space-y-20">
        <Suspense fallback={<div className="h-28 rounded-3xl border border-slate-200 bg-slate-50" />}>
          <ListCategories page="home" />
        </Suspense>
        <HomeLandingAds media={mediaItems} variant="middle" />
        <Suspense fallback={<div className="grid gap-6 md:grid-cols-3"><div className="h-72 rounded-3xl border border-slate-200 bg-slate-50" /><div className="h-72 rounded-3xl border border-slate-200 bg-slate-50" /><div className="h-72 rounded-3xl border border-slate-200 bg-slate-50" /></div>}>
          <HomeProducts showBestSellers media={mediaItems} />
        </Suspense>

      </div>
      <HomeLandingAds media={mediaItems} variant="footer" />
      <HomeNewsletter />
      <HomePromoLinks />
      {/* <div className="max-w-7xl xl:mx-auto mx-4 my-20 space-y-20">
 <Article />
      </div> */}
             
</main>
    </>
  );
};

export default HomeMain;
