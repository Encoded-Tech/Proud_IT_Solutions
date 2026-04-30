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
  // fetch all 3 categories in parallel

    const [bestRes, hotRes, newRes] = await Promise.all([
    fetchPublicBestSellers(),
    fetchPublicHotDeals(),
    fetchPublicNewArrivals()
  ]);

  const mediaItems = media ?? ((await getPublicMedia()).data || []);

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
