
import { FRONTEND_URL } from "@/config/env";
import SliderClient from "../products/categories";
import ShopCategories from "@/app/(root)/shop/shop-category";

export const revalidate = 60;

async function getCategories() {
  const res = await fetch(`${FRONTEND_URL}/api/category`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) return [];

  const data = await res.json();
  return data?.data || [];
}
type Props = {
  page: "home" | "shop";
};

export default async function ListCategories( { page }: Props) {
  const categories = await getCategories();
  

  return (
    <div className="relative">
       {page === "home" && <SliderClient categories={categories} />}
      {page === "shop" && <ShopCategories categories={categories} />}
     
    </div>
  );
}
