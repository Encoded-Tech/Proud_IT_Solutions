import { FRONTEND_URL } from "@/config/env";
import { generateResetToken, hashToken } from "@/lib/helpers/genHashToken";
import { sendEmail } from "@/lib/helpers/sendEmail";
import { withDB } from "@/lib/HOF";
import userModel from "@/models/userModel";
import { NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const POST = withDB(async (req, context?) => {
    const body = await req.json();
    const email = body.email;
    if (!email) {
        return NextResponse.json({
            success: false,
            message: "Email is required"
        }, { status: 400 });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
        return NextResponse.json({
            success: false,
            message: "User not found"
        }, { status: 404 });
    }

    if (user.emailVerified) {
        return NextResponse.json({
            success: false,
            message: "Email is already verified"
        }, { status: 400 });
    }
    // 1️⃣ Generate a NEW verification token
    const rawVerifyToken = generateResetToken();
    const hashedVerifyToken = hashToken(rawVerifyToken);

    // 2️⃣ Save hashed token + expiry to DB
    user.emailVerificationToken = hashedVerifyToken;
    user.emailVerificationExpiry = Date.now() + 1000 * 60 * 60; // 1 hour
    await user.save();

    // 3️⃣ Create verification URL  
    const verifyUrl = `${FRONTEND_URL}/verify-email/confirm?token=${rawVerifyToken}&email=${encodeURIComponent(email)}`;

    // 4️⃣ Build email HTML
    const html = `
    <p>Hello ${user.name},</p>

    <p>Please verify your email by clicking the button below:</p>

    <p>
      <a href="${verifyUrl}" style="
        display: inline-block;
        background: #2563eb;
        color: white;
        padding: 10px 16px;
        border-radius: 6px;
        text-decoration: none;
      ">Verify Email</a>
    </p>

    <p>This link will expire in 1 hour.</p>
  `;

    // 5️⃣ Send email
    await sendEmail({
        to: user.email!,
        subject: "Verify Your Email - Proud IT Solutions",
        html,
        text: `Verify your email: ${verifyUrl}`,
    });

    return NextResponse.json({
        success: true,
        message: "Verification email resent!",
        email: user.email,
        expiresAt: user.emailVerificationExpiry,

    });

}, { resourceName: "user" });
