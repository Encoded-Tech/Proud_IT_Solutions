// "use server";

// import { connectDB } from "@/db";
// import { Product } from "@/models";
// import { IReview } from "@/models/productModel";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth/authOptions";
// import mongoose from "mongoose";
// import { recalculateRating } from "@/lib/helpers/recalculateRating";
// import { ReviewType } from "@/types/product";
// import {  mapReviewArray } from "../../mappers/mapReview";

// interface ReviewActionResponse {
//   success: boolean;
//   message: string;
//   reviews?: ReviewType[];
//   avgRating?: number;
//   totalReviews?: number;
// }


// export async function createReviewAction(
//   slug: string,
//   rating: number,
//   comment: string
// ): Promise<ReviewActionResponse> {
//   try {
//     await connectDB();

//     const session = await getServerSession(authOptions);
//     if (!session?.user?.id) {
//       return { success: false, message: "Unauthorized" };
//     }

//     if (!rating || rating < 1 || rating > 5) {
//       return { success: false, message: "Rating must be between 1-5" };
//     }

//     if (!comment || comment.trim().length === 0) {
//       return { success: false, message: "Comment is required" };
//     }

//     const product = await Product.findOne({ slug }).populate("reviews.user");
//     if (!product) {
//       return { success: false, message: "Product not found" };
//     }

//     const alreadyReviewed = product.reviews.find(
//       (r: IReview) => r.user._id.toString() === session.user.id
//     );

//     if (alreadyReviewed) {
//       return {
//         success: false,
//         message: "You have already reviewed this product",
//       };
//     }

//     product.reviews.push({
//       user: new mongoose.Types.ObjectId(session.user.id),
//       rating,
//       comment: comment.trim(),
//       createdAt: new Date(),
//     } as IReview);

//     recalculateRating(product);
//     await product.save();

//    // 🔥 Re-fetch product with proper populate
//     const updatedProduct = await Product.findOne({ slug }).populate({
//       path: "reviews.user",
//       select: "_id name email",
//     });


// const reviews = mapReviewArray(updatedProduct!.reviews);

//     return {
//       success: true,
//       message: "Review added successfully",
//       reviews,
//       avgRating: product.avgRating,
//       totalReviews: product.reviews.length,
//     };
//   } catch (error) {
//     console.error("createReviewAction:", error);
//     return {
//       success: false,
//       message: error instanceof Error ? error.message : "Failed to add review",
//     };
//   }
// }


// export async function updateReviewAction(
//   slug: string,
//   rating?: number,
//   comment?: string
// ): Promise<ReviewActionResponse> {
//   try {
//     await connectDB();

//     const session = await getServerSession(authOptions);
//     if (!session?.user?.id) {
//       return { success: false, message: "Unauthorized" };
//     }

//     if (rating !== undefined && (rating < 1 || rating > 5)) {
//       return { success: false, message: "Rating must be between 1-5" };
//     }

//     if (comment !== undefined && comment.trim().length === 0) {
//       return { success: false, message: "Comment cannot be empty" };
//     }

//     const product = await Product.findOne({ slug }).populate("reviews.user");
//     if (!product) {
//       return { success: false, message: "Product not found" };
//     }

//     const review = product.reviews.find(
//       (r: IReview) => r.user._id.toString() === session.user.id
//     );

//     if (!review) {
//       return {
//         success: false,
//         message: "You have not reviewed this product",
//       };
//     }

//     if (rating !== undefined) review.rating = rating;
//     if (comment !== undefined) review.comment = comment.trim();

//     review.isEdited = true;
//     review.updatedAt = new Date();

//     recalculateRating(product);
//     product.markModified("reviews");
//     await product.save();

//    // 🔥 Re-fetch product with proper populate
//     const updatedProduct = await Product.findOne({ slug }).populate({
//       path: "reviews.user",
//       select: "_id name email",
//     });

// const reviews = mapReviewArray(updatedProduct!.reviews);

//     return {
//       success: true,
//       message: "Review updated successfully",
//       reviews,
//       avgRating: product.avgRating,
//       totalReviews: product.reviews.length,
//     };
//   } catch (error) {
//     console.error("updateReviewAction:", error);
//     return {
//       success: false,
//       message: error instanceof Error ? error.message : "Failed to update review",
//     };
//   }
// }

// export async function deleteReviewAction(
//   slug: string
// ): Promise<ReviewActionResponse> {
//   try {
//     await connectDB();

//     const session = await getServerSession(authOptions);
//     if (!session?.user?.id) {
//       return { success: false, message: "Unauthorized" };
//     }

//     const product = await Product.findOne({ slug }).populate("reviews.user");
//     if (!product) {
//       return { success: false, message: "Product not found" };
//     }

//     const hasReview = product.reviews.some(
//       (r: IReview) => r.user.toString() === session.user.id
//     );

//     if (!hasReview) {
//       return {
//         success: false,
//         message: "You have not reviewed this product",
//       };
//     }

//     product.reviews = product.reviews.filter(
//       (r: IReview) => r.user._id.toString() !== session.user.id
//     );

//     recalculateRating(product);
//     await product.save();

//    // 🔥 Re-fetch product with proper populate
//     const updatedProduct = await Product.findOne({ slug }).populate({
//       path: "reviews.user",
//       select: "_id name email",
//     });

// const reviews = mapReviewArray(updatedProduct!.reviews);

//     return {
//       success: true,
//       message: "Review deleted successfully",
//       reviews,
//       avgRating: product.avgRating,
//       totalReviews: product.reviews.length,
//     };
//   } catch (error) {
//     console.error("deleteReviewAction:", error);
//     return {
//       success: false,
//       message: error instanceof Error ? error.message : "Failed to delete review",
//     };
//   }
// }


"use server";

import { connectDB } from "@/db";
import { Product } from "@/models";
import { IReview } from "@/models/productModel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import mongoose from "mongoose";
import { recalculateRating } from "@/lib/helpers/recalculateRating";
import { ReviewType } from "@/types/product";
import { mapReviewArray } from "../../../mappers/mapReview";

interface ReviewActionResponse {
  success: boolean;
  message: string;
  reviews?: ReviewType[];
  avgRating?: number;
  totalReviews?: number;
}

// ------------------ CREATE REVIEW ------------------
export async function createReviewAction(
  slug: string,
  rating: number,
  comment: string
): Promise<ReviewActionResponse> {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, message: "Unauthorized" };


    if (!rating || rating < 1 || rating > 5) {
      return { success: false, message: "Rating must be between 1-5" };
    }

    if (!comment || comment.trim().length === 0) {
      return { success: false, message: "Comment is required" };
    }

    const product = await Product.findOne({ slug });
    if (!product) return { success: false, message: "Product not found" };

    // ✅ Check for existing review using raw ObjectId
    const alreadyReviewed = product.reviews.some(
      (r: IReview)  => r.user?.toString() === session.user.id
    );
    if (alreadyReviewed) {
      return { success: false, message: "You have already reviewed this product" };
    }

    // ✅ Add review
    product.reviews.push({
      user: new mongoose.Types.ObjectId(session.user.id),
      rating,
      comment: comment.trim(),
      createdAt: new Date(),
    } as IReview);

    recalculateRating(product);
    await product.save();

    // ✅ Re-fetch product with populate for mapping
    const updatedProduct = await Product.findOne({ slug }).populate({
      path: "reviews.user",
      select: "_id name email image",
    });

    const reviews = mapReviewArray(updatedProduct!.reviews);

    return {
      success: true,
      message: "Review added successfully",
      reviews,
      avgRating: product.avgRating,
      totalReviews: product.reviews.length,
    };
  } catch (error) {
    console.error("createReviewAction:", error);
    return { success: false, message: error instanceof Error ? error.message : "Failed to add review" };
  }
}

// ------------------ UPDATE REVIEW ------------------
export async function updateReviewAction(
  slug: string,
  rating?: number,
  comment?: string
): Promise<ReviewActionResponse> {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, message: "Unauthorized" };
    

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return { success: false, message: "Rating must be between 1-5" };
    }

    if (comment !== undefined && comment.trim().length === 0) {
      return { success: false, message: "Comment cannot be empty" };
    }

    const product = await Product.findOne({ slug });
    if (!product) return { success: false, message: "Product not found" };

    // ✅ Find review using raw ObjectId
    const review = product.reviews.find((r: IReview)  => r.user?.toString() === session.user.id);
    if (!review) return { success: false, message: "You have not reviewed this product" };

    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment.trim();
    review.isEdited = true;
    review.updatedAt = new Date();

    recalculateRating(product);
    product.markModified("reviews");
    await product.save();

    const updatedProduct = await Product.findOne({ slug }).populate({
      path: "reviews.user",
      select: "_id name email image",
    });
    const reviews = mapReviewArray(updatedProduct!.reviews);

    return {
      success: true,
      message: "Review updated successfully",
      reviews,
      avgRating: product.avgRating,
      totalReviews: product.reviews.length,
    };
  } catch (error) {
    console.error("updateReviewAction:", error);
    return { success: false, message: error instanceof Error ? error.message : "Failed to update review" };
  }
}

// ------------------ DELETE REVIEW ------------------
export async function deleteReviewAction(
  slug: string
): Promise<ReviewActionResponse> {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, message: "Unauthorized" };

    const product = await Product.findOne({ slug });
    if (!product) return { success: false, message: "Product not found" };

    const hasReview = product.reviews.some((r: IReview)  => r.user?.toString() === session.user.id);
    if (!hasReview) return { success: false, message: "You have not reviewed this product" };

    // ✅ Remove review using raw ObjectId
    product.reviews = product.reviews.filter((r: IReview) => r.user?.toString() !== session.user.id);

    recalculateRating(product);
    await product.save();

    const updatedProduct = await Product.findOne({ slug }).populate({
      path: "reviews.user",
      select: "_id name email image",
    });
    const reviews = mapReviewArray(updatedProduct!.reviews);

    return {
      success: true,
      message: "Review deleted successfully",
      reviews,
      avgRating: product.avgRating,
      totalReviews: product.reviews.length,
    };
  } catch (error) {
    console.error("deleteReviewAction:", error);
    return { success: false, message: error instanceof Error ? error.message : "Failed to delete review" };
  }
}
