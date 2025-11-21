import { uploadToCloudinary } from "@/config/cloudinary";
import { checkRequiredFields } from "@/lib/helpers/validateRequiredFields";
import { withDB } from "@/lib/HOF";
import { Product } from "@/models";
import { IProduct } from "@/models/productModel";
import { ApiResponse } from "@/types/api";
import { NextRequest, NextResponse } from "next/server";

export const POST = withDB(async (req: NextRequest) => {

  const formData = await req.formData();
  const name = formData.get("name") as string;
  const price = formData.get("price") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const images = formData.getAll("images") as File[];
  const variants = formData.get("variants") as string | null;
  const isActive = formData.get("isActive") as string;

  const requiredFields = { name, price, category };
  const missingFields = checkRequiredFields(requiredFields);
  if (missingFields) return missingFields;

  const priceNumber = parseFloat(price);
  if (isNaN(priceNumber)) return NextResponse.json(
    { success: false, message: "price must be a number" },
    { status: 400 }
  );

  const slug = name.toLowerCase().replace(/\s+/g, "-");
  const existingProduct = await Product.findOne({ $or: [{ name }, { slug }] });
  if (existingProduct) {
    return NextResponse.json(
      { success: false, message: `Product with name '${name}' already exists` },
      { status: 409 }
    );
  }
  const imageUrl: string[] = [];

  for (const img of images) {
    const url = await uploadToCloudinary(img);
    imageUrl.push(url);
  }
  const createProduct = await Product.create({
    name,
    description,
    price: priceNumber,
    category,
    images: imageUrl,
    variants: variants ? JSON.parse(variants) : [],
    isActive: isActive != null ? isActive === "true" : undefined
  });
  return NextResponse.json({
    success: true,
    message: "Product created successfully",
    data: createProduct,
  });
}, { resourceName: "product" })


export const GET = withDB(async () => {
  const products = await Product.find()
    .populate("category", "categoryName")
    .sort({ createdAt: -1 });

  const hasProducts = products.length > 0;
  const response: ApiResponse<IProduct[]> = {
    success: hasProducts,
    message: hasProducts ? "Products Fetched Successfully" : "products not found",
    data: products,
    status: hasProducts ? 200 : 400
  }
  return NextResponse.json(response, { status: response.status })
}, { resourceName: "product" })




