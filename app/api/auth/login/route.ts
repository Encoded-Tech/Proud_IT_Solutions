import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { cookies } from "next/headers";
import { encode } from "next-auth/jwt";
import User from "@/models/userModel";
import { withDB } from "@/lib/HOF";
import { checkRequiredFields } from "@/lib/helpers/validateRequiredFields";
import { SecurityLogData } from "@/types/api";
import { HARDLOCK_THRESHOLD, HARDLOCK_WINDOW, MAX_ATTEMPTS, TEMP_LOCK_TIME } from "@/config/env";


//total apis
//user-login api/auth/login

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const POST = withDB(async (req: NextRequest, context?) => {
  const form = await req.formData();
  const email = form.get("email") as string;
  const rawPassword = form.get("password") as string;

  const requiredFields = { email, password: rawPassword };
  const missingFields = checkRequiredFields(requiredFields);
  if (missingFields) return missingFields;

  const normalizeIP = (ip: string) =>
    ip === "::1" || ip === "127.0.0.1" ? "local" : ip;

  // get ip
  const ip = normalizeIP(
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );

  // get user-agent
  const userAgent = req.headers.get("user-agent") || "unknown";

  // create simple device fingerprint
  function getDeviceFingerprint(userAgent: string) {
    if (userAgent.includes("PostmanRuntime/7.49.1")) {
      return "postman_device";
    }

    const browser = userAgent.match(/(Firefox|Chrome|Safari|Edg|Opera)/)?.[0] || "unknown_browser";
    const os = userAgent.match(/(Windows|Mac|Linux|Android|iPhone|iPad)/)?.[0] || "unknown_os";

    return crypto
      .createHash("sha256")
      .update(browser + os)
      .digest("hex")
      .substring(0, 32);
  }
  const deviceFingerprint = getDeviceFingerprint(userAgent);

  // find user with security fields
  const user = await User.findOne({ email }).select(
    "+hashedPassword +failedLoginAttempts +lockUntil +hardLock +lockCount +lastLockTime"
  );

  if (!user) {
    logSecurity("login_failed_no_user", { email, ip });
    return NextResponse.json({
      success: false,
      message: "Invalid email or password"
    }, { status: 401 });
  }

  if (!user.emailVerified) {
    logSecurity("login_failed_unverified_email", { email, ip });
    return NextResponse.json({
      success: false,
      message: "Please verify your email address before logging in."
    }, { status: 401 });
  }

  // hard lock check
  if (user.hardLock) {
    logSecurity("hard_lock_block", { email, ip });
    return NextResponse.json({
      success: false,
      message: "Your account is permanently locked. Contact support.",
    }, { status: 423 });
  }

  // temp lock check
  if (user.lockUntil && user.lockUntil > new Date()) {
    const minutesLeft = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);

    logSecurity("temp_lock_block", { email, ip, minutesLeft });

    return NextResponse.json({
      success: false,
      message: `Too many attempts. Account locked for ${minutesLeft} more minute(s).`,
    }, { status: 423 });
  }

  // reset lockCount if 24h passed
  if (user.lastLockTime && Date.now() - user.lastLockTime.getTime() > HARDLOCK_WINDOW) {
    user.lockCount = 0;
  }

  // check password
  const isPasswordValid = await bcrypt.compare(rawPassword, user.hashedPassword || "");

  if (!isPasswordValid) {
    user.failedLoginAttempts += 1;

    logSecurity("password_mismatch", {
      email,
      ip,
      attempts: user.failedLoginAttempts,
    });

    // handle lock triggers
    if (user.failedLoginAttempts >= MAX_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + TEMP_LOCK_TIME);
      user.failedLoginAttempts = 0;
      user.lockCount += 1;
      user.lastLockTime = new Date();

      // hard lock trigger
      if (user.lockCount >= HARDLOCK_THRESHOLD) {
        user.hardLock = true;
        await user.save();

        logSecurity("hard_lock_triggered", { email, ip });

        return NextResponse.json({
          success: false,
          message: "Your account has been permanently locked due to repeated failed attempts.",
        }, { status: 423 });
      }

      await user.save();

      logSecurity("temp_lock_triggered", { email, ip });

      return NextResponse.json({
        success: false,
        message: "Too many failed attempts. Account locked for 10 minutes.",
      }, { status: 423 });
    }

    await user.save();

    return NextResponse.json({
      success: false,
      message: `Incorrect password. Attempts left: ${MAX_ATTEMPTS - user.failedLoginAttempts}`,
    }, { status: 401 });
  }


  // first login check

  const isFirstLogin = user.loginHistory.length === 0;

  let isNewIP = false;
  let isNewDevice = false;
  let isSuspicious = false;

  if (!isFirstLogin) {
    const lastLog = user.loginHistory[user.loginHistory.length - 1];

    // compare IP
    isNewIP = lastLog.ip !== ip;

    // if previous login does NOT have "device" recorded → do NOT treat as suspicious
    const lastDevice = lastLog.device || deviceFingerprint;
    isNewDevice = lastDevice !== deviceFingerprint;

    isSuspicious = isNewIP || isNewDevice;
  }

  // reset counters
  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  user.lockCount = 0;
  user.hardLock = false;
  user.lastLogin = new Date();

  // push login history
  user.loginHistory.push({
    ip,
    userAgent,
    device: deviceFingerprint,
    at: new Date(),
    isNewIP,
    isNewDevice,
    isSuspicious,
  });

  // keep only last 20 logs
  if (user.loginHistory.length > 20) {
    user.loginHistory = user.loginHistory.slice(-20);
  }

  logSecurity("login_success", {
    email,
    ip,
    isNewIP,
    isNewDevice,
    userAgent,
    suspicious: isSuspicious,
  });

  await user.save();

  const safeUser = user.toObject();
  delete safeUser.hashedPassword;


  const nextAuthToken = await encode({
    token: {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      emailVerified: !!user.emailVerified,
    },
    secret: process.env.NEXTAUTH_SECRET!,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  // Set the session cookie
  const cookieStore = await cookies();
  cookieStore.set("next-auth.session-token", nextAuthToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return NextResponse.json({
    success: true,
    message: isSuspicious
      ? "Login successful (unusual activity detected)."
      : `Welcome back ${user.name}!`,
    data: {
      user: safeUser,
    },
  }, { status: 200 });
}, { resourceName: "user" });

// security logger
function logSecurity(event: string, data: SecurityLogData): void {
  console.log("[SECURITY]", event, JSON.stringify(data));
}
