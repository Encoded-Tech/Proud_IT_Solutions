"use client";

import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { toast } from "react-hot-toast";
import { forgotPasswordAction } from "@/lib/server/actions/auth/forgotPassword";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email) return setError("Email is required");

    setLoading(true);
    try {
      const data = await forgotPasswordAction(email);

      setMessage(data.message || "Check your email for instructions");
      toast.success(data.message || "Check your email for instructions");
    } catch (err: unknown) {
    console.error(err);

    // Narrow unknown to Error to safely access message
    const errorMessage =
      err instanceof Error ? err.message : "Failed to send reset email";

    setError(errorMessage);
    toast.error(errorMessage);
  } finally {
    setLoading(false);
  }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 space-y-6 text-center">
        <div className="flex justify-center">
          <div className="bg-primary/10 rounded-full p-4">
            <Mail className="text-primary h-6 w-6" />
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-gray-900">Forgot Password</h1>
        <p className="text-sm text-gray-600">
          Enter your email address and we’ll send you instructions to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-zinc-200 px-4 py-3 pr-10 text-sm placeholder:text-gray-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
              disabled={loading}
            />
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-md font-medium hover:shadow-lg transition"
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message && <p className="text-sm text-green-600">{message}</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
}
