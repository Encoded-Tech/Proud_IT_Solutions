// lib/server/fetchers/fetchReview.ts
import { Product } from "@/models/productModel";
import { ReviewState } from "@/types/product";
import { mapReviewArray } from "../mappers/mapReview";


export async function getReviewsAction(slug: string): Promise<ReviewState> {
  const product = await Product.findOne({ slug }).populate({
    path: "reviews.user",
    select: "name image",
  });

  if (!product) {
    return { reviews: [], totalReviews: 0, avgRating: 0 };
  }

  const reviews = mapReviewArray(product.reviews);

  return {
    reviews,
    totalReviews: product.totalReviews,
    avgRating: product.avgRating,
  };
}
