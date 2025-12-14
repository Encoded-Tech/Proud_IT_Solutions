"use server";

import { FRONTEND_URL } from "@/config/env";
import { redirect } from "next/navigation";

export type RegisterState = {
  error?: string;
};

export async function registerAction(
  _: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const res = await fetch(`${FRONTEND_URL}/api/auth/register`, {
    method: "POST",
    body: formData,
    credentials: "include",
    cache: "no-store",
  });

  const data = await res.json();

  if (!res.ok) {
    return {
      error: data.message || "Registration failed",
    };
  }

  
redirect(
  `/verify-email?email=${encodeURIComponent(data.data.user.newUser.email)}&expiresAt=${data.data.user.newUser.emailVerificationExpiry}`
);

}
