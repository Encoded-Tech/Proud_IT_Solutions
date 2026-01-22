"use server";
import { connectDB } from "@/db";
import { Product } from "@/models";

export async function fetchBrands() {
  try {
    await connectDB();

    // Fetch all unique brand names where brandName exists
    const brands = await Product.distinct("brandName", { brandName: { $exists: true, $ne: "" }, isActive: true });

    return {
      success: true,
      message: "Brands fetched successfully",
      data: brands,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching brands:", errorMessage);
    return {
      success: false,
      message: "Failed to fetch brands",
      data: []
    };
  }
}
