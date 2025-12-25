// lib/server/mappers/MapReview.ts
import { IReview } from "@/models/productModel";
import { UserType, ReviewType } from "@/types/product";



const DELETED_USER: UserType = {
  id: "deleted",
  name: "Former Customer",
  email: "",
  image: null,
};

export function mapReview(
  r: IReview & { user?: UserType | null }
): ReviewType {
  const user = r.user
    ? {
        id: r.user._id.toString(),
        name: r.user.name,
        email: r.user.email,
         image: r.user.image ?? null ,
      }
    : DELETED_USER; 

  return {
    id: r._id.toString(),
    user,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt?.toISOString(),
  };
}


export function mapReviewArray(
  reviews: (IReview & { user?: UserType | null })[]
): ReviewType[] {
  return reviews
    .map(mapReview)
    .filter((r): r is ReviewType => r !== null);
}

