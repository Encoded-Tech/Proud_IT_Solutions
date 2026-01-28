
import { fetchBestSellers, fetchHotDeals, fetchNewArrivals } from "@/lib/server/fetchers/fetchProducts";
import BestSellers from "../products/best-seller";
import Sale from "../products/sale";
import HotDeals from "@/app/(root)/home/hot-deals";
import { getAllMedia } from "@/lib/server/actions/admin/media/mediaActions";

export const revalidate = 60;

interface HomeProductsProps {
  showBestSellers?: boolean;
  showHotDeals?: boolean;
  showNewArrivals?: boolean;
}

export default async function HomeProducts({
  showBestSellers = true,
  showHotDeals = true,
  showNewArrivals = true,
  
}: HomeProductsProps) {
  // fetch all 3 categories in parallel

    const [bestRes, hotRes, newRes] = await Promise.all([
    fetchBestSellers(),
    fetchHotDeals(),
    fetchNewArrivals()
  ]);


  const media = await getAllMedia();

  const mediaItems = media.data || [];

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
