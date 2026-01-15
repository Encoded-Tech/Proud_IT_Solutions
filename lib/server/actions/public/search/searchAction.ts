"use server";


import { connectDB } from "@/db";
import { Product } from "@/models";

export async function searchProducts(query: string) {
  await connectDB();

  if (!query.trim()) return [];

  // Case-insensitive partial match
  const products = await Product.find({
    name: { $regex: query, $options: "i" },
  }).limit(10); // top 10 results

  return products.map((p) => ({
    _id: p._id.toString(),
    name: p.name,
    slug: p.slug,
  }));
}
