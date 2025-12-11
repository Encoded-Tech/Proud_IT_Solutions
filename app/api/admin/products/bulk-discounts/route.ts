import { NextRequest, NextResponse } from "next/server";
import { withDB } from "@/lib/HOF";
import { withAuth } from "@/lib/HOF/withAuth";
import { Product } from "@/models/productModel";

interface BulkDiscountBody {
  productIds: string[];
  discountPercent: number;
  isOfferedPriceActive?: boolean;
}

export const PUT = withAuth(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  withDB(async (req: NextRequest, context?) => {
    const body: BulkDiscountBody = await req.json().catch(() => ({}));

    const { productIds, discountPercent, isOfferedPriceActive } = body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({
        success: false,
        message: "productIds array is required"
      }, { status: 400 });
    }

   if (discountPercent === undefined || discountPercent < 0 || discountPercent > 100) {
      return NextResponse.json({
        success: false,
        message: "Valid discountPercent (0-100) is required"
      }, { status: 400 });
    }

    const products = await Product.find({ _id: { $in: productIds } });

    const bulkOps = products.map(product => {
      const discountAmount = (product.price * discountPercent) / 100;
      const offeredPrice = Math.round(product.price - discountAmount);
     

      return {
        updateOne: {
          filter: { _id: product._id },
          update: {
            $set: {
              offeredPrice,
              discountPercent,
              isOfferedPriceActive: isOfferedPriceActive !== undefined ? isOfferedPriceActive : true,
            }
          }
        }
      };
    });

    await Product.bulkWrite(bulkOps);

    const updatedProducts = await Product.find({ _id: { $in: productIds } });

    return NextResponse.json({
      success: true,
      message: `Discount ${discountPercent}% applied to ${productIds.length} products`,
      data: updatedProducts
    });

  }, { resourceName: "product" }),
  { roles: ["admin"] }
);


interface BulkDeleteDiscountBody {
  productIds: string[];
}

export const DELETE = withAuth(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  withDB(async (req: NextRequest, context?) => {
    const body: BulkDeleteDiscountBody = await req.json().catch(() => ({}));
    const { productIds } = body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({
        success: false,
        message: "productIds array is required"
      }, { status: 400 });
    }

    const products = await Product.find({ _id: { $in: productIds } });

    if (!products.length) {
      return NextResponse.json({
        success: false,
        message: "No valid products found for discount removal"
      }, { status: 404 });
    }

    const bulkOps = products.map(product => ({
      updateOne: {
        filter: { _id: product._id },
        update: {
          $set: {
            offeredPrice: null,
            discountPercent: 0,
            isOfferedPriceActive: false
          }
        }
      }
    }));

    await Product.bulkWrite(bulkOps);

    const updatedProducts = await Product.find({ _id: { $in: productIds } });

    return NextResponse.json({
      success: true,
      message: `Discount removed from ${products.length} products`,
      data: updatedProducts
    });

  }, { resourceName: "product" }),
  { roles: ["admin"] }
);