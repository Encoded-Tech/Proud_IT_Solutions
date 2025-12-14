import { uploadToCloudinary } from "@/config/cloudinary";
import { checkRequiredFields } from "@/lib/helpers/validateRequiredFields";
import { withDB } from "@/lib/HOF";
import { withAuth } from "@/lib/HOF/withAuth";
import { Product } from "@/models";
import { IProduct } from "@/models/productModel";
import { ApiResponse } from "@/types/api";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

//total apis
//product-get-all api/product 
//product-create api/product

// product-get-all api/product
export const GET = withDB(async () => {
  const products = await Product.find()
    .populate("category", "categoryName")
    .populate({
      path: "variants",
      match: { isActive: true },
      select: "price stock specs images isActive"
    })
    .sort({ createdAt: -1 });

  const hasProducts = products.length > 0;
  const response: ApiResponse<IProduct[]> = {
    success: hasProducts,
    message: hasProducts ? "Products Fetched Successfully" : "products not found",
    data: products,
    status: hasProducts ? 200 : 400
  }
  return NextResponse.json(response, { status: response.status })
}, { resourceName: "product" }
)

// product-create api/product
export const POST = withAuth(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  withDB(async (req: NextRequest, context?) => {

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const price = formData.get("price") as string;
    const stock = parseInt(formData.get("stock") as string, 10) || 0;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const images = formData.getAll("images") as File[];
    const variants = formData.get("variants") as string | null;
    const isActiveRaw = formData.get("isActive");
    const isActive =
      isActiveRaw === null ? undefined : isActiveRaw === "true";

      const tagsRaw = formData.get("tags") as string | null; 
// expecting JSON string like '[{"name":"tag1"},{"name":"tag2"}]'


const tags = tagsRaw
  ? (JSON.parse(tagsRaw) as { id?: string; name: string }[]).map(tag => ({
      id: tag.id || new Types.ObjectId().toString(),
      name: tag.name,
    }))
  : [];

    const requiredFields = { name, price, category, stock, };
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
      if (img && img.size > 0) {
        const url = await uploadToCloudinary(img);
        imageUrl.push(url);
      }
    }

    const createProduct = await Product.create({
      name,
      description,
      price: priceNumber,
      stock,
      category,
      tags,
      images: imageUrl,
      variants: variants ? JSON.parse(variants) : [],
      isActive
    });
    return NextResponse.json({
      success: true,
      message: "Product created successfully",
      data: createProduct,
    });
  }, { resourceName: "product" }),
  { roles: ["admin"] }
)






