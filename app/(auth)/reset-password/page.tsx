import { Suspense } from "react";
import { connection } from "next/server";
import ResetPasswordClient from "./reset-password-client";

function ResetPasswordFallback() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6 space-y-4 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <h1 className="text-lg font-semibold">Loading reset form...</h1>
      </div>
    </div>
  );
}

export default async function ResetPasswordPage() {
  await connection();

  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordClient />
    </Suspense>
  );
}
