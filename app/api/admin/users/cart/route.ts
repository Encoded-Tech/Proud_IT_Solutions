import { NextResponse } from "next/server";
import { withDB } from "@/lib/HOF";
import { withAuth } from "@/lib/HOF/withAuth";
import userModel from "@/models/userModel";

//total apis
//admin-get-all-users-carts api/admin/users/cart

const userFieldInclusion = {
  name: 1,
  email: 1,
  phone: 1,
  image: 1,
  role: 1,
  createdAt: 1,
  cart: 1,
};

export const GET = withAuth(
  withDB(async () => {
    const users = await userModel
      .find({}, userFieldInclusion)
      .populate("cart.product", "name slug price images stock")
      .populate("cart.variant", "sku price stock");

    const result = users.map(user => ({
      userId: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      image: user.image,
      role: user.role,
      createdAt: user.createdAt,
      cart: user.cart || [],
    }));

    return NextResponse.json({
      success: true,
      message: "Users and carts fetched successfully",
      data: result,
    });
  }),
  { roles: ["admin"] }
);
