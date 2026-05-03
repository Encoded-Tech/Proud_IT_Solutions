import {
  fetchPublicBestSellers,
  fetchPublicHotDeals,
  fetchPublicNewArrivals,
} from "@/lib/server/fetchers/fetchPublicProducts";
import BestSellers from "../products/best-seller";
import Sale from "../products/sale";
import HotDeals from "@/app/(root)/home/hot-deals";
import { getPublicMedia } from "@/lib/server/fetchers/fetchMedia";
import { AnyMediaItem } from "@/types/media";

export const revalidate = 60;

interface HomeProductsProps {
  showBestSellers?: boolean;
  showHotDeals?: boolean;
  showNewArrivals?: boolean;
  media?: AnyMediaItem[];
}

export default async function HomeProducts({
  showBestSellers = true,
  showHotDeals = true,
  showNewArrivals = true,
  media,
  
}: HomeProductsProps) {
  if (!showBestSellers && !showHotDeals && !showNewArrivals) {
    return null;
  }

  const [bestRes, hotRes, newRes, mediaRes] = await Promise.all([
    showBestSellers ? fetchPublicBestSellers() : Promise.resolve({ data: [] }),
    showHotDeals ? fetchPublicHotDeals() : Promise.resolve({ data: [] }),
    showNewArrivals ? fetchPublicNewArrivals() : Promise.resolve({ data: [] }),
    media || (!showBestSellers && !showHotDeals)
      ? Promise.resolve({ data: media || [] })
      : getPublicMedia(),
  ]);

  const mediaItems = mediaRes.data || [];

  const bestSellers = bestRes.data || [];

  
  const hotDeals = hotRes.data || [];
  const newArrivals = newRes.data || [];

  return (
    <div className=" md:space-y-20">
   
      {showBestSellers && <BestSellers media = {mediaItems} bestSellers={bestSellers} title="Best Sellers" />}
         {showNewArrivals && <Sale newArrivals={newArrivals} title="New Arrivals" />}
      {showHotDeals && <HotDeals media = {mediaItems} hotDeals={hotDeals} title="Hot Deals" />}
   
    </div>
  );
}
