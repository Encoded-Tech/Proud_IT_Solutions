import { fetchCategories } from "@/lib/server/fetchers/fetchCategory";
import SliderClient from "../products/categories";
import ShopCategories from "@/app/(root)/shop/shop-category";


type Props = {
  page: "home" | "shop";
};

export default async function ListCategories( { page }: Props) {
  const res = await fetchCategories();

  const categories = res.data || [];

  return (
    <div className="relative">
       {page === "home" && <SliderClient categories={categories} />}
      {page === "shop" && <ShopCategories categories={categories} />}
     
    </div>
  );
}
