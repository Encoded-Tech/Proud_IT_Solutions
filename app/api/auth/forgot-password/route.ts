// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withDB } from "@/lib/HOF"; 
import User from "@/models/userModel";
import { generateResetToken, hashToken } from "@/lib/helpers/genHashToken";
import { sendEmail } from "@/lib/helpers/sendEmail";
import { buildAppUrl, RESET_TOKEN_EXPIRES_MIN } from "@/config/env";
import { applyRateLimit, buildRateLimitKey } from "@/lib/security/rate-limit";


//total apis
//forgot-password-post api/auth/forgot-password

const TOKEN_EXPIRE_MIN = Number(RESET_TOKEN_EXPIRES_MIN);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
export const POST = withDB(async (req: NextRequest, context?) => {
  
  const body = await req.json().catch(() => ({}));
  const email = (body.email || "").toString().trim().toLowerCase();
  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (!email) {
    return NextResponse.json({
      success: false, 
      message: "Email is required" 
    }, { status: 400 });
  }

  // Find user (don't reveal whether user exists in response)
  // In every case, return same message so attackers can't enumerate emails
  const genericOk = NextResponse.json({
    success: true,
    message: "If an account with that email exists, you'll receive reset instructions."
  }, { status: 200 });

  const rateLimit = applyRateLimit(
    buildRateLimitKey(["auth-forgot-password", ip, email]),
    { limit: 5, windowMs: 30 * 60 * 1000 }
  );

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        message: `Too many reset requests. Try again in ${rateLimit.retryAfterSeconds} seconds.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      }
    );
  }

  const user = await User.findOne({ email });

  if (!user) return genericOk;

  // Generate token and store its hash + expiry in DB
  const token = generateResetToken(32); // plaintext token will be emailed
  const tokenHash = hashToken(token);
  const expiry = new Date(Date.now() + TOKEN_EXPIRE_MIN * 60 * 1000);

  // Persist hashed token (select: false) and expiry
  user.resetPasswordToken = tokenHash;
  user.resetPasswordExpiry = expiry;
  await user.save();

  // Send email
  const resetUrl = buildAppUrl(
    `/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`
  );

  const html = `
    <p>Hello ${user.name || ""},</p>
    <p>We received a request to reset your password. Click the link below to set a new password. This link expires in ${TOKEN_EXPIRE_MIN} minutes.</p>
    <p><a href="${resetUrl}">Reset your password</a></p>
    <p>If you did not request this, you can safely ignore this email.</p>
    <p>— Proud IT Solutions</p>
  `;
  
  try {
    await sendEmail({
      to: user.email,
      subject: "Reset your ProudIT Solutions password",
      html,
    });
  } catch (err) {

    console.error("Failed sending reset email", err);
    // We might want to clear token if email failed:
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();
    // still respond generically
    return genericOk;
  }

  return genericOk;
}, { resourceName: "auth" });
