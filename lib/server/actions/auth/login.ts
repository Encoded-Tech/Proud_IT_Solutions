"use server";
import { redirect } from "next/navigation";
import { FRONTEND_URL } from "@/config/env";

export type LoginState = {
  error?: string;
};

export async function loginAction(_: LoginState, formData: FormData): Promise<LoginState> {
  const res = await fetch(`${FRONTEND_URL}/api/auth/login`, {
    method: "POST",
    body: formData,
    credentials: "include",
    cache: "no-store",
  });

  const data = await res.json();

  if (!res.ok) {
    if (data.email && data.expiresAt) {
      // Redirect to verify-email page
      redirect(`/verify-email?email=${encodeURIComponent(data.email)}&expiresAt=${data.expiresAt}`);
    }
    return { error: data.message || "Login failed" };
  }

  redirect("/"); 
}
