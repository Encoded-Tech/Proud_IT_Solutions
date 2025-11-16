import { deleteFromCloudinary } from "@/config/cloudinary";
import { connectDB } from "@/db";
import { Product } from "@/models";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest, { params }: { params: Promise<{ id: string }> }) {
        await connectDB();

        const {id} = (await params); 
        const singleProduct = await Product.findById(id).populate("category", "categoryName");

        if(!singleProduct){
            return NextResponse.json({
                success: false,
                message: "product not found",
                status: 404
            })
        }
        return NextResponse.json({
            status: 200,
            success: true,
            message: "single product fetched successfully",
            data: singleProduct
        })
        }

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    await connectDB();
    const {id} = (await params);
    const productToDelete = await Product.findById(id);
    if(!productToDelete){
        return NextResponse.json({
            success: false,
            message: "product not found",
            status: 404
        })
    }
    if(productToDelete.images){
        await Promise.all(productToDelete.images.map(async (imageUrl: string ) => {
            await deleteFromCloudinary(imageUrl);
        }));
    }
    await productToDelete.deleteOne();
    return NextResponse.json({
        success: true,
        message: "product deleted successfully",
        data: productToDelete
    })

}
