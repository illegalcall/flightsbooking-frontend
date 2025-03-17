"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface AuthRedirectProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function AuthRedirect({
  children,
  redirectTo = "/",
}: AuthRedirectProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    // Timeout to prevent getting stuck in loading state
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.log("AuthRedirect: Auth check timed out");
        setHasTimedOut(true);
      }
    }, 3000); // 3-second timeout

    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  useEffect(() => {
    // Check if authentication is still loading
    if (!isLoading || hasTimedOut) {
      // If user is already authenticated, redirect to the specified path or stored redirect
      if (user) {
        const redirect = searchParams.get("redirect");
        if (redirect) {
          console.log("AuthRedirect: Redirecting to stored path:", redirect);
          router.push(redirect);
        } else {
          console.log("AuthRedirect: Redirecting to default path:", redirectTo);
          router.push(redirectTo);
        }
      }
    }
  }, [user, isLoading, router, redirectTo, searchParams, hasTimedOut]);

  // While checking authentication, show a loading state
  if (isLoading && !hasTimedOut) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        <span className="ml-2 text-sm">Checking authentication...</span>
      </div>
    );
  }

  // If not loading and user does not exist, render the children
  return !user ? <>{children}</> : null;
}
