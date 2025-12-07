import { uploadToCloudinary } from "@/config/cloudinary";
import { ALLOWED_EXT_FOR_PAYMENT_PROOF, ALLOWED_MIME_TYPE_FOR_PAYMENT_PROOF, MAX_SIZE_FOR_PAYMENT_PROOF } from "@/config/env";
import { getAuthUserId } from "@/lib/auth/getAuthUser";
import { withDB } from "@/lib/HOF";
import { withAuth } from "@/lib/HOF/withAuth";
import { Order } from "@/models/orderModel";
import { NextRequest, NextResponse } from "next/server";

export const POST = withAuth(
  withDB(async (req: NextRequest, _context?) => {
    const params = await _context?.params;
    const orderId = params?.id;
    const userId = getAuthUserId(req);

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID missing" },
        { status: 400 }
      );
    }

        // Verify order belongs to user
    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    if (order.paymentMethod !== "OnlineUpload") {
      return NextResponse.json(
        { success: false, message: "This order does not require uploading proof." },
        { status: 400 }
      );
    }

    if (order.paymentStatus !== "pending") {
      return NextResponse.json(
        { success: false, message: "Payment already submitted or completed." },
        { status: 400 }
      );
    }
    
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validate extension
    const ext = file.name.toLowerCase().split(".").pop();
    if (!ext || !ALLOWED_EXT_FOR_PAYMENT_PROOF.includes(ext)) {
      return NextResponse.json(
        { success: false, message: `Invalid file type. Allowed: ${ALLOWED_EXT_FOR_PAYMENT_PROOF.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate size
    if (file.size > MAX_SIZE_FOR_PAYMENT_PROOF) {
      return NextResponse.json(
        { success: false, message: "File too large. Max size 5MB." },
        { status: 400 }
      );
    }
    
    // Validate mime type
    if (!ALLOWED_MIME_TYPE_FOR_PAYMENT_PROOF.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Invalid file format" },
        { status: 400 }
      );
    }




    const imgUrl = await uploadToCloudinary(file);

    // Save details
    order.paymentProof = imgUrl;
    order.paymentStatus = "submitted";
    order.paymentSubmittedAt = new Date();
    await order.save();

    return NextResponse.json({
      success: true,
      message: "Payment proof uploaded successfully",
      data: order,
    });
  }),
  { roles: ["user"] }
);
