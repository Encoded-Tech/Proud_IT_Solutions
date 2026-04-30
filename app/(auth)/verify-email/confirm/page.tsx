import { Suspense } from "react";
import { connection } from "next/server";
import VerifyEmailConfirmClient from "./verify-email-confirm-client";

function VerifyEmailConfirmFallback() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border p-6 text-center space-y-4">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <h1 className="text-lg font-semibold">Preparing verification...</h1>
      </div>
    </div>
  );
}

export default async function VerifyEmailConfirmPage() {
  await connection();

  return (
    <Suspense fallback={<VerifyEmailConfirmFallback />}>
      <VerifyEmailConfirmClient />
    </Suspense>
  );
}
