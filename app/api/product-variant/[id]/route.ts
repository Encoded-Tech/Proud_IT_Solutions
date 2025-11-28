import { deleteFromCloudinary, uploadToCloudinary } from "@/config/cloudinary";
import { withDB } from "@/lib/HOF";
import { withAuth } from "@/lib/HOF/withAuth";
import { Product } from "@/models";
import { IProductVariant, ProductVariant } from "@/models/productVariantsModel";
import { ApiResponse } from "@/types/api";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export const GET = withDB(async (req, context)=>{
    const params = await context?.params;
    const id = params?.id;
    if (!id) {
        return NextResponse.json({
            success: false,
            message: "product-variant id missing",
            status: 404
        })
    }
    const singleProductVariant = await ProductVariant.findById(id).populate("product", "name slug");
    const hasProductVariant = !!singleProductVariant;
    const response: ApiResponse<IProductVariant[]> = {
        success: hasProductVariant,
        message: hasProductVariant ? "Single product variant Fetched Successfully" : "product variant not found",
        data: singleProductVariant,
        status: hasProductVariant ? 200 : 400
    }
    return NextResponse.json(response, { status: response.status })
}, {resourceName: "product-variant"});

export const PUT = withAuth(
    withDB(async (req, context) => {
        const params = await context?.params;
        const id = params?.id;

        if (!id) {
            return NextResponse.json({
                success: false,
                message: "product-variant id missing",
                status: 404
            })
        }
        const productVariantToUpdate = await ProductVariant.findById(id);
        if (!productVariantToUpdate) {
            return NextResponse.json({
                success: false,
                message: "Product variant not found",
                status: 404
            })
        }
        
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
            const ram = formData.get("ram")  as string;
            const storage = formData.get("storage") as string;
            const color = formData.get("color") as string | null;
            const price = formData.get("price") as string ;
            const stock = parseInt(formData.get("stock") as string, 10) || 0;
            const isActiveRaw = formData.get("isActive") as string ;
            const imagesFiles = formData.getAll("images") as File[];
            const isActive =
                isActiveRaw === null ? undefined : isActiveRaw === "true";

            if (productId) {
                productVariantToUpdate.product = productId;
            }
            if (cpu) {
                productVariantToUpdate.specs.cpu = cpu;
            }
            if (ram) {
                productVariantToUpdate.specs.ram = ram;
            }
            if (storage) {
                productVariantToUpdate.specs.storage = storage;
            }
            if (color) {
                productVariantToUpdate.specs.color = color;
            }
            if (price) {
                productVariantToUpdate.price = price;
            }
            if (stock) {
                productVariantToUpdate.stock = stock;
            }
            if (isActive) {
                productVariantToUpdate.isActive = isActive;
            }

            

          
         

               if (imagesFiles && imagesFiles.length > 0) {
                        // Delete old images if exist
                        if (productVariantToUpdate.images?.length) {
                            await Promise.all(
                                productVariantToUpdate.images.map((imageUrl: string) => deleteFromCloudinary(imageUrl))
                            );
                        }
                    
                        // Upload new images
                        const uploadedImages = await Promise.all(
                            imagesFiles.map((file: File) => uploadToCloudinary(file))
                        );
                    
                        // Replace the old images array
                        productVariantToUpdate.images = uploadedImages;
                    }

                    await productVariantToUpdate.save();

            return NextResponse.json({
                success: true,
                message: "Product variant updated successfully",
                data: productVariantToUpdate,
            },
                { status: 200 }
            )
        }

        , { resourceName: "product-variant" }),
        { roles: ["admin"] }
    );

    export const DELETE = withAuth(
        withDB(async (req, context) => {
            const params = await context?.params;
            const id = params?.id;

            if (!id) {
                return NextResponse.json({
                    success: false,
                    message: "product-variant id missing",
                    status: 404
                })
            }
            const productVariantToDelete = await ProductVariant.findById(id);
            if (!productVariantToDelete) {
                return NextResponse.json({
                    success: false,
                    message: "Product variant not found",
                    status: 404
                })
            }

                if (productVariantToDelete.images && productVariantToDelete.images.length > 0) {
                        await Promise.all(
                            productVariantToDelete.images.map(async (imageUrl: string) => {
                                await deleteFromCloudinary(imageUrl);
                            })
                        );
                    }
            await productVariantToDelete.deleteOne();

            await Product.findByIdAndUpdate(productVariantToDelete.product, {
                $pull: { variants: id }
              })
            return NextResponse.json({
                success: true,
                message: "Product variant deleted successfully",
                data: productVariantToDelete,
            }, { status: 200 })
        }, { resourceName: "product-variant" }),
        { roles: ["admin"] }        
    )