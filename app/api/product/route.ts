import { uploadToCloudinary } from "@/config/cloudinary";
import { checkRequiredFields } from "@/lib/helpers/validateRequiredFields";
import { withDB } from "@/lib/HOF";
import { withAuth } from "@/lib/HOF/withAuth";
import { Product } from "@/models";
import { IProduct } from "@/models/productModel";
import { ApiResponse } from "@/types/api";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

//total apis
//product-get-all api/product 
//product-create api/product

function revalidateProductCaches(slug?: string) {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/product");
  revalidateTag("products", "max");
  revalidateTag("homepage", "max");
  if (slug) {
    revalidateTag(`product:${slug}`, "max");
    revalidatePath(`/products/${slug}`);
  }
}

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
    try {
      const formData = await req.formData();

      /* -------------------------------------------------------------------------- */
      /*                               BASIC FIELDS                                  */
      /* -------------------------------------------------------------------------- */

      const name = formData.get("name") as string;
      const priceRaw = formData.get("price") as string;
      const priceNumber = Number(priceRaw);

      const stock = parseInt(formData.get("stock") as string, 10) || 0;
      const description = formData.get("description") as string;
      const category = formData.get("category") as string;

      const images = formData.getAll("images") as File[];

      const variantsRaw = formData.get("variants") as string | null;
      const variants = variantsRaw ? JSON.parse(variantsRaw) : [];

      const isActiveRaw = formData.get("isActive");
      const isActive = isActiveRaw === null ? true : isActiveRaw === "true";

      /* -------------------------------------------------------------------------- */
      /*                                   TAGS                                     */
      /* -------------------------------------------------------------------------- */

      // expecting '[{"name":"tag1"},{"name":"tag2"}]'
      const tagsRaw = formData.get("tags") as string | null;
      const tags = tagsRaw
        ? (JSON.parse(tagsRaw) as { id?: string; name: string }[]).map(tag => ({
            id: tag.id || new Types.ObjectId().toString(),
            name: tag.name,
          }))
        : [];

      /* -------------------------------------------------------------------------- */
      /*                                   BRAND                                    */
      /* -------------------------------------------------------------------------- */

      // Simple embedded brand (NO separate Brand schema)
      const brandName = (formData.get("brandName") as string) || "";

      /* -------------------------------------------------------------------------- */
      /*                                   OFFERS                                   */
      /* -------------------------------------------------------------------------- */

      const discountPercentRaw = formData.get("discountPercent");
      const discountPercent = discountPercentRaw
        ? Number(discountPercentRaw)
        : 0;

      const offerStartDateRaw = formData.get("offerStartDate") as string | null;
      const offerEndDateRaw = formData.get("offerEndDate") as string | null;

      const offerStartDate = offerStartDateRaw
        ? new Date(offerStartDateRaw)
        : null;

      const offerEndDate = offerEndDateRaw
        ? new Date(offerEndDateRaw)
        : null;

      let offeredPrice = 0;
      let isOfferedPriceActive = false;

      if (discountPercent > 0) {
        offeredPrice = Math.round(
          priceNumber - (priceNumber * discountPercent) / 100
        );
        isOfferedPriceActive = true;
      }

      /* -------------------------------------------------------------------------- */
      /*                              VALIDATIONS                                   */
      /* -------------------------------------------------------------------------- */

      const missingFields = checkRequiredFields({
        name,
        price: priceRaw,
        category,
        stock,
        brandName
      });

      if (missingFields) return missingFields;

      if (!Number.isFinite(priceNumber) || priceNumber < 0) {
        return NextResponse.json(
          { success: false, message: "Price must be a valid non-negative number" },
          { status: 400 }
        );
      }

      if (!category || !Types.ObjectId.isValid(category)) {
        return NextResponse.json(
          { success: false, message: "A valid category is required" },
          { status: 400 }
        );
      }

      const invalidImage = images.find(
        (image) =>
          image.size > 0 &&
          (!["image/jpeg", "image/png", "image/webp"].includes(image.type) ||
            image.size > 10 * 1024 * 1024)
      );

      if (invalidImage) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Product images must be JPG, PNG, or WebP and no larger than 10MB each",
          },
          { status: 400 }
        );
      }

      /* -------------------------------------------------------------------------- */
      /*                                   SLUG                                     */
      /* -------------------------------------------------------------------------- */

      const slug = name.toLowerCase().replace(/\s+/g, "-");
      const existingProduct = await Product.findOne({
        $or: [{ name }, { slug }],
      });

      if (existingProduct) {
        return NextResponse.json(
          { success: false, message: `Product '${name}' already exists` },
          { status: 409 }
        );
      }

      /* -------------------------------------------------------------------------- */
      /*                              IMAGE UPLOAD                                  */
      /* -------------------------------------------------------------------------- */

      const imageUrls: string[] = [];
      for (const img of images) {
        if (img && img.size > 0) {
          const url = await uploadToCloudinary(img);
          imageUrls.push(url);
        }
      }

      /* -------------------------------------------------------------------------- */
      /*                              CREATE PRODUCT                                */
      /* -------------------------------------------------------------------------- */

      const product = await Product.create({
        name,
        slug,
        description,
        price: priceNumber,
        stock,
        reservedStock: 0,

        category,
        images: imageUrls,
        variants,

        tags,

        brandName,
       

        discountPercent,
        offeredPrice,
        isOfferedPriceActive,
        offerStartDate,
        offerEndDate,

        avgRating: 0,
        totalReviews: 0,
        totalSales: 0,

        isActive,
      });

      revalidateProductCaches(product.slug);

      return NextResponse.json({
        success: true,
        message: "Product created successfully",
        data: product,
      });
    } catch (err) {
      console.error("Create Product Error:", err);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to create product",
        },
        { status: 500 }
      );
    }
  }, { resourceName: "product" }),
  { roles: ["admin"] }
);






