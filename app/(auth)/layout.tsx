"use client";

import { Suspense } from "react";
import { AuthRedirect } from "@/components/auth/AuthRedirect";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <AuthRedirect redirectTo="/">
        <div className="flex min-h-screen flex-col">
          <main className="flex-1">{children}</main>
        </div>
      </AuthRedirect>
    </Suspense>
  );
} 