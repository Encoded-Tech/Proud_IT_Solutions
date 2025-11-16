import { uploadToCloudinary } from "@/config/cloudinary";
import { connectDB } from "@/db";
import { withDB } from "@/lib/HOF";
import { Product } from "@/models";

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
    if(!category){
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
    console.log("Images received:", images.length);

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
        message: "product created successfully",
        data: createProduct,
    });
})

export async function GET(){
    await connectDB();
    const products = await Product.find().populate("category", "categoryName");
    if(!products){
        return NextResponse.json({
            success: false,
            message: "products not found",
            status: 404
        })
    }
    return NextResponse.json({
        success: true,
        message: "products fetched successfully",
        data: products
    })
}


