
import { withDB } from "@/lib/HOF";
import { withAuth } from "@/lib/HOF/withAuth";
import userModel, { ICartItem } from "@/models/userModel";
import { NextResponse } from "next/server";

//total apis
//admin-get-single-user's-carts-item api/admin/users/cart/[id]
const userFieldInclusion = {
  name: 1,
  email: 1,
  phone: 1,
  image: 1,
  role: 1,
 
 
};

export const GET = withAuth(

    withDB( async (req, _context?) => {
        const params = await _context?.params;
        const cartId = params?.id;

        if (!cartId) {
          return NextResponse.json(
            { success: false, message: "userId is required" },
            { status: 400 }
          );
        }

          const user = await userModel
      .findOne({ "cart._id": cartId },  userFieldInclusion)
      .select("name email cart")
      .populate("cart.product", "name slug price images stock")
      .populate("cart.variant", "sku price stock");

     if (!user) {
      return NextResponse.json(
        { success: false, message: "Cart item not found" },
        { status: 404 }
      );
    }

     const cartItem = user.cart.find((item: ICartItem)  => item._id.toString() === cartId);

    return NextResponse.json({
      success: true,
      message: "Cart item fetched successfully",
      data: {
        user: {
           id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image,
        role: user.role,
        },
        cartItem,
      },
    });
  }),
  { roles: ["admin"] }
);