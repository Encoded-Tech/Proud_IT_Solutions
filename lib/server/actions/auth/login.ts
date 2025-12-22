
import { signIn } from "next-auth/react";

export type LoginState = {
  success?: boolean;
  error?: string;
  message?: string;
};

export async function loginAction(formData: FormData): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const result = await signIn("credentials", {
    email,
    password,
    redirect: false,
  });

  // guard against undefined
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
        errorMessage = "Your account has been permanently locked. Contact support.";
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
        break;
    }

    return { success: false, error: errorMessage };
  }

  return { success: true, message: "Login successful" };
}
