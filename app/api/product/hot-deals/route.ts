import { FilterQuery } from "mongoose";
import { Product, IProduct } from "@/models/productModel";
import {  NextResponse } from "next/server";
import { withAuth } from "@/lib/HOF/withAuth";
import { withDB } from "@/lib/HOF";


 export const GET = withAuth(
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

  if (category) filter.category = category;

  const hotDeals = await Product.find(filter)
    .sort({ discountPercent: -1 }) 
    .skip(skip)
    .limit(limit)
    .populate("category", "categoryName")
    .populate({
      path: "variants",
      match: { isActive: true },
      select: "price stock specs images isActive",
    });

  return NextResponse.json({
    success: true,
    message: "Hot Deals fetched successfully",
    data: hotDeals,
    pagination: { page, limit },
  });
    })
 )

