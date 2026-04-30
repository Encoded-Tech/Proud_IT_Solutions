import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/userModel";
import { withDB } from "@/lib/HOF";
import { checkRequiredFields } from "@/lib/helpers/validateRequiredFields";
import { uploadToCloudinary } from "@/config/cloudinary";
import { isStrongPassword } from "@/lib/helpers/isStrongPw";
import { sendEmail } from "@/lib/helpers/sendEmail";
import { FRONTEND_URL } from "@/config/env";
import { generateResetToken, hashToken } from "@/lib/helpers/genHashToken";
import { isMongoDuplicateError } from "@/lib/errors";
import { applyRateLimit, buildRateLimitKey } from "@/lib/security/rate-limit";

//total apis
//user-create api/auth/register

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const POST = withDB(async (req: NextRequest, context?) => {
  const form = await req.formData();

  const name = form.get("name") as string;
  const email = form.get("email") as string;
  const rawPassword = form.get("hashedPassword") as string;
  const phone = form.get("phone") as string;
  const image = form.get("image") as File | null;

  const requiredFields = { name, email, hashedPassword: rawPassword, phone };
  const missingFields = checkRequiredFields(requiredFields);
  if (missingFields) return missingFields;

  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const rateLimit = applyRateLimit(
    buildRateLimitKey(["auth-register", ip, email]),
    { limit: 5, windowMs: 30 * 60 * 1000 }
  );

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        message: `Too many registration attempts. Try again in ${rateLimit.retryAfterSeconds} seconds.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      }
    );
  }

  if (!isStrongPassword(rawPassword)) {
    return NextResponse.json({
      success: false,
      message: "Password must be strong. Minimum 8 characters, include uppercase, lowercase, number, and special symbol."
    }, { status: 400 });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    // Case 1: User exists but NOT verified
  if (!existingUser.emailVerified) {
    return NextResponse.json({
      success: false,
      message: "Email is already registered but not verified. Please verify your email to continue."
    }, { status: 403 });   
  }

  // Case 2: User exists AND verified
  return NextResponse.json({
    success: false,
    message: "Email already registered"
  }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(rawPassword, 12);

  let imageUrl: string | null = null;
  if (image && typeof image === "object") {
    const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxImageSize = 5 * 1024 * 1024;

    if (!allowedImageTypes.includes(image.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Profile image must be a JPG, PNG, or WEBP file.",
        },
        { status: 400 }
      );
    }

    if (image.size > maxImageSize) {
      return NextResponse.json(
        {
          success: false,
          message: "Profile image must be smaller than 5MB.",
        },
        { status: 400 }
      );
    }

    imageUrl = await uploadToCloudinary(image);
  }

  const signupIP =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const rawVerifyToken = generateResetToken();
  const hashedVerifyToken = hashToken(rawVerifyToken);

  // Token expires in 1 hour
  const verifyTokenExpiry = Date.now() + 1000 * 60 * 60;
let newUser;

try {
  newUser = await User.create({
    name,
    email,
    hashedPassword,
    phone,
    image: imageUrl,
    provider: "credentials",
    signupIP,
    emailVerified: false,
    emailVerificationToken: hashedVerifyToken,
    emailVerificationExpiry: verifyTokenExpiry,
  });
} catch (error: unknown) {
  if (isMongoDuplicateError(error)) {
    return NextResponse.json(
      {
        success: false,
        message: "Email already registered",
      },
      { status: 409 }
    );
  }

  // rethrow unknown errors
  throw error;
}


  const verifyUrl = `${FRONTEND_URL}/verify-email/confirm?token=${rawVerifyToken}&email=${encodeURIComponent(
    email
  )}`;

  const html = `
            <p>Hello ${newUser.name},</p>
    
            <p>Welcome to Proud IT Solutions! Please verify your email by clicking the button below:</p>
    
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
    
            <p>If you did not create this account, simply ignore this email.</p>
          `;

  try {
    await sendEmail({
      to: newUser.email!,
      subject: "Verify your email - Proud IT Solutions",
      html,
      text: `Verify your email: ${verifyUrl}`,
    });
  } catch (err) {
    console.error("❌ Failed sending verification email:", err);
  }

  return NextResponse.json({
    success: true,
    message: `Thanks for registering, ${newUser.name}! Please check your email to verify your account.`,
   data: {
          email: newUser.email,
          emailVerificationExpiry: verifyTokenExpiry,
    }
  })

}, { resourceName: "user" });



