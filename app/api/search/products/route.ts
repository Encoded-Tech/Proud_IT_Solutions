import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/db";
import { Category, Product, ProductVariant } from "@/models";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

type SearchProduct = {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  price: number;
  stock: number;
  images?: string[];
  brandName?: string;
  category?: {
    categoryName?: string;
    slug?: string;
  };
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const safeRegex = new RegExp(escapeRegex(q), "i");

  await connectDB();

  const [matchingCategories, matchingVariants] = await Promise.all([
    Category.find({ isActive: true, categoryName: safeRegex })
      .select("_id")
      .limit(8)
      .lean<{ _id: Types.ObjectId }[]>(),
    ProductVariant.find({ isActive: true, sku: safeRegex })
      .select("product")
      .limit(8)
      .lean<{ product: Types.ObjectId }[]>(),
  ]);

  const categoryIds = matchingCategories.map((category) => category._id);
  const variantProductIds = matchingVariants.map((variant) => variant.product);

  const products = await Product.find({
    isActive: true,
    $or: [
      { name: safeRegex },
      { brandName: safeRegex },
      { "tags.name": safeRegex },
      ...(categoryIds.length > 0 ? [{ category: { $in: categoryIds } }] : []),
      ...(variantProductIds.length > 0 ? [{ _id: { $in: variantProductIds } }] : []),
    ],
  })
    .select("name slug price stock images brandName category")
    .populate("category", "categoryName slug")
    .sort({ totalSales: -1, createdAt: -1 })
    .limit(10)
    .lean<SearchProduct[]>();

  const results = products.map((product) => ({
    id: product._id.toString(),
    name: product.name,
    slug: product.slug,
    price: product.price,
    image: product.images?.[0] || "",
    categoryName: product.category?.categoryName || "",
    brandName: product.brandName || "",
    stock: product.stock,
    available: product.stock > 0,
  }));

  return NextResponse.json({ results });
}
