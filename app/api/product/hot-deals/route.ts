import { FilterQuery } from "mongoose";
import { Product, IProduct } from "@/models/productModel";
import {  NextResponse } from "next/server";
import { withDB } from "@/lib/HOF";
import { getCategoryAndDescendantIds } from "@/lib/server/helpers/categoryDescendants";

const PRODUCT_CARD_SELECT =
  "name slug highlights price stock reservedStock category images variants avgRating totalReviews totalSales offeredPrice brandName isOfferedPriceActive discountPercent offerStartDate offerEndDate isActive createdAt updatedAt";

 export const GET = 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    withDB( async (req, context?) => {
         const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "10");
  const category = url.searchParams.get("category");
  const skip = (page - 1) * limit;

  const filter: FilterQuery<IProduct> = {
    isActive: true,
    isOfferedPriceActive: true,
    discountPercent: { $gt: 0 },
  };

  if (category) {
    const categoryIds = await getCategoryAndDescendantIds(category);
    filter.category = { $in: categoryIds };
  }

  const hotDeals = await Product.find(filter)
    .sort({ discountPercent: -1 }) 
    .skip(skip)
    .limit(limit)
    .select(PRODUCT_CARD_SELECT)
    .populate("category", "categoryName")
    .populate({
      path: "variants",
      match: { isActive: true },
      select: "price stock specs images isActive",
    })
    .lean();

  return NextResponse.json({
    success: true,
    message: "Hot Deals fetched successfully",
    data: hotDeals,
    pagination: { page, limit },
  });
    })
 

