
import { uploadToCloudinary } from "@/config/cloudinary";
import { connectDB } from "@/db";
import { Category } from "@/models";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
  await connectDB();
  const formData = await req.formData();
  const  categoryName  = formData.get("categoryName") as string;
  const  categoryImage  = formData.get("categoryImage") as File;
  const parentId = formData.get("parentId") as string | null;

  if (!categoryName) {
    return NextResponse.json({ error: "category name is required" }, { status: 400 });
  }

  if (!categoryImage) {
    return NextResponse.json({ error: "category image is required" }, { status: 400 });
  }
  const imageUrl = await uploadToCloudinary(categoryImage);
  const createCategory = await Category.create({ categoryName, categoryImage: imageUrl, parentId: parentId || null  });
  return NextResponse.json({
    success: true,
    message: "category created successfully",
    data: createCategory,
  });
}

export async function GET() {
  await connectDB();
  const categories = await Category.find().populate("parentId", "categoryName");
  if(!categories) {
    return NextResponse.json({ success: false, message: "categories not found" }, { status: 404 });
  }
  return NextResponse.json({
    success: true,
    message: "categories fetched successfully",
    data: categories,
  });
}