import { signIn, getSession } from "next-auth/react";

export interface LoginState {
  success: boolean;
  message?: string;
  error?: string;
  redirectTo?: string;
}

export async function loginAction(
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const result = await signIn("credentials", {
    email,
    password,
    redirect: false,
  });

  if (!result || !result.ok) {
    let errorMessage = result?.error || "Login failed";

    switch (result?.error) {
      case "MISSING_CREDENTIALS":
        errorMessage = "Please provide both email and password.";
        break;
      case "INVALID_CREDENTIALS":
        errorMessage = "Invalid email or password.";
        break;
      case "EMAIL_NOT_VERIFIED":
        errorMessage = "Please verify your email address first.";
        break;
      case "ACCOUNT_HARD_LOCKED":
        errorMessage =
          "Your account has been permanently locked. Contact support.";
        break;
      default:
        if (result?.error?.startsWith("ACCOUNT_TEMP_LOCKED:")) {
          const minutes = result.error.split(":")[1] || "10";
          errorMessage = `Account temporarily locked. Try again in ${minutes} minute(s).`;
        } else if (result?.error?.startsWith("INVALID_PASSWORD:")) {
          const attemptsLeft = result.error.split(":")[1] || "0";
          errorMessage = `Incorrect password. Attempts left: ${attemptsLeft}`;
        } else {
          errorMessage = "Login failed. Please try again.";
        }
    }

    return { success: false, error: errorMessage };
  }

  // ✅ FETCH SESSION AFTER LOGIN
  const session = await getSession();

  if (session?.user?.role === "admin") {
    return {
      success: true,
      message: "Welcome Admin",
      redirectTo: "/admin",
    };
  }

  return {
    success: true,
    message: "Login successful",
    redirectTo: "/",
  };
}
