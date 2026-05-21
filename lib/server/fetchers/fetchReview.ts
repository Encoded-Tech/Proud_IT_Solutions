// lib/server/fetchers/fetchReview.ts
import { cacheLife, cacheTag } from "next/cache";
import { Product } from "@/models/productModel";
import { ReviewState } from "@/types/product";
import { mapReviewArray } from "../mappers/mapReview";

type ReviewProductResult = {
  reviews: Parameters<typeof mapReviewArray>[0];
  totalReviews?: number;
  avgRating?: number;
};

export async function getReviewsAction(slug: string): Promise<ReviewState> {
  "use cache";

  cacheLife("minutes");
  cacheTag("products");
  cacheTag(`product:${slug}`);

  const product = await Product.findOne({ slug })
    .select("reviews totalReviews avgRating")
    .populate({
      path: "reviews.user",
      select: "name email image",
    })
    .lean<ReviewProductResult | null>();

  if (!product) {
    return { reviews: [], totalReviews: 0, avgRating: 0 };
  }

  const reviews = mapReviewArray(product.reviews);

  return {
    reviews,
    totalReviews: product.totalReviews ?? reviews.length,
    avgRating: product.avgRating ?? 0,
  };
}
