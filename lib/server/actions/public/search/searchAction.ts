"use server";


import { connectDB } from "@/db";
import { Product } from "@/models";
import { Types } from "mongoose";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function searchProducts(query: string) {
  await connectDB();

  const trimmedQuery = query.trim();
  if (trimmedQuery.length < 2) return [];

  const safeRegex = escapeRegex(trimmedQuery);
  const products = await Product.find({
    isActive: true,
    $or: [
      { name: { $regex: safeRegex, $options: "i" } },
      { brandName: { $regex: safeRegex, $options: "i" } },
      { "tags.name": { $regex: safeRegex, $options: "i" } },
    ],
  })
    .select("name slug")
    .limit(10)
    .lean<{ _id: Types.ObjectId; name: string; slug: string }[]>();

  return products.map((p) => ({
    _id: p._id.toString(),
    name: p.name,
    slug: p.slug,
  }));
}
