import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import { withDB } from "@/lib/HOF";
import { hashToken } from "@/lib/helpers/genHashToken";

//total apis
//verify-email-post api/auth/verify-email

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const POST = withDB(async (req: NextRequest, context?) => {
  const { searchParams } = new URL(req.url);

  const token = searchParams.get("token")?.trim();
  const email = searchParams.get("email")?.trim();

  if (!token || !email) {
    return NextResponse.json({
      success: false,
      message: "Missing token or email"
    }, { status: 400 });
  }

  const hashedToken = hashToken(token);

  // Find user with matching token and unexpired link
  const user = await User.findOne({
    email,
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return NextResponse.json({
      success: false,
      message: "Invalid or expired verification token"
    }, { status: 400 });
  }

  // Mark email as verified
  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;

  await user.save();

  return NextResponse.json({
    success: true,
    message: "Email successfully verified. You can now log in.",
  }, { status: 200 });
}, { resourceName: "user" });
