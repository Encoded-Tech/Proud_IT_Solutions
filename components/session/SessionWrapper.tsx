"use client";

import { useAuthSync } from "@/lib/auth/authSync";
import { SessionProvider } from "next-auth/react";


export const SessionWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <SessionProvider>
      <AuthSyncGate>{children}</AuthSyncGate>
    </SessionProvider>
  );
};

function AuthSyncGate({ children }: { children: React.ReactNode }) {
  useAuthSync(); // ✅ now safely inside SessionProvider
  return <>{children}</>;
}
