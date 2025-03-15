"use client";

import { AuthRedirect } from "@/components/auth/AuthRedirect";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthRedirect redirectTo="/">
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">{children}</main>
      </div>
    </AuthRedirect>
  );
} 