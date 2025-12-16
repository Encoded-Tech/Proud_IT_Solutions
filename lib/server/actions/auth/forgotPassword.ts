"use server";

import { FRONTEND_URL } from "@/config/env";

export async function forgotPasswordAction(email: string) {
  try {
    const res = await fetch(`${FRONTEND_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Something went wrong");

    return data;
  } catch (err) {
    throw err;
  }
}
