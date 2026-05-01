import { signIn } from "next-auth/react";

export interface LoginState {
  success: boolean;
  message?: string;
  error?: string;
  redirectTo?: string;
}

function loginErrorMessage(error?: string | null) {
  switch (error) {
    case "MISSING_CREDENTIALS":
      return "Please provide both email and password.";
    case "EMAIL_NOT_VERIFIED":
      return "Please verify your email address first.";
    case "ACCOUNT_HARD_LOCKED":
      return "Your account has been permanently locked. Contact support.";
    case "USE_GOOGLE_LOGIN":
      return "Please login using Google for this account.";
    default:
      if (error?.startsWith("ACCOUNT_TEMP_LOCKED:")) {
        const minutes = error.split(":")[1] || "10";
        return `Account temporarily locked. Try again in ${minutes} minute(s).`;
      }
      return "Invalid email or password.";
  }
}

async function waitForSessionRole() {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const response = await fetch("/api/auth/session", {
      cache: "no-store",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });

    if (response.ok) {
      const session = await response.json();
      if (session?.user?.role) return session.user.role as "admin" | "user";
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return null;
}

export async function loginAction(
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  let result;
  try {
    result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : null;
    return { success: false, error: loginErrorMessage(message) };
  }

  if (!result?.ok || result.error) {
    return { success: false, error: loginErrorMessage(result?.error) };
  }

  // ✅ FETCH SESSION AFTER LOGIN
  const role = await waitForSessionRole();

  if (!role) {
    return { success: false, error: "Invalid email or password." };
  }

  if (role === "admin") {
    return {
      success: true,
      message: "Welcome Admin",
      redirectTo: "/admin",
    };
  }

  return {
    success: true,
    message: "Login successful",
    redirectTo: "/account",
  };
}
