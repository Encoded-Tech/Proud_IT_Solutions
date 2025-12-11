import { FRONTEND_URL } from "@/config/env";

import { productType } from "@/types/product";
import BestSellers from "../products/best-seller";
import Sale from "../products/sale";
import HotDeals from "@/app/(root)/home/hot-deals";

export const revalidate = 60;

async function getBestSellers(): Promise<productType[]> {
  const res = await fetch(`${FRONTEND_URL}/api/product/best-sellers`, { next: { revalidate: 60 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data?.data || [];
}

async function getHotDeals(): Promise<productType[]> {
  const res = await fetch(`${FRONTEND_URL}/api/product/hot-deals`, { next: { revalidate: 60 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data?.data || [];
}

async function getNewArrivals(): Promise<productType[]> {
  const res = await fetch(`${FRONTEND_URL}/api/product/new-arrivals`, { next: { revalidate: 60 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data?.data || [];
}
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
  const [bestSellers, newArrivals, hotDeals] = await Promise.all([
    getBestSellers(),
    getHotDeals(),
    getNewArrivals(),
  ]);


  return (
    <div className="space-y-20">
   
      {showBestSellers && <BestSellers bestSellers={bestSellers} title="Our Best Sellers" />}
         {showNewArrivals && <Sale newArrivals={newArrivals} title="New Arrivals" />}
      {showHotDeals && <HotDeals hotDeals={hotDeals} title="Hot Deals" />}
   
    
    </div>
  );
}
