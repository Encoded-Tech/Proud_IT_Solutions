import { NextRequest, NextResponse } from "next/server";
import { withDB } from "@/lib/HOF";
import { withAuth } from "@/lib/HOF/withAuth";
import { Product } from "@/models/productModel";

interface DiscountBody {
  discountPercent: number;           // e.g., 20 for 20%
  isOfferedPriceActive?: boolean;    // optional, default true
}

export const PUT = withAuth(
  withDB(async (req: NextRequest, _context?) => {
    const params = await _context?.params;
    const productId = params?.id;

    if (!productId) {
      return NextResponse.json({
        success: false,
        message: "Product ID is required"
      }, { status: 400 });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({
        success: false,
        message: "Product not found"
      }, { status: 404 });
    }

    const body: DiscountBody = await req.json().catch(() => ({}));
    const { discountPercent, isOfferedPriceActive } = body;

    if (discountPercent === undefined || discountPercent < 0 || discountPercent > 100) {
      return NextResponse.json({
        success: false,
        message: "Valid discountPercent (0-100) is required"
      }, { status: 400 });
    }

    // Calculate offeredPrice
    const discountAmount = (product.price * discountPercent) / 100;
    product.offeredPrice = Math.round(product.price - discountAmount);

    // Activate/deactivate offered price
    product.isOfferedPriceActive = isOfferedPriceActive !== undefined ? isOfferedPriceActive : true;
    product.discountPercent = discountPercent;

    await product.save();

    return NextResponse.json({
      success: true,
      message: `Discount applied successfully (${discountPercent}% off)`,
      data: product
    }, { status: 200 });

  }, { resourceName: "product" }),
  { roles: ["admin"] }
);


export const DELETE = withAuth(
  withDB(async (req: NextRequest, _context?) => {
    const params = await _context?.params;
    const productId = params?.id;

    if (!productId) {
      return NextResponse.json({
        success: false,
        message: "Product ID is required"
      }, { status: 400 });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({
        success: false,
        message: "Product not found"
      }, { status: 404 });
    }

    // If no discount currently active
    if (!product.isOfferedPriceActive) {
      return NextResponse.json({
        success: true,
        message: "No active discount to remove",
      }, { status: 200 });
    }

    // Remove discount
    product.offeredPrice = null;
    product.discountPercent = 0;
    product.isOfferedPriceActive = false;

    await product.save();

    return NextResponse.json({
      success: true,
      message: "Discount removed successfully",
      data: product
    }, { status: 200 });

  }, { resourceName: "product" }),
  { roles: ["admin"] }
);
