"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MailCheck, Loader2, RotateCw } from "lucide-react";
import { resendVerificationEmailAction, verifyEmailAction } from "@/lib/server/actions/auth/verifyEmail";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email");
  const token = searchParams.get("token"); // if present from email link
const expiresFromUrl = searchParams.get("expiresAt");
const [expiresAt, setExpiresAt] = useState<number | null>(
  expiresFromUrl ? new Date(expiresFromUrl).getTime() : null
);


  const [timeLeft, setTimeLeft] = useState("—");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">("idle");




useEffect(() => {
  if (message.toLowerCase().includes("already verified")) {
    const timer = setTimeout(() => {
      router.replace("/login");
    }, 2500); 
    return () => clearTimeout(timer);
  }
}, [message, router]);

  // Countdown effect
  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => {
      const diff = expiresAt - Date.now();
      if (diff <= 0) {
        setTimeLeft("Expired");
        clearInterval(interval);
        return;
      }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  // Auto verify if token exists in URL
  useEffect(() => {
    if (!token || !email) return;

        const verifyEmail = async () => {
      setStatus("verifying");
      try {
        const data = await verifyEmailAction(token, email);
        setStatus("success");
        setMessage(data.message);
        setTimeout(() => router.replace("/login"), 2000);
      } catch (err: unknown) {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Verification failed.");
        setTimeout(() => router.replace(`/verify-email?email=${encodeURIComponent(email)}&expiresAt=${Date.now()}`), 2000);
      }
    };

    verifyEmail();
  }, [token, email, router]);

  // Resend email
  const resendVerification = async () => {
    if (!email) return setMessage("Missing email.");

    setLoading(true);
    setMessage("");

    try {
      const data = await resendVerificationEmailAction(email);
      setExpiresAt(new Date(data.expiresAt).getTime());
      setCooldown(60);
      router.replace(`/verify-email?email=${encodeURIComponent(email)}&expiresAt=${data.expiresAt}`);
      setMessage("Verification email resent successfully.");
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Resend failed.");
    } finally {
      setLoading(false);
    }
  };


  // Cooldown effect
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown(c => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-6 text-center space-y-6">

        {status === "verifying" && (
          <>
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <h1 className="text-lg font-semibold">Verifying your email…</h1>
            <p className="text-sm text-muted-foreground">{message}</p>
          </>
        )}

        {(status === "idle" || status === "success" || status === "error") && (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              {status === "success" ? <MailCheck className="h-7 w-7 text-green-600" /> : <MailCheck className="h-7 w-7 text-primary" />}
            </div>

            <h1 className="text-2xl font-semibold text-gray-900">Verify your email</h1>

            <p className="text-sm text-gray-600 leading-relaxed">
              We’ve sent a verification link to <span className="font-medium">{email}</span>.
              Please check your inbox and click the link to activate your account.
            </p>

            <p className="text-sm">
              Link expires in <span className="font-semibold text-primary">{timeLeft}</span>
            </p>

            <button
              onClick={resendVerification}
              disabled={loading || cooldown > 0}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-white disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCw className="h-4 w-4" />}
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend verification email"}
            </button>

            {message && <p className="text-xs text-muted-foreground">{message}</p>}
          </>
        )}
      </div>
    </div>
  );
}
