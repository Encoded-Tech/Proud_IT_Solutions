import { deleteFromCloudinary, uploadToCloudinary } from "@/config/cloudinary";
import connectDB from "@/db/connection";
import { Category } from "@/models/categoryModel";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    await connectDB();
    const id = (await params).id;
    const singleCategory = await Category.findById(id).populate("parentId", "categoryName");
    if (!singleCategory) {
      return NextResponse.json({ error: "category not found" }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      message: "single category fetched successfully",
      data: singleCategory,
    });
  }

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id} = (await params);
  const categoryToDelete = await Category.findById(id);
  if (!categoryToDelete) {
    return NextResponse.json({ error: "category not found" }, { status: 404 });
  }
  if (categoryToDelete.categoryImage) {
    await deleteFromCloudinary(categoryToDelete.categoryImage);
  }
  await categoryToDelete.deleteOne();
  return NextResponse.json({
    success: true,
    message: "category deleted successfully",
    data: categoryToDelete,
  });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id} = (await params);
  const categoryToUpdate = await Category.findById(id);
  if (!categoryToUpdate) {
    return NextResponse.json({ error: "category not found" }, { status: 404 });
  }
  const formData = await req.formData();
  const  categoryName  = formData.get("categoryName") as string;
  const  categoryImage  = formData.get("categoryImage") as File;
  const parentId = formData.get("parentId") as string | null;

  if (categoryName) {
    categoryToUpdate.categoryName = categoryName;
    
  }
if (categoryImage) {
  if(categoryToUpdate.categoryImage) {
    await deleteFromCloudinary(categoryToUpdate.categoryImage);
    const imageUrl = await uploadToCloudinary(categoryImage);
    categoryToUpdate.categoryImage = imageUrl;
  }
  }
  if (parentId !== null) {
    categoryToUpdate.parentId = parentId.trim() === "" ? null : parentId;
  }
  await categoryToUpdate.save();
  return NextResponse.json({
    success: true,
    message: "category updated successfully",
    data: categoryToUpdate,
  });
  
  
}

  