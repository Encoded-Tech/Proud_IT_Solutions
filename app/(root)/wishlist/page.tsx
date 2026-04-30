import WishlistPage from "@/components/server/ListWishlist";
import { buildNoIndexMetadata } from "@/app/seo/utils/metadata";
import { connection } from "next/server";

export const metadata = buildNoIndexMetadata({
  title: "Wishlist",
  description: "Saved products you may want to purchase later.",
  path: "/wishlist",
});

const Wishlist = async () => {
  await connection();
  return (
   <div className="max-w-7xl xl:mx-auto mx-4 my-10">
      <WishlistPage />
    </div>
  );
};

export default Wishlist;
