import { uploadToCloudinary } from "@/config/cloudinary";
import connectDB from "@/db/connection";
import { Product } from "@/models/productModel";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    await connectDB();
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const price = formData.get("price") as string;
    const description = formData.get("description") as string;
    const categoryId = formData.get("categoryId") as string;
    const images = formData.getAll("images") as File[];
    const variants = formData.get("variants") as string | null;
    const isActive = formData.get("isActive") as string;

    if(!name){
        return NextResponse.json({
            success: false,
            message: "name is required",
            status: 400
        })
    }
    if(!price){
        return NextResponse.json({
            success: false,
            message: "price is required",
            status: 400
        })
    }
    if(!categoryId){
        return NextResponse.json({
            success: false,
            message: "categoryId is required",
            status: 400
        })
    }

    const priceNumber = parseFloat(price);
    if(isNaN(priceNumber)){
        return NextResponse.json({
            success: false,
            message: "price must be a number",
            status: 400
        })
    }

    const imageUrl = await Promise.all(
        images.map((image) => uploadToCloudinary(image))
    );
    const createProduct = await Product.create({
            name,
            description,
            price: priceNumber,
            category: categoryId,
            images: imageUrl,
            variants: variants ? JSON.parse(variants) : [],
            isActive: isActive === "true" ? true : false
        });
return NextResponse.json({
        success: true,
        message: "product created successfully",
        data: createProduct,
    });
    }

