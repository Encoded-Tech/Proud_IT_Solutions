import { NextRequest, NextResponse } from "next/server";
import { withDB } from "@/lib/HOF";
import User from "@/models/userModel";
import bcrypt from "bcryptjs";
import { hashToken } from "@/lib/helpers/genHashToken";
import { isStrongPassword } from "@/lib/helpers/isStrongPw";
import { checkRequiredFields } from "@/lib/helpers/validateRequiredFields";
import { sendEmail } from "@/lib/helpers/sendEmail";


//total apis
//reset-password-post api/auth/reset-password


// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const POST = withDB(async (req: NextRequest, context?) => {
  const body = await req.json().catch(() => ({}));
  const token = (body.token || "").toString();
  const email = (body.email || "").toString().trim().toLowerCase();
  const password = (body.password || "").toString();

  const requiredFields = { token, email, password };
  const missingFields = checkRequiredFields(requiredFields);
  if (missingFields) return missingFields;

  if (!isStrongPassword(password)) {
    return NextResponse.json({
      success: false,
      message: "Password must be at least 8 characters and include upper, lower, number and symbol."
    }, { status: 400 });
  }

  const tokenHash = hashToken(token);

  // find user with matching hashed token and expiry not passed
  const user = await User.findOne({
    email,
    resetPasswordToken: tokenHash,
    resetPasswordExpiry: { $gt: new Date() },
  }).select("+hashedPassword +resetPasswordToken +resetPasswordExpiry");

  if (!user) {
    return NextResponse.json({
      success: false,
      message: "Invalid or expired token"
    }, { status: 400 });
  }

  // all good => set new hashed password and remove token fields
  const hashed = await bcrypt.hash(password, 12);
  user.hashedPassword = hashed;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;
  user.lastActiveAt = new Date();
  await user.save();

  const html = ` 
    <p>Hello ${user.name || ""},</p>
      <p>Your password has been changed.</p>
      <p>If you did not request this, you can safely ignore this email.</p>
      <p>— Proud IT Solutions</p>`

  try {
    await sendEmail({
      to: user.email,
      subject: "Password changed",
      html
    })
  } catch (err) {
    console.error("Failed sending password changed email email", err);
  }

  return NextResponse.json({
    success: true,
    message: "Password updated. You can now log in."
  }, { status: 200 });
}, { resourceName: "user" });