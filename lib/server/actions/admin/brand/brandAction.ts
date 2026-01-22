"use server";
import { connectDB } from "@/db";
import { Product } from "@/models";

export async function fetchBrands() {
  try {
    await connectDB();

    const brands = await Product.aggregate([
      {
        $match: {
          brandName: { $exists: true, $ne: "" },
          isActive: true,
        },
      },
      {
        $group: {
          _id: "$brandName",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          count: 1,
        },
      },
      { $sort: { name: 1 } },
    ]);

    return {
      success: true,
      message: "Brands fetched successfully",
      data: brands,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching brands:", errorMessage);

    return {
      success: false,
      message: "Failed to fetch brands",
      data: [],
    };
  }
}
