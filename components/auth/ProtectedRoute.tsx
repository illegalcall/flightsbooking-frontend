"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import useAuthStore from "@/lib/store/useAuthStore";
import { Loader } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowUnverified?: boolean;
}

/**
 * A component that protects routes requiring authentication.
 * Provides client-side protection in addition to middleware protection.
 */
export default function ProtectedRoute({
  children,
  allowUnverified = false,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, isAuthenticated, user, refreshAuth } = useAuthStore();
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [refreshFailed, setRefreshFailed] = useState(false);

  useEffect(() => {
    // Check auth status on mount
    console.log("ProtectedRoute: Refreshing auth");
    
    let isMounted = true;
    setIsRefreshing(true);
    
    refreshAuth()
      .then(() => {
        if (isMounted) {
          console.log("ProtectedRoute: Auth refreshed successfully");
          setIsRefreshing(false);
        }
      })
      .catch((error) => {
        if (isMounted) {
          console.error("ProtectedRoute: Auth refresh failed", error);
          setIsRefreshing(false);
          setRefreshFailed(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [refreshAuth]);

  useEffect(() => {
    // Only redirect after authentication has been checked (not while refreshing)
    if (isRefreshing) return;
    
    console.log("ProtectedRoute: Auth state", {
      isLoading,
      isRefreshing,
      isAuthenticated,
      refreshFailed,
      userExists: !!user,
    });

    // If auth refresh is complete and not authenticated, redirect to login
    if (!isAuthenticated) {
      console.log("ProtectedRoute: Redirecting to login");
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // If user is authenticated but email is not verified and verification is required
    if (
      isAuthenticated &&
      !allowUnverified &&
      user?.email_confirmed_at === null
    ) {
      console.log("ProtectedRoute: Redirecting to verify email");
      router.push("/verify-email");
    }
  }, [
    isLoading,
    isRefreshing,
    isAuthenticated,
    refreshFailed,
    router,
    pathname,
    user,
    allowUnverified,
  ]);

  // Show loading state while refreshing auth
  if (isRefreshing || (isLoading && !refreshFailed)) {
    return (
      <div
        data-testid="loading"
        className="flex h-screen w-full items-center justify-center"
      >
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg font-medium">Loading...</span>
      </div>
    );
  }

  // If authenticated (and verified if required), render children
  if (
    isAuthenticated &&
    (allowUnverified || user?.email_confirmed_at !== null)
  ) {
    return <>{children}</>;
  }

  // Don't render anything while redirecting
  return null;
}
