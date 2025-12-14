"use server";

import { FRONTEND_URL } from "@/config/env";

export async function verifyEmailAction(token: string, email: string) {
  try {
    const res = await fetch(`${FRONTEND_URL}/api/auth/verify-email?token=${token}&email=${email}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Verification failed");

    return data;
  } catch (err) {
    throw err;
  }
}

export async function resendVerificationEmailAction(email: string) {
  try {
    const res = await fetch(`${FRONTEND_URL}/api/auth/resend-verification-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Resend failed");

    return data;
  } catch (err) {
    throw err;
  }
}
