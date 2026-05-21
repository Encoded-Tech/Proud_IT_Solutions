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
  createdAt?: Date;
  category?: {
    categoryName?: string;
    slug?: string;
  };
};

function getSearchScore(
  product: SearchProduct,
  exactRegex: RegExp,
  startsWithRegex: RegExp,
  containsRegex: RegExp,
  matchingVariantProductIds: Set<string>
) {
  let score = 0;
  const name = product.name || "";
  const categoryName = product.category?.categoryName || "";
  const brandName = product.brandName || "";

  if (exactRegex.test(name)) score += 100;
  else if (startsWithRegex.test(name)) score += 80;
  else if (containsRegex.test(name)) score += 60;

  if (containsRegex.test(categoryName)) score += 50;
  if (matchingVariantProductIds.has(product._id.toString())) score += 40;
  if (containsRegex.test(brandName)) score += 25;

  return score;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const safeRegex = new RegExp(escapeRegex(q), "i");
  const exactRegex = new RegExp(`^${escapeRegex(q)}$`, "i");
  const startsWithRegex = new RegExp(`^${escapeRegex(q)}`, "i");

  await connectDB();

  const [matchingCategories, matchingVariants] = await Promise.all([
    Category.find({ isActive: true, categoryName: safeRegex })
      .select("_id categoryName slug")
      .limit(8)
      .lean<{ _id: Types.ObjectId; categoryName: string; slug: string }[]>(),
    ProductVariant.find({ isActive: true, sku: safeRegex })
      .select("product")
      .limit(30)
      .lean<{ product: Types.ObjectId }[]>(),
  ]);

  const categoryIds = matchingCategories.map((category) => category._id);
  const variantProductIds = matchingVariants.map((variant) => variant.product);

  const products = await Product.find({
    isActive: true,
    $or: [
      { name: safeRegex },
      { brandName: safeRegex },
      ...(categoryIds.length > 0 ? [{ category: { $in: categoryIds } }] : []),
      ...(variantProductIds.length > 0 ? [{ _id: { $in: variantProductIds } }] : []),
    ],
  })
    .select("name slug price stock images brandName category createdAt")
    .populate("category", "categoryName slug")
    .sort({ createdAt: -1 })
    .limit(50)
    .lean<SearchProduct[]>();

  const variantProductIdSet = new Set(variantProductIds.map((id) => id.toString()));
  const results = products
    .map((product) => ({
      product,
      score: getSearchScore(
        product,
        exactRegex,
        startsWithRegex,
        safeRegex,
        variantProductIdSet
      ),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if ((b.product.stock > 0 ? 1 : 0) !== (a.product.stock > 0 ? 1 : 0)) {
        return (b.product.stock > 0 ? 1 : 0) - (a.product.stock > 0 ? 1 : 0);
      }
      return (
        new Date(b.product.createdAt || 0).getTime() -
        new Date(a.product.createdAt || 0).getTime()
      );
    })
    .slice(0, 10)
    .map(({ product }) => ({
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
