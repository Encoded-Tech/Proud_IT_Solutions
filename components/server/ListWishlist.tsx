
import { getWishlistAction } from "@/lib/server/fetchers/fetchWishlist";
import { WishlistItemDTO } from "@/lib/server/mappers/MapWishlist";
import WishlistClient from "../client/WishlistClient";

const WishlistPage = async () => {
  const { wishlist }: { wishlist: WishlistItemDTO[] } = await getWishlistAction();

  const initialWishlist = Array.isArray(wishlist) ? wishlist : [];

  return (
  <WishlistClient initialWishlist={initialWishlist} />
);
};

export default WishlistPage;


