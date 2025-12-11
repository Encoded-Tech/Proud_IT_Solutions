// /api/products/new-arrivals/route.ts
import { NextResponse } from "next/server";
import { Product, IProduct } from "@/models/productModel";
import { FilterQuery } from "mongoose";
import { withAuth } from "@/lib/HOF/withAuth";
import { withDB } from "@/lib/HOF";

export const GET = withAuth(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    withDB(async(req, context?) => {
        const url = new URL(req.url);

  // Pagination
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;

  // Optional category filter
  const category = url.searchParams.get("category");

  // Filter only active products
  const filter: FilterQuery<IProduct> = { isActive: true };
  if (category) filter.category = category;

  // Fetch products sorted by createdAt descending (newest first)
  const newArrivals = await Product.find(filter)
    .sort({ createdAt: -1 })
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
    message: "New Arrivals fetched successfully",
    data: newArrivals,
    pagination: { page, limit }
  });
    })
)
  

