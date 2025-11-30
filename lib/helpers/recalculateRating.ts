import {  IProduct, IReview } from "@/models/productModel";

export const recalculateRating = (product: IProduct): void => {
    product.totalReviews = product.reviews.length;
  
    const total = product.reviews.reduce(
      (sum: number, r: IReview) => sum + r.rating,
      0
    );
  
    product.avgRating =
      product.totalReviews === 0 ? 0 : total / product.totalReviews;
  };
  