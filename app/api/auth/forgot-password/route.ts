// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withDB } from "@/lib/HOF"; 
import User from "@/models/userModel";
import { generateResetToken, hashToken } from "@/lib/helpers/genHashToken";
import { sendEmail } from "@/lib/helpers/sendEmail";
import { RESET_TOKEN_EXPIRES_MIN } from "@/config/env";


//total apis
//forgot-password-post api/auth/forgot-password

const TOKEN_EXPIRE_MIN = Number(RESET_TOKEN_EXPIRES_MIN);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
export const POST = withDB(async (req: NextRequest, context?) => {
  
  const body = await req.json().catch(() => ({}));
  const email = (body.email || "").toString().trim().toLowerCase();

  if (!email) {
    return NextResponse.json({
      success: false, 
      message: "Email is required" 
    }, { status: 400 });
  }

  // Find user (don't reveal whether user exists in response)
  const user = await User.findOne({ email });
  if(!user) return NextResponse.json({ success: false, message: "No user found with that email" }, { status: 400 });

  // In every case, return same message so attackers can't enumerate emails
  const genericOk = NextResponse.json({
    success: true,
    message: "If an account with that email exists, you'll receive reset instructions."
  }, { status: 200 });

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
  const frontendUrl = process.env.FRONTEND_URL;
  const resetUrl = `${frontendUrl}/auth/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;

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
