"use server";

import { FRONTEND_URL } from "@/config/env";

export async function resetPasswordAction(
  token: string,
  email: string,
  password: string
) {
  try {
    const res = await fetch(`${FRONTEND_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, email, password }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Failed to reset password");

    return data;
  } catch (err) {
    throw err;
  }
}
