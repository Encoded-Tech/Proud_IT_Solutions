import { NextRequest, NextResponse } from "next/server";
import { withDB } from "@/lib/HOF";
import { withAuth } from "@/lib/HOF/withAuth";
import { Product, IReview } from "@/models/productModel";
import { getAuthUserId } from "@/lib/auth/getAuthUser";
import { recalculateRating } from "@/lib/helpers/recalculateRating";
import { ApiResponse } from "@/types/api";

interface IReviewResponse {
  reviews: IReview[];
  totalReviews: number;
  avgRating: number;
}

export const GET = withDB(async (req: NextRequest, _context?) => {
  const params = await _context?.params;
  const id = params?.id;

  const product = await Product.findById(id)
    .populate({ path: "reviews.user", select: "name image" });

  if (!product) {
    return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
  }

  const response: ApiResponse<IReviewResponse> = {
    success: !!product,
    message: product ? "Reviews fetched successfully" : "Product not found",
    data: {
      reviews: product ? product.reviews : [],
      totalReviews: product ? product.totalReviews : 0,
      avgRating: product ? product.avgRating : 0,
    },
    status: product ? 200 : 404,
  };
  return NextResponse.json(response, { status: response.status });
}, { resourceName: "review" });



export const POST = withAuth(withDB(async (req: NextRequest, _context?) => {
  const params = await _context?.params;
  const id = params?.id;
  const userId = getAuthUserId(req);
  const { rating, comment } = await req.json();

  if (!rating || rating < 1 || rating > 5) return NextResponse.json({ success: false, message: "Rating must be between 1-5" }, { status: 400 });
  if (!comment || comment.trim().length === 0) return NextResponse.json({ success: false, message: "Comment is required" }, { status: 400 });

  const product = await Product.findById(id);
  if (!product) return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });

  const existingReview = product.reviews.find((r: IReview) => r.user.toString() === userId);
  if (existingReview) return NextResponse.json({
    success: false, message: "You have already reviewed this product"
  }, { status: 400 });

  product.reviews.push({ user: userId, rating, comment });
  recalculateRating(product);
  await product.save();

  return NextResponse.json({ success: true, message: "Review added successfully", data: product.reviews });
}, { resourceName: "review" }));

export const DELETE = withAuth(withDB(async (req: NextRequest, _context?) => {
  const params = await _context?.params;
  const id = params?.id;
  const userId = getAuthUserId(req);

  const product = await Product.findById(id);
  if (!product) return NextResponse.json({
    success: false,
    message: "Product not found"
  }, { status: 404 });

  const existingReview = product.reviews.find((r: IReview) => r.user.toString() === userId);
  if (!existingReview) return NextResponse.json({ success: false, message: "You have not reviewed this product" }, { status: 400 });

  product.reviews = product.reviews.filter((r: IReview) => r.user.toString() !== userId);
  recalculateRating(product);
  await product.save();

  return NextResponse.json({
    success: true,
    message: "Review deleted successfully",
    data: product.reviews
  }, { status: 200 });
}, { resourceName: "review" }));

export const PUT = withAuth(
  withDB(async (req: NextRequest, _context?) => {
    const params = await _context?.params;
    const id = params?.id;
    const userId = getAuthUserId(req);
    const { rating, comment } = await req.json();

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { success: false, message: "Rating must be between 1-5" },
        { status: 400 }
      );
    }

    if (comment !== undefined && comment.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Comment cannot be empty" },
        { status: 400 }
      );
    }

    const product = await Product.findById(id);
    if (!product)
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );

    const existingReview = product.reviews.find(
      (r: IReview) => r.user.toString() === userId
    );

    if (!existingReview)
      return NextResponse.json(
        { success: false, message: "You have not reviewed this product" },
        { status: 400 }
      );

    if (rating !== undefined) existingReview.rating = rating;
    if (comment !== undefined) existingReview.comment = comment.trim();

    existingReview.isEdited = true;
    existingReview.updatedAt = new Date();

    recalculateRating(product)
    product.markModified("reviews");
    await product.save();

    return NextResponse.json({
      success: true,
      message: "Review updated successfully",
      data: product.reviews,
    });
  }, { resourceName: "review" })
);

