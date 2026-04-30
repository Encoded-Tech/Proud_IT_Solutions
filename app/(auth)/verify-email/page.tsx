import { Suspense } from "react";
import { connection } from "next/server";
import VerifyEmailClient from "./verify-email-client";

function VerifyEmailFallback() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-6 text-center space-y-4">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <h1 className="text-lg font-semibold">Loading verification details...</h1>
      </div>
    </div>
  );
}

export default async function VerifyEmailPage() {
  await connection();

  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailClient />
    </Suspense>
  );
}
