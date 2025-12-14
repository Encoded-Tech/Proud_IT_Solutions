"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MailCheck, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmailConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token || !email) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(
          `/api/auth/verify-email?token=${token}&email=${email}`,
          { method: "POST" }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message);
        }

        setStatus("success");
        setMessage(data.message);

        setTimeout(() => {
          router.replace("/login");
        }, 2500);

      } catch (err: unknown) {
        setStatus("error");
        setMessage(   err instanceof Error ? err.message : "Verification failed.");
      }
    };

    verify();
  }, [token, email, router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border p-6 text-center space-y-4">

        {status === "loading" && (
          <>
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <h1 className="text-lg font-semibold">Verifying your email…</h1>
          </>
        )}

        {status === "success" && (
          <>
            <MailCheck className="mx-auto h-8 w-8 text-green-600" />
            <h1 className="text-lg font-semibold">Email verified 🎉</h1>
            <p className="text-sm text-muted-foreground">{message}</p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="mx-auto h-8 w-8 text-red-600" />
            <h1 className="text-lg font-semibold">Verification failed</h1>
            <p className="text-sm text-muted-foreground">{message}</p>
          </>
        )}

      </div>
    </div>
  );
}
