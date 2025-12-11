
import { deleteFromCloudinary, uploadToCloudinary } from "@/config/cloudinary";
import { withDB } from "@/lib/HOF";
import { withAuth } from "@/lib/HOF/withAuth";
import { IProduct, Product } from "@/models/productModel";
import { ApiResponse } from "@/types/api";
import { NextResponse } from "next/server";

//total apis
//product-get-by-slug api/product/[slug]
//product-update-by-slug api/product/[slug]
//product-delete-by-slug api/product/[slug]

// product-get-by-slug api/product/[slug]
export const GET = withDB(async (req, _context?) => {
    const params = await _context?.params;
    const slug = params?.slug;

    if (!slug) {
        return NextResponse.json({
            success: false,
            message: "product slug missing",
            status: 404
        })
    }
    const singleProduct = await Product.findOne({ slug }).populate("category", "categoryName");

    const hasProducts = !!singleProduct;
    const response: ApiResponse<IProduct[]> = {
        success: hasProducts,
        message: hasProducts ? "Single product Fetched Successfully" : "product not found",
        data: singleProduct,
        status: hasProducts ? 200 : 400
    }
    return NextResponse.json(response, { status: response.status })
}, { resourceName: "product" });

// product-update-by-slug api/product/[slug]
export const PUT = withAuth(
    withDB(async (req, _context?) => {

        const params = await _context?.params;
        const slug = params?.slug;

        if (!slug) {
            return NextResponse.json({
                success: false,
                message: "product slug missing",
                status: 404
            })
        }

        const productToUpdate = await Product.findOne({ slug });
        if (!productToUpdate) {
            return NextResponse.json({
                success: false,
                message: "Product not found",
                status: 404
            })
        }
        const formData = await req.formData();
        const name = formData.get("name") as string;
        const price = formData.get("price") as string;
        const description = formData.get("description") as string;
        const category = formData.get("category") as string;
       const rawStock = formData.get("stock") as string;
const stock = rawStock ? parseInt(rawStock, 10) : undefined;
        const images = formData.getAll("images") as File[];
        const variants = formData.get("variants") as string | null;
        const isActive = formData.get("isActive") as string;

        if (name) {
            productToUpdate.name = name;
        }
        if (price) {
            productToUpdate.price = Number(price);
        }

        if (description) {
            productToUpdate.description = description;
        }
        if (category) {
            productToUpdate.category = category;
        }
      if (stock !== undefined && !isNaN(stock)) {
    productToUpdate.stock = stock;
}

        if (images && images.length > 0) {
            // Delete old images if exist
            if (productToUpdate.images?.length) {
                await Promise.all(
                    productToUpdate.images.map((imageUrl: string) => deleteFromCloudinary(imageUrl))
                );
            }

            // Upload new images
            const uploadedImages = await Promise.all(
                images.map((file: File) => uploadToCloudinary(file))
            );

            // Replace the old images array
            productToUpdate.images = uploadedImages;
        }

        if (variants) {
            productToUpdate.variants = variants;
        }
       if (isActive !== undefined) {
    productToUpdate.isActive = isActive === "true";
}

        await productToUpdate.save();

        return NextResponse.json({
            success: true,
            message: "Product updated successfully",
            data: productToUpdate,
        }, { status: 200 })
    }, { resourceName: "product" }),
    { roles: ["admin"] }
)
// product-delete-by-slug api/product/[slug]
export const DELETE = withAuth(
    withDB(async (req, _context?) => {

        const params = await _context?.params;
        const slug = params?.slug;

        if (!slug) {
            return NextResponse.json({
                success: false,
                message: "product slug missing",
                status: 404
            })
        }

        const productToDelete = await Product.findOne({ slug });
        if (!productToDelete) {
            return NextResponse.json(
                { success: false, message: "Product not found" },
                { status: 404 }
            );
        }

        if (productToDelete.images && productToDelete.images.length > 0) {
            await Promise.all(
                productToDelete.images.map(async (imageUrl: string) => {
                    await deleteFromCloudinary(imageUrl);
                })
            );
        }

        await productToDelete.deleteOne();

        return NextResponse.json({
            success: true,
            message: "Product deleted successfully",
            data: productToDelete,
        }, { status: 200 })
    }, { resourceName: "product" }),
    { roles: ["admin"] }
);