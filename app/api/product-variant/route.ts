import { NextRequest, NextResponse } from "next/server";
import { withDB } from "@/lib/HOF";
import { withAuth } from "@/lib/HOF/withAuth";
import { Product, ProductVariant } from "@/models";
import { uploadToCloudinary } from "@/config/cloudinary";
import { checkRequiredFields } from "@/lib/helpers/validateRequiredFields";
import mongoose, { FilterQuery } from "mongoose";
import { IProductVariant } from "@/models/productVariantsModel";

export const POST = withAuth(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  withDB(async (req: NextRequest, context?) => {
    const formData = await req.formData();
    const rawProductId = formData.get("productId");

    if (!rawProductId || typeof rawProductId !== "string") {
      return NextResponse.json(
        { success: false, message: "productId is required" },
        { status: 400 }
      );
    }
    
    const productId = rawProductId.trim();
    
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { success: false, message: "Invalid product ID format" },
        { status: 400 }
      );
    }
    const cpu = formData.get("cpu") as string;
    const ram = formData.get("ram") as string;
    const storage = formData.get("storage") as string;
    const color = formData.get("color") as string | null;
    const price =formData.get("price") as string;
    const stock = parseInt(formData.get("stock") as string, 10) || 0;
    const isActiveRaw = formData.get("isActive");
    const isActive =
      isActiveRaw === null ? undefined : isActiveRaw === "true";
  

    const imagesFiles = formData.getAll("images") as File[];
    const images: string[] = [];
    for (const img of imagesFiles) {
      if (img && img.size > 0) {
        const url = await uploadToCloudinary(img);
        images.push(url);
      }
    }

    const requiredFields = { productId, cpu, ram, storage, price };
    const misssingFields = checkRequiredFields(requiredFields);
    if (misssingFields) return misssingFields;

    
    const priceNumber = parseFloat(price);
    if (isNaN(priceNumber)) {
      return NextResponse.json({
        success: false,
        message: "Price must be a valid number",
      }, { status: 400 });
    }
  
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ 
        success: false, 
        message: "Product not found" }, 
        { status: 404 });
    }
    const variant = await ProductVariant.create({
      product: productId,
      specs: { cpu, ram, storage, color: color || undefined },
      price: priceNumber,
      stock,
      images,
      isActive,
    });

    await Product.findByIdAndUpdate(productId, {
        $push: { variants: variant._id },
      });

    return NextResponse.json({
      success: true,
      message: "Product variant created successfully",
      data: variant,
    }, { status: 200 });
  }, { resourceName: "product-variant" }),
  { roles: ["admin"] }
);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const GET = withDB(async (req: NextRequest, context?) => {
    const { searchParams } = new URL(req.url);
  
    const productId = searchParams.get("productId");
    const cpu = searchParams.get("cpu");
    const ram = searchParams.get("ram");
    const storage = searchParams.get("storage");
    const color = searchParams.get("color");
    const isActive = searchParams.get("isActive");
  
    if (!productId) {
      return NextResponse.json(
        { success: false, message: "productId is required" },
        { status: 400 }
      );
    }
  
    const filter: FilterQuery<IProductVariant> = { product: productId };
  
    if (cpu) filter["specs.cpu"] = cpu;
    if (ram) filter["specs.ram"] = ram;
    if (storage) filter["specs.storage"] = storage;
    if (color) filter["specs.color"] = color;
    if (isActive !== null) filter.isActive = isActive === "true";
  
    const variants = await ProductVariant.find(filter)
      .populate("product", "name slug")
      .sort({ price: 1 });
  
    return NextResponse.json({
      success: true,
      message: "Product variants fetched successfully",
      data: variants,
    }, { status: 200 });
  }, { resourceName: "product-variant" });
  